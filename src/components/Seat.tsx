import React from 'react';
import { motion } from 'motion/react';
import { Armchair } from 'lucide-react';

interface SeatProps {
  id: string;
  seatId: string;
  status: 'available' | 'locked' | 'booked';
  category: 'Basic' | 'Standard' | 'Premium';
  price: number;
  isSelected: boolean;
  onClick: () => void;
}

export const Seat: React.FC<SeatProps> = ({ 
  seatId, 
  status, 
  category, 
  price, 
  isSelected, 
  onClick 
}) => {
  const getColors = () => {
    if (status === 'booked') return 'bg-slate-700 text-slate-500 cursor-not-allowed';
    if (isSelected) return 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]';
    
    switch (category) {
      case 'Premium': return 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white';
      case 'Standard': return 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-indigo-600 hover:text-white';
      case 'Basic': return 'bg-slate-900 text-slate-500 border border-slate-800 hover:bg-indigo-600 hover:text-white';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-indigo-600 hover:text-white';
    }
  };

  return (
    <motion.button
      whileHover={status !== 'booked' ? { scale: 1.15, y: -2 } : {}}
      whileTap={status !== 'booked' ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={status === 'booked'}
      className={`
        relative w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all duration-300
        ${getColors()}
        ${status === 'booked' ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
      `}
    >
      <Armchair size={18} />
      <span className="text-[8px] mt-1 font-black opacity-80">{seatId}</span>
      
      {isSelected && (
        <motion.div 
          layoutId="glow"
          className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md -z-10"
        />
      )}
    </motion.button>
  );
};
