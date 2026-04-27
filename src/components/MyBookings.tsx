import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Ticket, Calendar, MapPin, CreditCard, ChevronRight, Loader2, Download } from 'lucide-react';

interface Booking {
  id: string;
  eventId: string;
  eventTitle?: string;
  eventImage?: string;
  venue?: string;
  date?: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export const MyBookings = () => {
  const { user } = useStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'bookings'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        
        const bookingData = await Promise.all(snap.docs.map(async (bookingDoc) => {
          const data = bookingDoc.data();
          // Fetch event details
          const eventDoc = await getDoc(doc(db, 'events', data.eventId));
          const eventData = eventDoc.data();
          
          return {
            id: bookingDoc.id,
            ...data,
            eventTitle: eventData?.title,
            eventImage: eventData?.image,
            venue: eventData?.venue,
            date: eventData?.date
          } as Booking;
        }));
        
        setBookings(bookingData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
        <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ticket size={40} className="text-slate-600" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
        <p className="text-slate-500">Your upcoming events and movies will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tight">My Digital Wallet</h2>
          <p className="text-slate-500 mt-1">All your confirmed tickets in one place</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Spent</p>
            <p className="text-lg font-black text-emerald-400">₹{bookings.reduce((acc, b) => acc + b.totalAmount, 0)}</p>
          </div>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tickets</p>
            <p className="text-lg font-black text-white">{bookings.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {bookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group"
          >
            {/* The Ticket Container */}
            <div className="flex flex-col lg:flex-row bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl hover:border-indigo-500/50 transition-all duration-500">
              
              {/* Left Side: Visual */}
              <div className="w-full lg:w-72 h-48 lg:h-auto relative">
                <img 
                  src={booking.eventImage} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt={booking.eventTitle} 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/20 to-transparent lg:bg-gradient-to-t"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl">
                    <Ticket className="text-white" size={24} />
                  </div>
                </div>
              </div>

              {/* Middle Section: Info */}
              <div className="flex-1 p-8 lg:p-10 flex flex-col justify-between relative">
                {/* Perforation Line (Visual) */}
                <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-px border-r border-dashed border-slate-700 my-8"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">
                        {booking.eventTitle}
                      </h3>
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full text-xs">
                          <Calendar size={14} className="text-indigo-400" /> 
                          {new Date(booking.date || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1 rounded-full text-xs">
                          <MapPin size={14} className="text-indigo-400" /> 
                          {booking.venue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-8">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Seats</p>
                      <p className="text-lg font-black text-white">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Price</p>
                      <p className="text-lg font-black text-white">₹{booking.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-emerald-500 uppercase">Confirmed</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Booking ID</p>
                      <p className="text-xs font-mono text-slate-500 truncate">#{booking.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Stub/Action */}
              <div className="w-full lg:w-64 bg-slate-800/30 p-8 lg:p-10 flex flex-col items-center justify-center gap-6">
                <div className="w-32 h-32 bg-white p-2 rounded-2xl shadow-inner">
                  {/* Mock QR Code */}
                  <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>

            {/* Decorative Ticket Notches */}
            <div className="hidden lg:block absolute right-64 -top-4 w-8 h-8 bg-black rounded-full border border-slate-800"></div>
            <div className="hidden lg:block absolute right-64 -bottom-4 w-8 h-8 bg-black rounded-full border border-slate-800"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
