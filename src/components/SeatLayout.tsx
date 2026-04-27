import React from 'react';
import { motion } from 'motion/react';
import { Seat } from './Seat';

interface SeatData {
  id: string;
  seatId: string;
  status: 'available' | 'locked' | 'booked';
  lockedBy?: string;
  price: number;
  category: 'Basic' | 'Standard' | 'Premium';
}

interface SeatLayoutProps {
  seats: SeatData[];
  selectedSeats: string[];
  onSeatClick: (seat: SeatData) => void;
}

export const SeatLayout: React.FC<SeatLayoutProps> = ({ seats, selectedSeats, onSeatClick }) => {
  const rows = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const cols = Array.from({ length: 12 }, (_, i) => i + 1);

  const getSeatCategory = (row: string): 'Basic' | 'Standard' | 'Premium' => {
    if (['A', 'B'].includes(row)) return 'Basic';
    if (['C', 'D', 'E'].includes(row)) return 'Standard';
    return 'Premium';
  };

  const getSeatPrice = (row: string): number => {
    const category = getSeatCategory(row);
    if (category === 'Premium') return 500;
    if (category === 'Standard') return 300;
    return 150;
  };

  return (
    <div className="relative py-20 overflow-hidden flex flex-col items-center">
      {/* Seating Grid with Curve */}
      <div className="flex flex-col gap-6 items-center mb-24">
        {rows.map((row) => (
          <div key={row} className="flex gap-3 items-center">
            <span className="w-6 text-xs font-black text-slate-600 text-center">{row}</span>
            <div className="flex gap-2">
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const seat = seats.find(s => s.seatId === seatId) || {
                  id: seatId,
                  seatId,
                  status: 'available',
                  category: getSeatCategory(row),
                  price: getSeatPrice(row)
                } as SeatData;

                // Calculate curve
                const centerCol = (cols.length + 1) / 2;
                const distanceFromCenter = col - centerCol;
                const rotation = distanceFromCenter * 1.5; // Degrees
                const translateY = Math.abs(distanceFromCenter) * 1.5; // Pixels

                return (
                  <div 
                    key={seatId} 
                    style={{ 
                      transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    <Seat
                      id={seat.id}
                      seatId={seat.seatId}
                      status={seat.status}
                      category={getSeatCategory(row)}
                      price={getSeatPrice(row)}
                      isSelected={selectedSeats.includes(seat.id)}
                      onClick={() => onSeatClick(seat)}
                    />
                  </div>
                );
              })}
            </div>
            <span className="w-6 text-xs font-black text-slate-600 text-center">{row}</span>
          </div>
        ))}
      </div>

      {/* Screen Indicator at Bottom */}
      <div className="w-full max-w-2xl relative mt-10">
        <div className="w-full h-2 bg-indigo-500/20 rounded-full blur-sm"></div>
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mt-4 opacity-60">
          SCREEN THIS WAY
        </p>
      </div>

      {/* Legend */}
      <div className="mt-20 flex flex-wrap justify-center gap-8 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700"></div>
          <span className="text-xs font-bold text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
          <span className="text-xs font-bold text-slate-400">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-slate-700"></div>
          <span className="text-xs font-bold text-slate-400">Booked</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded bg-indigo-600/40 border border-indigo-500/50"></div>
          <span className="text-xs font-bold text-slate-400">Premium (₹500)</span>
        </div>
      </div>
    </div>
  );
};
