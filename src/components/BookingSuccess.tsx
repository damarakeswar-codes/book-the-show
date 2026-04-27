import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, MapPin, Ticket, ArrowRight, Download } from 'lucide-react';
import { useStore } from '../store/useStore';

export const BookingSuccess = () => {
  const { lastBooking, setView } = useStore();

  if (!lastBooking) return null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
        
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30"
          >
            <CheckCircle2 size={40} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-4xl font-black text-white mb-2">Booking Confirmed!</h2>
          <p className="text-slate-400">Your tickets have been secured. Get ready for the show!</p>
        </div>

        <div className="bg-black/40 rounded-2xl p-6 border border-slate-800/50 mb-8 relative">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-slate-800"></div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 rounded-full border border-slate-800"></div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Event</p>
                <p className="text-lg font-bold text-white">{lastBooking.eventTitle}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar size={14} />
                <span>{new Date(lastBooking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={14} />
                <span>{lastBooking.venue}</span>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Seats</p>
                <p className="text-lg font-bold text-indigo-400">{lastBooking.seats.join(', ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Order ID</p>
                <p className="text-xs font-mono text-slate-500">{lastBooking.razorpayOrderId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setView('bookings')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Ticket size={20} />
            View My Bookings
          </button>
          <button 
            onClick={() => setView('home')}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
