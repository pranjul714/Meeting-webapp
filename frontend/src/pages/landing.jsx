import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Users,
  Smartphone,
  CheckCircle,
  PlayCircle,
  Lock
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                            <Video className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="font-display font-bold text-2xl tracking-tight text-slate-900">
                            Meeting<span className="text-blue-600">App</span>
                        </h2>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                   
                        <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
                         <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Security</Link>
                          <Link to="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Enterprise</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/aljk23")}
                            className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2"
                        >
                            Join as Guest
                        </button>
                        <button 
                            onClick={() => navigate("/auth")}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-xl shadow-blue-200/50 flex items-center gap-2"
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8 relative z-10"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-wider">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                               
                            </div>

                            <h1 className="text-5xl md:text-8xl font-display font-black text-slate-900 leading-[1.1] md:leading-[0.95] tracking-tight">
                                Connect with your <br className="hidden md:block" />
                                <span className="text-blue-600 italic font-medium serif">loved ones</span>
                            </h1>

                            <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                                Experience high-fidelity video conferencing that feels as natural as being in the same room. Crystal clear, secure, and built for simplicity.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link 
                                    to="/auth"
                                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-lg"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <button className="px-10 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-50 active:scale-95 text-lg">
                                    <PlayCircle className="w-5 h-5" />
                                    Watch Demo
                                </button>
                            </div>

                            <div className="flex items-center gap-8 pt-8 opacity-60 grayscale overflow-hidden">
                                <Users className="w-20" />
                                <ShieldCheck className="w-20" />
                                <Globe className="w-20" />
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
                            
                            <div className="relative rounded-[3rem] bg-white p-4 shadow-2xl border border-slate-200 rotate-2 hover:rotate-0 transition-transform duration-700">
                                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-100">
                                    <img 
                                        src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop" 
                                        alt="Video Call Experience" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-10 left-10 text-white space-y-2">
                                        <div className="flex gap-2">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-md" />
                                            ))}
                                        </div>
                                        <p className="font-display font-bold text-2xl uppercase tracking-tighter">HD Clarity</p>
                                    </div>
                                </div>
                                
                                {/* Floating UI Mockup */}
                                <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 space-y-3 max-w-[200px] hidden sm:block">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-2 w-full bg-slate-100 rounded" />
                                            <div className="h-2 w-1/2 bg-slate-100 rounded mt-1" />
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase">99.9% Latency Free</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Advanced Features Grid */}
                <section className="py-32 px-4 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl opacity-50" />
                    
                    <div className="max-w-7xl mx-auto space-y-24">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight">
                                Smart AI Features <span className="text-blue-600">(Sabse Advance)</span>
                            </h2>
                            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                                We've integrated state-of-the-art AI to make your meetings more productive and inclusive.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { 
                                    icon: Zap, 
                                    title: "AI Meeting Assistant", 
                                    desc: "Automatic transcription and summary (points mein conclusion) taiyaar kare.",
                                    color: "bg-amber-100 text-amber-600"
                                },
                                { 
                                    icon: ArrowRight, 
                                    title: "Action Item Extraction", 
                                    desc: "AI apne aap pehchan le ki kisne kya kaam karne ka waada kiya hai.",
                                    color: "bg-emerald-100 text-emerald-600"
                                },
                                { 
                                    icon: Globe, 
                                    title: "Real-time Translation", 
                                    desc: "Live translation screen par captions ke roop mein dikhe.",
                                    color: "bg-blue-100 text-blue-600"
                                },
                                { 
                                    icon: ShieldCheck, 
                                    title: "AI Noise Cancellation", 
                                    desc: "Background ke shor ko poori tarah khatam kar dena.",
                                    color: "bg-purple-100 text-purple-600"
                                }
                            ].map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6 transition-all"
                                >
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", feature.color)}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Collaboration Section */}
                <section className="py-32 px-4 bg-slate-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-xs font-black uppercase tracking-widest">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    Advanced Collaboration
                                </div>
                                <h2 className="text-5xl font-display font-black text-slate-900 leading-tight tracking-tight">
                                    Milkar kaam karne ke liye <br />
                                    <span className="text-blue-600">Behtarin Tools.</span>
                                </h2>
                                <div className="space-y-6">
                                    {[
                                        { title: "Interactive Whiteboard", desc: "Sab log milkar ek hi screen par draw ya likh sakein." },
                                        { title: "Document Co-editing", desc: "Meeting ke andar hi live file edit karna." },
                                        { title: "Companion Mode", desc: "Mobile se chat ya poll control karein bina echo ke." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                <p className="text-slate-500 text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-2xl" />
                                <div className="relative rounded-[2.5rem] bg-white p-4 shadow-2xl border border-slate-200">
                                    <img 
                                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop" 
                                        alt="Collaboration" 
                                        className="rounded-[2rem] w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Row */}
                <section className="bg-slate-900 py-32">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="mb-16">
                            <h2 className="text-3xl font-display font-black text-white tracking-tight">Security & Interaction</h2>
                            <p className="text-slate-500 mt-2">Technical excellence meeting high-end security.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { icon: Lock, title: "End-to-End Encryption", desc: "Ye ensure karna ki meeting ka data koi teesra insaan na dekh sake." },
                                { icon: Users, title: "Breakout Rooms", desc: "Badi meeting ko discussion ke liye chote groups mein baant dena." },
                                { icon: PlayCircle, title: "Emoji Reactions", desc: "Video par live reactions dikhana bina mic on kiye feedback ke liye." }
                            ].map((feature, i) => (
                                <div key={i} className="space-y-4 group">
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            
        </div>
    );
}
