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
  PlayCircle
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
                            Prism<span className="text-blue-600">Video</span>
                        </h2>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                        <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Security</a>
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
                                Now powered by AI Clarity
                            </div>

                            <h1 className="text-6xl md:text-8xl font-display font-black text-slate-900 leading-[0.95] tracking-tight">
                                Connect with your <br />
                                <span className="text-blue-600 italic font-medium serif">loved ones</span>
                            </h1>

                            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
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

                {/* Features Row */}
                <section className="bg-slate-900 py-24">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12">
                        {[
                            { icon: ShieldCheck, title: "Private & Secure", desc: "End-to-end encryption for every single call. Your privacy is our priority." },
                            { icon: Globe, title: "Global Reach", desc: "Optimized infrastructure for seamless connections across continents." },
                            { icon: Smartphone, title: "All Devices", desc: "Join from any device, anywhere. Mobile, tablet, or desktop ready." }
                        ].map((feature, i) => (
                            <div key={i} className="space-y-4">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            
        </div>
    );
}
