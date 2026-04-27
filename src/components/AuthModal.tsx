import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, Mail, Chrome, Ticket } from 'lucide-react';
import { MobileAuth } from './MobileAuth';
import { EmailAuth } from './EmailAuth';
import { useAuth } from './AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authMethod, setAuthMethod] = useState<"mobile" | "email">("mobile");
  const [googleError, setGoogleError] = useState<string | null>(null);
  const { loginWithGoogle, setUser } = useAuth();

  const handleSuccess = (user: any) => {
    setUser(user);
    onClose();
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleError(null);
      await loginWithGoogle();
      onClose();
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error?.code === "auth/unauthorized-domain") {
        setGoogleError(
          "Google login is blocked for this domain. Add localhost/127.0.0.1 in Firebase Console > Authentication > Settings > Authorized domains."
        );
      } else {
        setGoogleError(error?.message || "Google login failed. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#121826] border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Ticket size={24} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">BOOK THE SHOW</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm font-medium">Please login to continue your booking</p>
          </div>

          {/* Auth Tabs */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl">
            <button 
              onClick={() => setAuthMethod('mobile')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${authMethod === 'mobile' ? 'bg-slate-800 text-indigo-500 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Phone size={18} />
              Mobile
            </button>
            <button 
              onClick={() => setAuthMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${authMethod === 'email' ? 'bg-slate-800 text-indigo-500 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Mail size={18} />
              Email
            </button>
          </div>

          {/* Auth Content */}
          <AnimatePresence mode="wait">
            {authMethod === "mobile" ? (
              <motion.div
                key="mobile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MobileAuth onSuccess={handleSuccess} />
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EmailAuth onSuccess={handleSuccess} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121826] px-4 text-slate-600 font-black tracking-widest">Or Continue With</span>
            </div>
          </div>

          {/* Social Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
            Continue with Google
          </button>
          {googleError && (
            <p className="text-rose-500 text-sm font-medium">{googleError}</p>
          )}

          <p className="text-center text-xs text-slate-600 font-medium">
            By continuing, you agree to our <span className="text-slate-400 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-slate-400 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
