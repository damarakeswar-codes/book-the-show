import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  setDoc, 
  serverTimestamp,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { Armchair, Loader2, CheckCircle2, Ticket, Calendar, Clock, MapPin } from 'lucide-react';
import { DateSelector } from './DateSelector';
import { TimeSelector } from './TimeSelector';
import { SeatLayout } from './SeatLayout';
import { BookingSummary } from './BookingSummary';

interface SeatData {
  id: string;
  seatId: string;
  status: 'available' | 'locked' | 'booked';
  lockedBy?: string;
  price: number;
  category: 'Basic' | 'Standard' | 'Premium';
}

export const SeatMap = ({ eventId, price: basePrice }: { eventId: string; price: number }) => {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user, socket } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const envApiBaseUrl = ((import.meta as any).env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const orderEndpoint = envApiBaseUrl
    ? `${envApiBaseUrl}/api/payments/order`
    : ((import.meta as any).env.DEV ? 'http://localhost:3000/api/payments/order' : '/.netlify/functions/payments-order');
  const verifyEndpoint = envApiBaseUrl
    ? `${envApiBaseUrl}/api/payments/verify`
    : ((import.meta as any).env.DEV ? 'http://localhost:3000/api/payments/verify' : '/.netlify/functions/payments-verify');

  const selectedSeats = seats.filter(s => s.status === 'locked' && s.lockedBy === user?.uid).map(s => s.id);

  useEffect(() => {
    const q = query(collection(db, `events/${eventId}/seats`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const seatData = snapshot.docs.map(doc => {
        const data = doc.data();
        const row = data.seatId.charAt(0);
        let category: 'Basic' | 'Standard' | 'Premium' = 'Standard';
        let price = basePrice;

        if (['A', 'B'].includes(row)) {
          category = 'Basic';
          price = Math.floor(basePrice * 0.8);
        } else if (['F', 'G', 'H'].includes(row)) {
          category = 'Premium';
          price = Math.floor(basePrice * 1.5);
        }

        return {
          id: doc.id,
          ...data,
          category,
          price
        };
      }) as SeatData[];
      setSeats(seatData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId, basePrice]);

  const handleSeatClick = async (seat: SeatData) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedBy !== user?.uid) return;

    const isSelected = seat.status === 'locked' && seat.lockedBy === user?.uid;
    const newStatus = isSelected ? 'available' : 'locked';
    const seatRef = doc(db, `events/${eventId}/seats`, seat.id);

    try {
      await setDoc(seatRef, {
        seatId: seat.seatId,
        eventId: eventId,
        status: newStatus,
        lockedBy: newStatus === 'locked' ? user?.uid : null,
        lockExpiry: newStatus === 'locked' ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : null,
        price: seat.price,
        type: seat.category === 'Premium' ? 'VIP' : 'Regular' // Map category to type for consistency
      }, { merge: true });

      if (newStatus === 'locked') {
        socket?.emit('lock_seat', { seatId: seat.seatId, eventId, userId: user?.uid });
      } else {
        socket?.emit('unlock_seat', { seatId: seat.seatId, eventId, userId: user?.uid });
      }
    } catch (error) {
      console.error("Error updating seat:", error);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);

    const totalAmount = calculateTotal();
    try {
      const orderResponse = await fetch(orderEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, receipt: `booking_${Date.now()}` })
      });

      if (!orderResponse.ok) {
        throw new Error(
          `Order creation failed (${orderResponse.status}). Set VITE_API_BASE_URL correctly or verify your backend/serverless payment endpoint is deployed.`
        );
      }

      const order = await orderResponse.json();

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || "rzp_test_please_add_key_to_secrets", 
        amount: order.amount,
        currency: order.currency,
        name: "Book The Show (BTS)",
        description: "Event Booking",
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch(verifyEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });

          if (!verifyRes.ok) {
            throw new Error(`Payment verification failed (${verifyRes.status})`);
          }

          const verifyData = await verifyRes.json();

          if (verifyData.status === 'success') {
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            const eventData = eventDoc.data();

            const bookingData = {
              userId: user?.uid,
              eventId,
              eventTitle: eventData?.title,
              venue: eventData?.venue,
              date: selectedDate.toISOString(),
              time: selectedTime,
              seats: selectedSeats.map(id => seats.find(s => s.id === id)?.seatId),
              totalAmount,
              paymentStatus: 'paid',
              razorpayOrderId: order.id,
              razorpayPaymentId: response.razorpay_payment_id,
              createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'bookings'), bookingData);

            for (const seatId of selectedSeats) {
              const seat = seats.find(s => s.id === seatId);
              await setDoc(doc(db, `events/${eventId}/seats`, seatId), {
                status: 'booked',
                lockedBy: null,
                lockExpiry: null,
                seatId: seat?.seatId,
                eventId: eventId,
                price: seat?.price,
                type: seat?.category === 'Premium' ? 'VIP' : 'Regular'
              }, { merge: true });
            }
            
            socket?.emit('confirm_booking', { eventId, seats: selectedSeats });
            useStore.getState().setLastBooking(bookingData);
            useStore.getState().setView('success');
          }
          setBookingLoading(false);
        },
        modal: {
          ondismiss: function() {
            setBookingLoading(false);
          }
        },
        prefill: {
          email: user?.email,
          name: user?.displayName
        },
        theme: { color: "#6366f1" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={40} />
      <p className="text-slate-500 font-bold animate-pulse">Preparing Theatre Layout...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
      <div className="xl:col-span-2 space-y-10">
        {/* Date & Time Selection */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Select Date & Time</h3>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Choose your preferred show schedule</p>
            </div>
          </div>
          
          <DateSelector selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          <TimeSelector selectedTime={selectedTime} onTimeSelect={setSelectedTime} />
        </div>

        {/* Seat Layout */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <Armchair size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Choose Your Seats</h3>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Select the best view for your experience</p>
            </div>
          </div>
          
          <SeatLayout 
            seats={seats} 
            selectedSeats={selectedSeats} 
            onSeatClick={handleSeatClick} 
          />
        </div>
      </div>

      {/* Booking Summary */}
      <div className="xl:col-span-1">
        <BookingSummary 
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedSeats={selectedSeats.map(id => seats.find(s => s.id === id))}
          totalAmount={calculateTotal()}
          onBookNow={handleBooking}
          loading={bookingLoading}
        />
      </div>
    </div>
  );
};
