import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  History as RestoreIcon, 
  LogOut, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  ShieldCheck,
  User,
  Hash
} from 'lucide-react';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory, userData } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const handleCreateMeeting = async () => {
        const randomCode = Math.random().toString(36).substring(2, 10);
        await addToUserHistory(randomCode);
        navigate(`/${randomCode}`);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Navbar */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="font-display font-black text-xl tracking-tighter text-slate-900 uppercase">
                            Prism<span className="text-blue-600">Video</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/history")}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <RestoreIcon className="w-4 h-4" />
                            <span className="hidden sm:inline uppercase tracking-widest text-[10px]">History</span>
                        </button>
                        
                        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
                        
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end hidden md:block">
                                <span className="text-sm font-black text-slate-900 leading-none">
                                    {userData?.name || "User"}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userData?.username || "Individual"}</span>
                            </div>
                            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-600/20">
                                {userData?.name ? userData.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                            </div>
                            <button 
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 pt-16 flex flex-col items-center">
                <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Secure Workspace
                            </motion.span>
                            <h2 className="text-6xl md:text-7xl font-display font-black text-slate-900 leading-[0.95] tracking-tighter">
                                Professional <br />
                                <span className="text-blue-600">Conferencing.</span>
                            </h2>
                            <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                                Collaborate with your team in high-fidelity. 
                                Secure grid-based meetings with adaptive latency and persistent chat.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 max-w-md">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Meeting Code"
                                        value={meetingCode}
                                        onChange={(e) => setMeetingCode(e.target.value)}
                                        className="w-full h-14 pl-6 pr-10 bg-transparent outline-none text-slate-900 font-bold text-lg placeholder:text-slate-300"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleJoinVideoCall}
                                    className="h-14 px-8 bg-slate-900 hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20 text-xs uppercase tracking-widest"
                                >
                                    Join
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <button 
                                onClick={handleCreateMeeting}
                                className="group w-full max-w-md h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[2rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-blue-600/30 text-sm uppercase tracking-widest"
                            >
                                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5" />
                                </div>
                                Start New Meeting
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-6 pt-4">
                            {[
                                { icon: CheckCircle2, text: "4K Ready" },
                                { icon: Users, text: "Group Calls" },
                                { icon: ShieldCheck, text: "Encrypted" }
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                                    <feature.icon className="w-4 h-4 text-emerald-500" />
                                    {feature.text}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative lg:block hidden"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-[2.5rem] blur-2xl" />
                        <div className="relative bg-white p-4 rounded-[2rem] border border-slate-200 shadow-2xl">
                            <div className="aspect-video rounded-2xl bg-slate-100 overflow-hidden relative group">
                                <img 
                                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop" 
                                    alt="Video call demo" 
                                    className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-white text-xs font-medium">12 others joined</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Brands/Features Bar */}
                <section className="w-full border-y border-slate-200 bg-white py-12">
                    <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                            Trusted by innovative teams worldwide
                        </p>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale">
                            {['Google', 'Microsoft', 'Nvidia', 'Meta'].map(brand => (
                                <span key={brand} className="text-2xl font-display font-black">{brand}</span>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

           
        </div>
    );
}

export default withAuth(HomeComponent);
