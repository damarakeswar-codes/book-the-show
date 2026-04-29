import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useStore } from '../store/useStore';
import { motion } from 'motion/react';
import { Ticket, Calendar, MapPin, Loader2, Download, Search, User, Share2, ArrowLeft } from 'lucide-react';

interface Booking {
  id: string;
  eventId: string;
  eventTitle?: string;
  eventImage?: string;
  venue?: string;
  date?: string;
  time?: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export const MyBookings = () => {
  const { user } = useStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const q = query(
          collection(db, 'bookings'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        let snap;

        try {
          snap = await getDocs(q);
        } catch {
          // Fallback when composite index is not ready in Firestore.
          const fallbackQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid)
          );
          snap = await getDocs(fallbackQuery);
        }
        
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
        
        bookingData.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
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

  const now = new Date();
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date || booking.createdAt);
    return bookingDate >= now;
  });
  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date || booking.createdAt);
    return bookingDate < now;
  });

  const visibleBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const featuredBooking = visibleBookings[0] || bookings[0];
  const collectionBookings = bookings.filter((booking) => booking.id !== featuredBooking.id).slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="mt-6 flex items-center gap-8 text-xs uppercase tracking-widest font-bold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`cursor-pointer pb-3 border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'text-rose-500 border-rose-500'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Upcoming Tickets
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`cursor-pointer pb-3 border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'text-rose-500 border-rose-500'
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Past Bookings
        </button>
      </div>
      <div className="space-y-8">
        <motion.div
          key={featuredBooking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[1.5rem] border border-slate-800 bg-gradient-to-b from-[#171717] to-[#121212] overflow-hidden shadow-2xl"
        >
          <div className="flex flex-col xl:flex-row">
            <div className="xl:w-[240px] h-[260px] xl:h-auto">
              <img
                src={featuredBooking.eventImage}
                alt={featuredBooking.eventTitle}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 p-6 sm:p-8 border-r border-slate-800">
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-semibold mb-5">
                <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">Action</span>
                <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-300">Drama</span>
                <span className="px-2 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30">Booked</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black mb-4">{featuredBooking.eventTitle}</h3>
              <p className="text-slate-300 mb-6">Language: English</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Theatre</p>
                  <p className="text-2xl font-bold">{featuredBooking.venue || 'Venue TBA'}</p>
                  <p className="text-slate-400 text-sm">{featuredBooking.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Show Timing</p>
                  <p className="text-2xl font-bold">
                    {new Date(featuredBooking.date || featuredBooking.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </p>
                  <p className="text-slate-400 text-sm">{featuredBooking.time || '7:30 PM'}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="font-semibold">BMS{featuredBooking.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-emerald-400 text-sm font-semibold">{featuredBooking.paymentStatus === 'paid' ? 'Paid' : featuredBooking.paymentStatus}</p>
                  <p className="text-4xl font-black">₹{featuredBooking.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="xl:w-[280px] p-6 sm:p-8 bg-[#1a1a1a] flex flex-col items-center justify-center gap-5">
              <div className="w-40 h-40 bg-white rounded-xl p-4">
                <div className="w-full h-full border border-slate-300 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 ${i % 3 === 0 || i % 7 === 0 ? 'bg-black' : 'bg-white'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Scan At Entry</p>
              <button className="w-full bg-rose-600 hover:bg-rose-500 transition-colors text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2">
                <Download size={16} />
                Download Ticket
              </button>
              <button className="w-full border border-slate-700 hover:border-slate-600 transition-colors text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {collectionBookings.length > 0 && (
          <>
            <h3 className="text-3xl font-black mb-5">More from your collection</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collectionBookings.map((booking) => (
                <div key={booking.id} className="bg-[#121212] border border-slate-900 rounded-2xl p-4 flex items-center gap-4">
                  <img
                    src={booking.eventImage}
                    alt={booking.eventTitle}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold">{booking.eventTitle}</p>
                    <p className="text-slate-400 text-sm">{booking.venue || 'Venue TBA'}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(booking.date || booking.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {booking.seats.length} seats
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
