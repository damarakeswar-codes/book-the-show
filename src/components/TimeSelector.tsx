import React from 'react';
import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({ selectedTime, onTimeSelect }) => {
  const times = ['10:00 AM', '01:30 PM', '04:45 PM', '08:00 PM', '11:15 PM'];

  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {times.map((time, index) => {
        const isSelected = selectedTime === time;
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTimeSelect(time)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-300
              ${isSelected 
                ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}
            `}
          >
            <Clock size={16} className={isSelected ? 'text-white' : 'text-slate-500'} />
            <span className="text-sm font-bold tracking-tight">{time}</span>
          </motion.button>
        );
      })}
    </div>
  );
};
