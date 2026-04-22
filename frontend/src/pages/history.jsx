import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Hash, 
  ChevronRight, 
  Video,
  Clock,
  ExternalLink,
  Search,
  History
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function HistoryComponent() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const filteredMeetings = meetings.filter(m => 
        m.meetingCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/")}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight">Meeting History</h1>
                            <p className="text-xs text-slate-500 font-medium">{meetings.length} total sessions</p>
                        </div>
                    </div>

                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-10 pr-4 bg-slate-100 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 space-y-4"
                        >
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium">Fetching your history...</p>
                        </motion.div>
                    ) : filteredMeetings.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredMeetings.map((meeting, index) => (
                                <motion.div
                                    key={meeting.meetingCode}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    onClick={() => navigate(`/${meeting.meetingCode}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-blue-50 transition-colors">
                                            <Video className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Hash className="w-3 h-3 text-slate-400" />
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {meeting.meetingCode}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(meeting.date)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatTime(meeting.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button className="hidden group-hover:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold transition-all hover:bg-blue-600 hover:text-white">
                                            Rejoin Meeting
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </button>
                                        <div className="sm:p-2 rounded-lg text-slate-300 group-hover:text-blue-600 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] border border-slate-200 border-dashed p-16 flex flex-col items-center text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <History className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-display font-bold text-slate-900">No meeting history yet</h2>
                                <p className="text-slate-500 max-w-sm mx-auto">
                                    When you join a video call, it will appear here so you can easily rejoin later.
                                </p>
                            </div>
                            <button 
                                onClick={() => navigate("/")}
                                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                            >
                                Start your first meeting
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
