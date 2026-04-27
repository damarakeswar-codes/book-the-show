import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-8 left-1/2 z-[200] flex items-center gap-3 px-6 py-4 bg-[#121826] border border-slate-800 rounded-2xl shadow-2xl min-w-[320px]"
    >
      {type === 'success' ? (
        <CheckCircle className="text-emerald-500" size={24} />
      ) : (
        <XCircle className="text-rose-500" size={24} />
      )}
      <p className="text-sm font-bold text-white flex-1">{message}</p>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
};
