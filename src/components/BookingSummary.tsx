import React from 'react';
import { motion } from 'motion/react';
import { Ticket, Calendar, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface BookingSummaryProps {
  selectedDate: Date;
  selectedTime: string;
  selectedSeats: any[];
  totalAmount: number;
  onBookNow: () => void;
  loading: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({ 
  selectedDate, 
  selectedTime, 
  selectedSeats, 
  totalAmount, 
  onBookNow,
  loading
}) => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-32">
      <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
        <Ticket size={24} className="text-indigo-500" />
        Booking Summary
      </h3>

      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date</p>
            <p className="text-sm font-bold text-white">{format(selectedDate, 'EEEE, d MMM yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Show Time</p>
            <p className="text-sm font-bold text-white">{selectedTime}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selected Seats</p>
            <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
              {selectedSeats.length} Seats
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.length > 0 ? selectedSeats.map((seat, i) => (
              <span key={i} className="text-[10px] font-black bg-slate-700 text-white px-2 py-1 rounded-md uppercase tracking-tighter">
                {seat.seatId}
              </span>
            )) : (
              <p className="text-xs text-slate-600 italic">No seats selected yet</p>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Amount</p>
              <h4 className="text-4xl font-black text-white tracking-tighter">₹{totalAmount.toLocaleString()}</h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">+ GST (18%)</p>
              <p className="text-xs text-slate-500 font-medium italic">Inclusive of all taxes</p>
            </div>
          </div>

          <button
            onClick={onBookNow}
            disabled={selectedSeats.length === 0 || loading}
            className={`
              w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl
              ${selectedSeats.length > 0 
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
            `}
          >
            {loading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <CreditCard size={22} />
                Proceed to Pay
                <ChevronRight size={20} className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
