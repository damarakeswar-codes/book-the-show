import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight, 
  Github, 
  Chrome,
  ChevronLeft,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface LoginProps {
  onGoogleLogin: () => void;
}

export const LoginScreen = ({ onGoogleLogin }: LoginProps) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [inputValue, setInputValue] = useState('');

  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-32 py-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-md w-full mx-auto"
        >
          {/* Logo - Styled like TheCubeFactory */}
          <div className="flex items-center gap-3 mb-16">
            <div className="grid grid-cols-2 gap-1 bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-200">
              <div className="w-2 h-2 bg-white rounded-sm"></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-sm"></div>
              <div className="w-2 h-2 bg-indigo-200 rounded-sm"></div>
              <div className="w-2 h-2 bg-white rounded-sm"></div>
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Book The Show (BTS)</span>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">Welcome back</h1>
            <p className="text-slate-500 text-lg font-medium">Please enter your details to continue.</p>
          </div>

          {/* Login Form */}
          <div className="space-y-8">
            {/* Method Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => setMethod('email')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${method === 'email' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Email address
              </button>
              <button 
                onClick={() => setMethod('phone')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${method === 'phone' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Phone number
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">
                  {method === 'email' ? 'Email address' : 'Mobile number'}
                </label>
                <input 
                  type={method === 'email' ? 'email' : 'tel'}
                  placeholder={method === 'email' ? 'Enter your email' : 'Enter mobile number'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">Password</label>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between py-2 px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember for 30 days</span>
                </label>
                <button className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password</button>
              </div>

              <div className="space-y-5 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => alert("Email/Phone login is currently in demo mode. Please use Google Login for full functionality.")}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4.5 rounded-2xl transition-all shadow-xl shadow-indigo-200 text-lg"
                >
                  Sign in
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={onGoogleLogin}
                  className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-4.5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm text-lg"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
                  Sign in with Google
                </motion.button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-16 text-center text-slate-500 text-base">
            Don't have an account? <span className="text-indigo-600 font-bold hover:underline cursor-pointer ml-1">Sign up</span>
          </p>
        </motion.div>
      </div>

      {/* Right Side: Illustration Area */}
      <div className="hidden md:flex w-1/2 bg-[#7C3AED] relative items-center justify-center overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-white/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-400/20 rounded-full blur-[120px]"></div>

        {/* Illustration Content */}
        <div className="relative z-10 w-full max-w-xl px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Character Illustration with Headset (Matching the image) */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-16 rounded-[5rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-white blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <Users size={80} className="text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-white mb-6 tracking-tight">Join the Elite</h3>
                <p className="text-indigo-100 text-xl font-medium leading-relaxed max-w-sm">
                  Experience the most exclusive events with real-time updates and premium support.
                </p>
              </div>
              
              {/* Floating Icons with specific animations */}
              <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-12 left-12 text-white/30"><Mail size={40} /></motion.div>
              <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-12 right-12 text-white/30"><Phone size={40} /></motion.div>
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-1/2 right-6 text-white/20"><Ticket size={64} /></motion.div>
              <motion.div animate={{ x: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-1/4 left-8 text-white/20"><Calendar size={48} /></motion.div>
            </div>

            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-14 -right-10 w-32 h-32 bg-amber-400 rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-2xl border-4 border-white/20"
            >
              <TrendingUp size={56} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-10 -left-10 w-28 h-28 bg-rose-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"
            >
              <Ticket size={48} className="text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
