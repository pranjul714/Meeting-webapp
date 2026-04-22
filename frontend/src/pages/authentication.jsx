import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, ArrowRight, Video, Users, Zap, Globe } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Authentication() {
  const [formState, setFormState] = useState(0); // 0: Login, 1: Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setFormState(0);
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Left Pane - Immersive Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000"
            alt="Collaboration Context"
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-12"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">LOOP</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-7xl font-semibold leading-[0.9] tracking-tighter mb-8"
            >
              METICULOUSLY <br />
              CRAFTED <br />
              <span className="text-indigo-500 italic">MOMENTS.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4 }}
              className="text-lg max-w-sm font-light leading-relaxed"
            >
              Connect with your team in a high-fidelity environment built for deep work and seamless collaboration.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {[
              { icon: Users, label: 'Unlimited Teams', sub: 'Infinite scale' },
              { icon: Zap, label: 'Instant Flow', sub: 'Sub-100ms latency' },
              { icon: Globe, label: 'Global Edge', sub: '24 nodes worldwide' },
              { icon: Lock, label: 'Encrypted', sub: 'End-to-end security' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="space-y-1"
              >
                <feature.icon className="w-5 h-5 text-indigo-400 mb-2" />
                <h4 className="text-sm font-medium">{feature.label}</h4>
                <p className="text-xs text-white/40">{feature.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {formState === 0 ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-neutral-500">
              {formState === 0
                ? 'Enter your credentials to access your workspace.'
                : 'Join Loop and start collaborating today.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="inline-flex p-1 bg-neutral-900 rounded-xl mb-4">
            <button
              onClick={() => setFormState(0)}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                formState === 0 ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setFormState(1)}
              className={cn(
                "px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                formState === 1 ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {formState === 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5"
                >
                  <label className="text-sm font-medium text-neutral-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-700"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-400 ml-1">Username / Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-neutral-400">Password</label>
                {formState === 0 && (
                  <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-neutral-700"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm"
              >
                {message}
              </motion.div>
            )}

            <button
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {formState === 0 ? 'Continue to Workspace' : 'Create free account'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="pt-8 text-center text-sm text-neutral-600">
            {formState === 0 ? (
              <p>
                Don't have an account?{' '}
                <button onClick={() => setFormState(1)} className="text-white hover:underline">
                  Sign up for free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setFormState(0)} className="text-white hover:underline">
                  Log in
                </button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-12 flex gap-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-700">
          <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-neutral-400 transition-colors">Status</a>
        </div>
      </div>
    </div>
  );
}
