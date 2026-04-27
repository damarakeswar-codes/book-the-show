import React from 'react';
import { motion } from 'motion/react';
import { format, addDays } from 'date-fns';

interface DateSelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateSelect }) => {
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x">
      {dates.map((date, index) => {
        const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDateSelect(date)}
            className={`
              flex flex-col items-center justify-center min-w-[70px] h-[90px] rounded-2xl border transition-all duration-300 snap-center
              ${isSelected 
                ? 'bg-indigo-600 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}
            `}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">
              {format(date, 'EEE')}
            </span>
            <span className="text-2xl font-black tracking-tighter">
              {format(date, 'dd')}
            </span>
            <span className="text-[10px] font-bold mt-1 opacity-60">
              {format(date, 'MMM')}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
