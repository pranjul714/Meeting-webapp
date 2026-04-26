import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MonitorUp, 
  MonitorOff, 
  MessageSquare, 
  X, 
  Send, 
  User, 
  ShieldCheck,
  Hash,
  Users,
  Settings,
  ArrowRight,
  Lock,
  Unlock,
  Copy,
  Info,
  MoreVertical,
  Zap,
  CheckCircle,
  Pencil,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import server from '../environment';
import { cn } from '../lib/utils';
import Whiteboard from '../components/Whiteboard';

// Configuration
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
};

const server_url = server;
var connections = {};

export default function VideoMeetComponent() {
    const navigate = useNavigate();
    const meetingId = window.location.pathname.split("/").pop();

    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoref = useRef(null);
    const videoRef = useRef([]);

    // State
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [screenAvailable, setScreenAvailable] = useState(false);
    
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [screenEnabled, setScreenEnabled] = useState(false);
    
    const [videos, setVideos] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [activeReactions, setActiveReactions] = useState([]);
    const [isTranscriptionActive, setIsTranscriptionActive] = useState(false);
    const [transcription, setTranscription] = useState([]);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('chat');
    const [polls, setPolls] = useState([]);
    const [newPolls, setNewPolls] = useState(0);
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);
    const [newPollData, setNewPollData] = useState({ question: "", options: ["", ""] });
    
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [isHost, setIsHost] = useState(false);

    // Initial Permissions
    useEffect(() => {
        getPermissions();
    }, []);

    // Re-attach stream when UI shifts or ref changes
    useEffect(() => {
        if (localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername, localVideoref.current]);

    const getPermissions = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Media devices not supported. Please ensure you are using HTTPS or localhost.");
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (stream) {
                setVideoAvailable(true);
                setAudioAvailable(true);
                window.localStream = stream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
            }
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
        } catch (error) {
            console.error("Permission error:", error);
            setErrorMsg(error.message || "Could not access camera or microphone.");
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    };

    const connectToSocketServer = () => {
        socketRef.current = io(server_url);

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', (data, sender, socketIdSender) => {
                setMessages(prev => [...prev, { sender, data }]);
                if (socketIdSender !== socketIdRef.current) {
                    setNewMessages(prev => prev + 1);
                }
            });

            socketRef.current.on('room-locked', () => {
                setErrorMsg("This meeting is locked by the host.");
                setAskForUsername(true);
            });

            socketRef.current.on('room-lock-updated', (status) => {
                setIsLocked(status);
            });

            socketRef.current.on('emoji-reaction', (emoji, senderId) => {
                const reaction = { id: Date.now(), emoji, senderId };
                setActiveReactions(prev => [...prev, reaction]);
                setTimeout(() => {
                    setActiveReactions(prev => prev.filter(r => r.id !== reaction.id));
                }, 4000);
            });

            socketRef.current.on('poll-update', (poll) => {
                setPolls(prev => [...prev, { ...poll, votes: poll.options.map(() => 0) }]);
                if (sidebarTab !== 'polls') setNewPolls(prev => prev + 1);
            });

            socketRef.current.on('poll-vote-update', ({ pollId, optionIndex }) => {
                setPolls(prev => prev.map(p => {
                    if (p.id === pollId) {
                        const newVotes = [...p.votes];
                        newVotes[optionIndex]++;
                        return { ...p, votes: newVotes };
                    }
                    return p;
                }));
            });

            socketRef.current.on('force-mute-all', () => {
                if (window.localStream) {
                    const audioTrack = window.localStream.getAudioTracks()[0];
                    if (audioTrack) {
                        audioTrack.enabled = false;
                        setAudioEnabled(false);
                    }
                }
            });

            socketRef.current.on('user-left', (id) => {
                setVideos(prev => prev.filter(v => v.socketId !== id));
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });

            socketRef.current.on('user-joined', (id, clients) => {
                // Determine if first user is host (simulated for simplicity)
                if (clients.length === 1 && id === socketIdRef.current) {
                    setIsHost(true);
                }

                clients.forEach((socketListId) => {
                    // Fix: ONLY create connection if it doesn't already exist
                    if (socketListId === socketIdRef.current || connections[socketListId]) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    
                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections[socketListId].onaddstream = (event) => {
                        setVideos(prev => {
                            const exists = prev.find(v => v.socketId === socketListId);
                            if (exists) {
                                return prev.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                            }
                            return [...prev, { socketId: socketListId, stream: event.stream }];
                        });
                    };

                    if (window.localStream) {
                        connections[socketListId].addStream(window.localStream);
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                            });
                        });
                    }
                }
            });
        });
    };

    const gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            // Safety check: ensure connection exists before signaling
            if (!connections[fromId]) {
                // If for some reason we missed the user-joined event, create it now
                connections[fromId] = new RTCPeerConnection(peerConfigConnections);
                
                connections[fromId].onicecandidate = (event) => {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', fromId, JSON.stringify({ 'ice': event.candidate }));
                    }
                };

                connections[fromId].onaddstream = (event) => {
                    setVideos(prev => {
                        const exists = prev.find(v => v.socketId === fromId);
                        if (exists) return prev.map(v => v.socketId === fromId ? { ...v, stream: event.stream } : v);
                        return [...prev, { socketId: fromId, stream: event.stream }];
                    });
                };

                if (window.localStream) {
                    connections[fromId].addStream(window.localStream);
                }
            }

            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                            });
                        });
                    }
                }).catch(e => console.error("SDP Error:", e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error("ICE Error:", e));
            }
        }
    };

    const handleVideo = () => {
        setVideoEnabled(prev => {
            const newState = !prev;
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(track => track.enabled = newState);
            }
            return newState;
        });
    };

    const handleAudio = () => {
        setAudioEnabled(prev => {
            const newState = !prev;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(track => track.enabled = newState);
            }
            return newState;
        });
    };

    const handleToggleLock = () => {
        const newStatus = !isLocked;
        setIsLocked(newStatus);
        socketRef.current.emit('toggle-lock', meetingId, newStatus);
    };

    const handleMuteAll = () => {
        socketRef.current.emit('host-mute-all', meetingId);
    };

    const handleScreenShare = async () => {
        try {
            if (!screenEnabled) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                // Replace track in all peer connections
                for (let id in connections) {
                    const senders = connections[id].getSenders();
                    const videoSender = senders.find(sender => sender.track.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(screenTrack);
                    }
                }

                if (localVideoref.current) localVideoref.current.srcObject = screenStream;
                
                screenTrack.onended = () => {
                    stopScreenShare();
                };

                setScreenEnabled(true);
                window.screenStream = screenStream;
            } else {
                stopScreenShare();
            }
        } catch (e) {
            console.error("Screen share error:", e);
        }
    };

    const stopScreenShare = () => {
        if (window.screenStream) {
            window.screenStream.getTracks().forEach(track => track.stop());
        }
        
        const videoTrack = window.localStream.getVideoTracks()[0];
        for (let id in connections) {
            const senders = connections[id].getSenders();
            const videoSender = senders.find(sender => sender.track.kind === 'video');
            if (videoSender) {
                videoSender.replaceTrack(videoTrack);
            }
        }

        if (localVideoref.current) localVideoref.current.srcObject = window.localStream;
        setScreenEnabled(false);
    };

    const handleEndCall = () => {
        if (window.localStream) {
            window.localStream.getTracks().forEach((track) => track.stop());
        }
        if (window.screenStream) {
            window.screenStream.getTracks().forEach((track) => track.stop());
        }
        navigate("/home");
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    const sendEmoji = (emoji) => {
        socketRef.current.emit('emoji-reaction', emoji, meetingId);
        setShowReactions(false);
    };

    const handleCreatePoll = () => {
        if (!newPollData.question.trim() || newPollData.options.some(o => !o.trim())) return;
        socketRef.current.emit('poll-create', newPollData, meetingId);
        setIsCreatingPoll(false);
        setNewPollData({ question: "", options: ["", ""] });
    };

    const handleVote = (pollId, optionIndex) => {
        socketRef.current.emit('poll-vote', pollId, optionIndex, meetingId);
    };

    // AI Assistant Transcription Logic
    useEffect(() => {
        let recognition = null;
        if (isTranscriptionActive) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    const current = event.resultIndex;
                    const transcript = event.results[current][0].transcript;
                    setTranscription(prev => {
                        const newArr = [...prev];
                        if (event.results[current].isFinal) {
                            newArr.push({ text: transcript, id: Date.now(), final: true });
                        } else {
                            // Update the last item if it's interim
                            if (newArr.length > 0 && !newArr[newArr.length - 1].final) {
                                newArr[newArr.length - 1].text = transcript;
                            } else {
                                newArr.push({ text: transcript, id: Date.now(), final: false });
                            }
                        }
                        return newArr.slice(-3); // Only keep last 3 lines
                    });
                };

                recognition.start();
            }
        }
        return () => {
            if (recognition) recognition.stop();
        };
    }, [isTranscriptionActive]);

    const connect = () => {
        if (!username.trim()) return;
        setAskForUsername(false);
        connectToSocketServer();
    };

    const copyMeetingId = () => {
        navigator.clipboard.writeText(window.location.href);
        // Could add a toast here
    };

    // Lobby Screen
    if (askForUsername) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-5xl z-10 grid lg:grid-cols-2 gap-12 items-center"
                >
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Video className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-white">PRISM<span className="text-blue-500">VIDEO</span></h1>
                        </div>

                        <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                            <video ref={localVideoref} autoPlay muted className="w-full h-full object-cover mirror" />
                            {!videoEnabled && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
                                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <VideoOff className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Camera is Off</p>
                                </div>
                            )}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                                <button onClick={handleAudio} className={cn("p-4 rounded-2xl transition-all shadow-xl", audioEnabled ? "bg-white/10 backdrop-blur-xl text-white hover:bg-white/20" : "bg-red-500 text-white")}>
                                    {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </button>
                                <button onClick={handleVideo} className={cn("p-4 rounded-2xl transition-all shadow-xl", videoEnabled ? "bg-white/10 backdrop-blur-xl text-white hover:bg-white/20" : "bg-red-500 text-white")}>
                                    {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
                        <div>
                            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Ready to join?</h2>
                            {errorMsg ? (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                    <p className="font-semibold">{errorMsg}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400 font-medium pb-2">Set up your audio and video before entering.</p>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Display Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-800/50 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-white font-bold text-lg"
                                />
                            </div>

                            <button 
                                onClick={connect}
                                className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg rounded-2xl transition-all active:scale-95 shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-3"
                            >
                                Enter Meeting
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Main Meeting Screen
    return (
        <div className="h-screen bg-slate-950 flex font-sans overflow-hidden select-none">
            <AnimatePresence>
                {showWhiteboard && (
                    <Whiteboard 
                        socket={socketRef.current} 
                        meetingId={meetingId} 
                        onClose={() => setShowWhiteboard(false)} 
                    />
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="absolute top-0 left-0 w-full z-40 p-4 md:p-6 flex justify-between items-center pointer-events-none">
                <div className="flex gap-3 pointer-events-auto">
                    <div className="flex items-center gap-2 md:gap-3 bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-2xl">
                        <div className={cn("w-1.5 md:w-2 h-1.5 md:h-2 rounded-full animate-pulse", isLocked ? "bg-red-500" : "bg-emerald-500")} />
                        <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest">{isLocked ? "Locked" : "Live"}</span>
                    </div>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={() => setShowDetails(!showDetails)} className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-2.5 rounded-2xl text-white hover:bg-slate-800 transition-all">
                        <Info className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 flex flex-col relative">
                {/* Floating Emojis */}
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                    <AnimatePresence>
                        {activeReactions.map((r) => (
                            <motion.div
                                key={r.id}
                                initial={{ y: "100vh", x: "50vw", opacity: 0, scale: 0.5 }}
                                animate={{ y: "-10vh", x: `${40 + Math.random() * 20}vw`, opacity: 1, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 4, ease: "easeOut" }}
                                className="absolute text-6xl"
                            >
                                {r.emoji}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Transcription Overlay */}
                {isTranscriptionActive && transcription.length > 0 && (
                    <div className="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 z-40 w-[90%] md:w-full max-w-2xl px-4 md:px-6">
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-2xl text-center space-y-1">
                            <p className="text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">AI Assistant Live Captions</p>
                            {transcription.map((t) => (
                                <p key={t.id} className={cn("text-sm md:text-lg font-bold transition-all", t.final ? "text-white" : "text-white/60 italic")}>
                                    {t.text}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                <div className={cn(
                    "flex-1 p-4 md:p-6 pb-40 md:pb-32 grid gap-4 md:gap-6 transition-all duration-700 items-center justify-center overflow-y-auto",
                    videos.length === 0 ? "grid-cols-1 max-w-4xl mx-auto w-full" : 
                    videos.length === 1 ? "grid-cols-1" :
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                )}>
                    {/* Local Video */}
                    <motion.div layout className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-slate-900 border-2 border-blue-600/30 group shadow-2xl aspect-video w-full">
                        <video ref={localVideoref} autoPlay muted className="w-full h-full object-cover mirror" />
                        {!videoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                <span className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] bg-black/40 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                            {!audioEnabled && <MicOff className="w-3 md:w-3.5 h-3 md:h-3.5 text-red-500" />}
                            <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest">{username} (Host)</span>
                        </div>
                    </motion.div>

                    {/* Remote Videos */}
                    {videos.map((v) => (
                        <motion.div layout key={v.socketId} className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl aspect-video w-full group">
                            <video 
                                ref={el => { if (el && v.stream) el.srcObject = v.stream }} 
                                autoPlay 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                                <span className="text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest">Participant {v.socketId.slice(0, 4)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Controls Dock */}
                <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 md:gap-4 bg-slate-900/90 backdrop-blur-3xl px-4 md:px-8 py-3 md:py-5 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] w-[95%] max-w-fit overflow-x-auto no-scrollbar">
                    <div className="flex gap-2">
                        <ControlBtn icon={audioEnabled ? Mic : MicOff} onClick={handleAudio} active={audioEnabled} danger={!audioEnabled} label="Mute" />
                        <ControlBtn icon={videoEnabled ? Video : VideoOff} onClick={handleVideo} active={videoEnabled} danger={!videoEnabled} label="Stop Video" />
                    </div>

                    <div className="w-px h-10 bg-white/10 mx-2" />

                    <div className="flex gap-2">
                        <ControlBtn icon={screenEnabled ? MonitorOff : MonitorUp} onClick={handleScreenShare} active={screenEnabled} label="Share" />
                        
                        {/* Reaction Popover */}
                        <div className="relative">
                            <ControlBtn 
                                icon={Zap} 
                                onClick={() => setShowReactions(!showReactions)} 
                                active={showReactions} 
                                label="React" 
                            />
                            <AnimatePresence>
                                {showReactions && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 p-3 rounded-2xl flex gap-2 shadow-2xl"
                                    >
                                        {["❤️", "👏", "🔥", "😂", "😮", "😢"].map(emoji => (
                                            <button 
                                                key={emoji} 
                                                onClick={() => sendEmoji(emoji)}
                                                className="text-2xl hover:scale-125 transition-transform"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <ControlBtn icon={MessageSquare} onClick={() => setShowChat(!showChat)} active={showChat} badge={newMessages} label="Chat" />
                        <ControlBtn 
                            icon={CheckCircle} 
                            onClick={() => setIsTranscriptionActive(!isTranscriptionActive)} 
                            active={isTranscriptionActive} 
                            label="AI Assistant" 
                        />
                        <ControlBtn 
                            icon={Pencil} 
                            onClick={() => setShowWhiteboard(true)} 
                            active={showWhiteboard} 
                            label="Whiteboard" 
                        />
                    </div>

                    {isHost && (
                        <>
                            <div className="w-px h-10 bg-white/10 mx-2" />
                            <div className="flex gap-2">
                                <ControlBtn icon={isLocked ? Lock : Unlock} onClick={handleToggleLock} active={isLocked} danger={isLocked} label={isLocked ? "Unlock" : "Lock"} />
                                <ControlBtn icon={Settings} onClick={handleMuteAll} label="Mute All" />
                            </div>
                        </>
                    )}

                    <button 
                        onClick={handleEndCall}
                        className="ml-4 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-red-600/30"
                    >
                        <PhoneOff className="w-4 h-4" />
                        Leave
                    </button>
                </div>
            </div>

            {/* Chat Sidebar Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="fixed inset-0 md:inset-auto md:right-6 md:top-6 md:bottom-32 md:w-[26rem] bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-3xl md:rounded-[2.5rem] border-l md:border border-white/10 shadow-2xl z-[60] flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setSidebarTab('chat')}
                                    className={cn("text-xs font-black uppercase tracking-widest transition-all", sidebarTab === 'chat' ? "text-blue-500" : "text-white/40")}
                                >
                                    Chat
                                </button>
                                <button 
                                    onClick={() => { setSidebarTab('polls'); setNewPolls(0); }}
                                    className={cn("relative text-xs font-black uppercase tracking-widest transition-all", sidebarTab === 'polls' ? "text-blue-500" : "text-white/40")}
                                >
                                    Polls
                                    {newPolls > 0 && <span className="absolute -top-2 -right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                                </button>
                            </div>
                            <button onClick={() => setShowChat(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {sidebarTab === 'chat' ? (
                            <>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.map((m, i) => (
                                        <div key={i} className={cn("flex flex-col gap-1", m.sender === username ? "items-end" : "items-start")}>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{m.sender}</span>
                                            <div className={cn("px-4 py-2 rounded-2xl text-sm font-medium max-w-[85%]", m.sender === username ? "bg-blue-600 text-white" : "bg-white/10 text-white")}>
                                                {m.data}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 pt-0">
                                    <div className="flex gap-2">
                                        <input 
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-all font-medium"
                                            placeholder="Message your team..."
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        />
                                        <button onClick={sendMessage} className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20"><Send className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                                {isCreatingPoll ? (
                                    <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Create New Poll</h4>
                                        <div className="space-y-4">
                                            <input 
                                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
                                                placeholder="Ask something..."
                                                value={newPollData.question}
                                                onChange={e => setNewPollData(prev => ({ ...prev, question: e.target.value }))}
                                            />
                                            {newPollData.options.map((opt, i) => (
                                                <input 
                                                    key={i}
                                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-blue-500"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...newPollData.options];
                                                        newOpts[i] = e.target.value;
                                                        setNewPollData(prev => ({ ...prev, options: newOpts }));
                                                    }}
                                                />
                                            ))}
                                            <button 
                                                onClick={() => setNewPollData(prev => ({ ...prev, options: [...prev.options, ""] }))}
                                                className="text-[10px] font-black text-blue-500 uppercase tracking-widest"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setIsCreatingPoll(false)} className="flex-1 py-3 bg-white/5 text-white rounded-xl text-xs font-bold">Cancel</button>
                                            <button onClick={handleCreatePoll} className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">Launch Poll</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Live Polls</h4>
                                            <button 
                                                onClick={() => setIsCreatingPoll(true)}
                                                className="p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600/30 transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {polls.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20">
                                                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500">
                                                    <Users className="w-8 h-8" />
                                                </div>
                                                <p className="text-slate-500 text-sm">No active polls. Be the first to start one!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {polls.map((p) => {
                                                    const totalVotes = p.votes.reduce((a, b) => a + b, 0);
                                                    return (
                                                        <div key={p.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4">
                                                            <p className="text-white font-bold">{p.question}</p>
                                                            <div className="space-y-3">
                                                                {p.options.map((opt, i) => {
                                                                    const percentage = totalVotes === 0 ? 0 : Math.round((p.votes[i] / totalVotes) * 100);
                                                                    return (
                                                                        <div key={i} className="space-y-1">
                                                                            <button 
                                                                                onClick={() => handleVote(p.id, i)}
                                                                                className="w-full flex justify-between items-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                                                            >
                                                                                <span className="text-white text-xs">{opt}</span>
                                                                                <span className="text-slate-500 text-[10px] font-bold">{percentage}%</span>
                                                                            </button>
                                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                                <motion.div 
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${percentage}%` }}
                                                                                    className="h-full bg-blue-600"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{totalVotes} Total Votes</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Meeting Details Overlay */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm"
                        onClick={() => setShowDetails(false)}
                    >
                        <div className="bg-slate-900 border border-white/10 w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowDetails(false)} className="absolute top-6 right-6 text-white/20 hover:text-white"><X /></button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                                    <Info className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-white text-2xl font-black tracking-tight">Meeting Info</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Share with participants</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 bg-black/40 rounded-3xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Invitation Link</p>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-white font-bold text-sm truncate">{window.location.href}</p>
                                        <button onClick={copyMeetingId} className="flex-shrink-0 p-2 bg-blue-600/20 text-blue-500 rounded-lg hover:bg-blue-600/30 transition-all"><Copy className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Hash className="w-5 h-5 text-blue-500" />
                                        <p className="text-white font-bold">{meetingId}</p>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Active</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-component for Controls
function ControlBtn({ icon: Icon, onClick, active, danger, badge, label }) {
    return (
        <div className="flex flex-col items-center gap-2 group">
            <button 
                onClick={onClick}
                className={cn(
                    "relative p-4 rounded-2xl transition-all duration-300 active:scale-90",
                    active ? (danger ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20") : 
                    (danger ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" : "bg-white/5 text-white hover:bg-white/10 border border-white/5")
                )}
            >
                <Icon className={cn("w-6 h-6 transition-transform group-hover:scale-110")} />
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                        {badge}
                    </span>
                )}
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">{label}</span>
        </div>
    )
}
