import React, { useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { useStore } from './store/useStore';
import { SeatMap } from './components/SeatMap';
import { AdminDashboard } from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  LogOut, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Search,
  Bell,
  User as UserIcon,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Sun,
  Moon
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  venue: string;
  date: string;
  image: string;
  price: number;
  category: string;
  description: string;
}

import { BookingSuccess } from './components/BookingSuccess';
import { MyBookings } from './components/MyBookings';
import { LoginScreen } from './components/LoginScreen';
import { fetchAndSeedEvents } from './services/eventService';

import { AuthProvider, useAuth } from './components/AuthContext';
import { AuthModal } from './components/AuthModal';

import { Toast, useToast } from './components/Toast';
import bookTheShowLogoLightTheme from './assets/booktheshow.png';
import bookTheShowLogoDarkTheme from './assets/booktheshow-dark.png';

function AppContent() {
  const footerLinks = {
    helpCenter: "mailto:support@booktheshow.app?subject=Help%20Center%20Support",
    terms: "https://bookmyshow.com/terms-and-conditions",
    privacy: "https://bookmyshow.com/privacy",
    socials: {
      facebook: "https://www.facebook.com/bookmyshow",
      instagram: "https://www.instagram.com/bookmyshowin",
      youtube: "https://www.youtube.com/@bookmyshow",
      twitter: "https://x.com/bookmyshow",
    },
  };

  const { user, setUser, initSocket, view, setView } = useStore();
  const { user: authUser, logout: authLogout, loading: authLoading } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('bts-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('bts-theme', theme);
  }, [theme]);

  const brandLogo = theme === 'dark' ? bookTheShowLogoDarkTheme : bookTheShowLogoLightTheme;

  useEffect(() => {
    initSocket();
    fetchAndSeedEvents();
    
    if (!authLoading) {
      setUser(authUser as any);
      setLoading(false);
      if (authUser) {
        showToast(`Welcome back, ${authUser.displayName || 'User'}!`, 'success');
      }
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('date', 'asc'));
    const unsubscribeEvents = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[]);
    });

    return () => {
      unsubscribeEvents();
    };
  }, []);

  const handleLogout = async () => {
    await authLogout();
    setView('home');
    setSelectedEvent(null);
    showToast('Logged out successfully', 'success');
  };

  const handleEventSelect = (event: Event) => {
    if (!authUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedEvent(event);
  };

  const renderContent = () => {
    if (view === 'admin') return <AdminDashboard theme={theme} />;
    if (view === 'bookings') return <MyBookings />;
    if (view === 'success') return <BookingSuccess />;
    
    if (selectedEvent) {
      return (
        <motion.div
          key="booking"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-10"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold group"
              >
                <div className="p-1.5 bg-slate-900 rounded-lg group-hover:bg-indigo-600 transition-colors">
                  <ChevronRight size={16} className="rotate-180" />
                </div>
                Back to Events
              </button>
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/30">
                  {selectedEvent.category}
                </span>
              </div>
              <h2 className="text-5xl font-black mb-4 tracking-tighter">{selectedEvent.title}</h2>
              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <span className="flex items-center gap-2 font-medium"><MapPin size={18} className="text-indigo-500" /> {selectedEvent.venue}</span>
                <span className="flex items-center gap-2 font-medium"><Calendar size={18} className="text-amber-500" /> {new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[10px] font-black">
                  +2k
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 text-right">Interested</p>
            </div>
          </div>

          <SeatMap eventId={selectedEvent.id} price={selectedEvent.price} />
        </motion.div>
      );
    }

    return (
      <motion.div
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Recommended Events</h2>
            <p className="text-slate-500 mt-2">Handpicked experiences just for you</p>
          </div>
          <div className="flex gap-2">
            {['All', 'Movies', 'Concerts'].map(cat => (
              <button key={cat} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold hover:bg-indigo-600 transition-all">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {events.map((event) => (
            <motion.div
              key={event.id}
              whileHover={{ y: -10 }}
              onClick={() => handleEventSelect(event)}
              className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 cursor-pointer group shadow-xl"
            >
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={event.image} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={event.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400 bg-black/50 backdrop-blur-md px-2 py-1 rounded">
                    ₹{event.price} onwards
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                  <MapPin size={14} />
                  <span>{event.venue}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </AnimatePresence>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-6 py-4 ${theme === 'dark' ? 'bg-black/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setView('home'); setSelectedEvent(null)}}>
              <img src={brandLogo} alt="Book The Show" className="h-8 w-auto object-contain" />
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <button onClick={() => {setView('home'); setSelectedEvent(null)}} className={`hover:text-white transition-colors ${view === 'home' ? 'text-white' : ''}`}>Explore</button>
              <button onClick={() => {
                if (!authUser) {
                  setIsAuthModalOpen(true);
                } else {
                  setView('bookings');
                }
              }} className={`hover:text-white transition-colors ${view === 'bookings' ? 'text-white' : ''}`}>My Bookings</button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'bg-slate-900 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'}`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`hidden md:flex items-center border rounded-full px-4 py-1.5 gap-2 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
              <Search size={16} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            
            {authUser ? (
              <>
                {authUser.role === 'admin' && (
                  <button 
                    onClick={() => setView(view === 'admin' ? 'home' : 'admin')}
                    className={`p-2 rounded-xl transition-all ${view === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    <LayoutDashboard size={20} />
                  </button>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold">{authUser.displayName || 'User'}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{authUser.role}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 bg-slate-900 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                Login / Signup
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <footer className={`mt-16 border-t ${theme === 'dark' ? 'border-slate-900 bg-[#090909]' : 'border-slate-200 bg-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={brandLogo} alt="Book The Show" className="h-9 w-auto object-contain" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your destination for booking movie and event tickets with real-time seats and instant confirmation.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => { setView('home'); setSelectedEvent(null); }} className="hover:text-white transition-colors">Explore Events</button></li>
                <li><button onClick={() => setView('bookings')} className="hover:text-white transition-colors">My Bookings</button></li>
                <li><button onClick={() => setView('admin')} className="hover:text-white transition-colors">Dashboard</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href={footerLinks.helpCenter} className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href={footerLinks.terms} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href={footerLinks.privacy} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-300 mb-4">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a
                  href={footerLinks.socials.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={footerLinks.socials.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={footerLinks.socials.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
                <a
                  href={footerLinks.socials.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-3">
            <p>© {new Date().getFullYear()} BOOK THE SHOW. All rights reserved.</p>
            <p>Made for seamless movie and event ticket booking.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
