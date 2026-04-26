import { Server } from "socket.io"
import { Meeting } from "../models/meeting.model.js"

let connections = {}
let socketToRoom = {} // New: maps socket.id -> path
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

                if (connections[meetingCode] === undefined) {
                    connections[meetingCode] = []
                }
                connections[meetingCode].push(socket.id)
                socketToRoom[socket.id] = meetingCode // Use meetingCode instead of path
                timeOnline[socket.id] = new Date();

                connections[meetingCode].forEach(socketId => {
                    io.to(socketId).emit("user-joined", socket.id, connections[meetingCode])
                });

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
            const meetingCode = socketToRoom[socket.id];

            if (meetingCode) {
                if (messages[meetingCode] === undefined) {
                    messages[meetingCode] = []
                }

                messages[meetingCode].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                
                // Save to Database asynchronously
                Meeting.findOneAndUpdate(
                    { meetingCode },
                    { $push: { chatHistory: { sender, data } } }
                ).catch(err => console.error("Save chat error:", err));

                connections[meetingCode].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        // Host Control: Toggle Room Lock
        socket.on("toggle-lock", async (meetingCode, lockedStatus) => {
            try {
                await Meeting.findOneAndUpdate({ meetingCode }, { isLocked: lockedStatus });
                // Notify all participants in that room
                if (connections[meetingCode]) {
                    connections[meetingCode].forEach(socketId => {
                        io.to(socketId).emit("room-lock-updated", lockedStatus);
                    });
                }
            } catch (err) {
                console.error("Toggle lock error:", err);
            }
        });

        // Host Control: Mute All
        socket.on("host-mute-all", (meetingCode) => {
            if (connections[meetingCode]) {
                connections[meetingCode].forEach(socketId => {
                    io.to(socketId).emit("force-mute-all");
                });
            }
        });

        // Emoji Reaction
        socket.on("emoji-reaction", (emoji, meetingCode) => {
            if (connections[meetingCode]) {
                connections[meetingCode].forEach((elem) => {
                    io.to(elem).emit("emoji-reaction", emoji, socket.id);
                });
            }
        });

        // Whiteboard Draw Sync
        socket.on("whiteboard-draw", (data, meetingCode) => {
            if (connections[meetingCode]) {
                connections[meetingCode].forEach((elem) => {
                    if (elem !== socket.id) {
                        io.to(elem).emit("whiteboard-draw", data);
                    }
                });
            }
        });

        // Poll Events
        socket.on("poll-create", (pollData, meetingCode) => {
            if (connections[meetingCode]) {
                const poll = { ...pollData, id: Date.now(), creator: socket.id };
                connections[meetingCode].forEach((elem) => {
                    io.to(elem).emit("poll-update", poll);
                });
            }
        });

        socket.on("poll-vote", (pollId, optionIndex, meetingCode) => {
            if (connections[meetingCode]) {
                connections[meetingCode].forEach((elem) => {
                    io.to(elem).emit("poll-vote-update", { pollId, optionIndex, voter: socket.id });
                });
            }
        });

        socket.on("disconnect", () => {
            const key = socketToRoom[socket.id];
            if (key && connections[key]) {
                connections[key].forEach(socketId => {
                    io.to(socketId).emit('user-left', socket.id);
                });
                
                const index = connections[key].indexOf(socket.id);
                if (index > -1) connections[key].splice(index, 1);
                
                if (connections[key].length === 0) {
                    delete connections[key];
                    delete messages[key];
                }
            }
            delete socketToRoom[socket.id];
            delete timeOnline[socket.id];
        })
    })

    return io;
}

