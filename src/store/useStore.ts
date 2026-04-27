import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  socket: Socket | null;
  initSocket: () => void;
  view: 'home' | 'admin' | 'bookings' | 'success';
  setView: (view: 'home' | 'admin' | 'bookings' | 'success') => void;
  lastBooking: any | null;
  setLastBooking: (booking: any | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  socket: null,
  initSocket: () => {
    if (get().socket) return;
    const socket = io();
    set({ socket });
  },
  view: 'home',
  setView: (view) => set({ view }),
  lastBooking: null,
  setLastBooking: (lastBooking) => set({ lastBooking }),
}));
