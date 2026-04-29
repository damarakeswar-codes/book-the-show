import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, ArrowRight, RefreshCw } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface EmailAuthProps {
  onSuccess: (user: any) => void;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (mode === "signup" && !formData.name) {
      setError("Please enter your name.");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
        
        const newUser = {
          email: userCredential.user.email,
          displayName: formData.name,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
        onSuccess({ uid: userCredential.user.uid, ...newUser });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onSuccess({ uid: userCredential.user.uid, ...userCredential.user } as any);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
        <button 
          onClick={() => setMode('login')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Login
        </button>
        <button 
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Signup
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <AnimatePresence mode="wait">
          {mode === "signup" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <label className="text-sm font-bold text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-bold text-slate-400">Password</label>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {error && <p className="text-rose-500 text-sm font-medium ml-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-indigo-500/20"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <>
              {mode === "login" ? "Login" : "Create Account"}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
