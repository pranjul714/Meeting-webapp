import { Server } from "socket.io"
import { Meeting } from "../models/meeting.model.js"

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED")

        socket.on("join-call", async (path) => {
            // Extract meeting code from path (handles full URL or just code)
            const meetingCode = path.split("/").pop();

            // Check if meeting is locked in database
            try {
                const meeting = await Meeting.findOne({ meetingCode });
                if (meeting && meeting.isLocked) {
                    socket.emit("room-locked");
                    return;
                }

                if (connections[path] === undefined) {
                    connections[path] = []
                }
                connections[path].push(socket.id)
                timeOnline[socket.id] = new Date();

                for (let a = 0; a < connections[path].length; a++) {
                    io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
                }

                // Load and emit chat history from DB
                if (meeting && meeting.chatHistory) {
                    meeting.chatHistory.forEach(msg => {
                        socket.emit("chat-message", msg.data, msg.sender, "system-history");
                    });
                }
            } catch (err) {
                console.error("Join call error:", err);
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", async (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                
                // Save to Database for persistence
                try {
                    const meetingCode = matchingRoom.split("/").pop();
                    await Meeting.findOneAndUpdate(
                        { meetingCode },
                        { $push: { chatHistory: { sender, data } } }
                    );
                } catch (err) {
                    console.error("Save chat error:", err);
                }

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        // Host Control: Toggle Room Lock
        socket.on("toggle-lock", async (meetingCode, lockedStatus) => {
            try {
                await Meeting.findOneAndUpdate({ meetingCode }, { isLocked: lockedStatus });
                // Notify all participants in that room
                const [matchingRoom] = Object.entries(connections).find(([k, v]) => k.includes(meetingCode)) || [null];
                if (matchingRoom) {
                    io.to(matchingRoom).emit("room-lock-updated", lockedStatus);
                }
            } catch (err) {
                console.error("Toggle lock error:", err);
            }
        });

        // Host Control: Mute All
        socket.on("host-mute-all", (meetingCode) => {
            const [matchingRoom] = Object.entries(connections).find(([k, v]) => k.includes(meetingCode)) || [null];
            if (matchingRoom) {
                io.to(matchingRoom).emit("force-mute-all");
            }
        });

        socket.on("disconnect", () => {
            var key
            for (const [k, v] of Object.entries(connections)) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }
                        var index = connections[key].indexOf(socket.id)
                        connections[key].splice(index, 1)
                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }
            }
        })
    })

    return io;
}

