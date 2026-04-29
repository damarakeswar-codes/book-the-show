import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { 
  LayoutDashboard, Film, Calendar, Ticket, Users, BarChart3, 
  CreditCard, Settings, Search, Bell, ChevronDown, Download, 
  MoreHorizontal, ExternalLink, TrendingUp, TrendingDown, Clock, Star,
  ArrowUpRight, Filter, LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const AdminDashboard = ({ theme = 'dark' }: { theme?: 'dark' | 'light' }) => {
  const { setView, user: authUser } = useStore();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    conversionRate: 4.2
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [topEvents, setTopEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Analytics');
  const isLight = theme === 'light';
  const panelClass = isLight
    ? 'bg-white p-8 rounded-[2.5rem] border border-slate-200'
    : 'bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800/50';
  const statCardClass = isLight
    ? 'bg-white p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all group'
    : 'bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-slate-800/50 hover:border-indigo-500/30 transition-all group';

  useEffect(() => {
    setLoading(true);
    
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      let revenue = 0;
      const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      bookings.forEach((b: any) => revenue += (b.totalAmount || 0));
      setStats(prev => ({ ...prev, totalBookings: snap.size, totalRevenue: revenue }));
      
      // Recent Bookings
      const sortedBookings = [...bookings].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentBookings(sortedBookings.slice(0, 5));

      // Revenue Chart Data
      const groups = bookings.reduce((acc: any, b: any) => {
        if (!b.createdAt) return acc;
        const date = new Date(b.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + (b.totalAmount || 0);
        return acc;
      }, {});
      setChartData(Object.entries(groups).map(([name, value]) => ({ name, value })));

      // Distribution
      const eventGroups = bookings.reduce((acc: any, b: any) => {
        const title = b.eventTitle || 'Unknown';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});
      const eventData = Object.entries(eventGroups).map(([name, value]) => ({ name, value }));
      setCategoryData(eventData);
      setTopEvents(eventData.sort((a: any, b: any) => b.value - a.value).slice(0, 3));
      
      setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setStats(prev => ({ ...prev, activeUsers: snap.size }));
    });

    return () => {
      unsubBookings();
      unsubUsers();
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Movies', icon: Film },
    { name: 'Events', icon: Calendar },
    { name: 'Bookings', icon: Ticket },
    { name: 'Users', icon: Users },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Payments', icon: CreditCard },
    { name: 'Settings', icon: Settings },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}CR`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString()}`;
  };

  const formatNumber = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  return (
    <div className={`flex min-h-screen ${isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0a0b14] text-white'}`}>
      <main className="flex-1 flex flex-col">
        <div className="space-y-10 mx-auto w-full">
          {/* Title Section */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-white uppercase">Analytics Overview</h2>
              <p className={`${isLight ? 'text-slate-600' : 'text-slate-500'} mt-2 font-medium`}>Monitoring the pulse of BTS ecosystem.</p>
            </div>
            <div className="flex gap-4">
              <button className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${isLight ? 'bg-white border border-slate-300 text-slate-900 hover:bg-slate-100' : 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800'}`}>
                <Calendar size={18} className="text-indigo-500" />
                Last 30 Days
                <ChevronDown size={16} />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                Export Report
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), trend: '+12%', icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Total Bookings', value: formatNumber(stats.totalBookings), trend: '+8%', icon: Ticket, color: 'text-rose-400', bg: 'bg-rose-400/10' },
              { label: 'Active Users', value: formatNumber(stats.activeUsers), trend: '+15%', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Conversion Rate', value: `${stats.conversionRate}%`, trend: '-0.5%', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10', down: true },
            ].map((item, i) => (
              <div key={i} className={statCardClass}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className={item.color} size={24} />
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${item.down ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {item.down ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {item.trend}
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{item.label}</p>
                <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{item.value}</h3>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 ${panelClass}`}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Revenue Growth</h3>
                  <p className="text-slate-500 text-xs font-medium mt-1">Last 30 Days trend analysis</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cinema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events</span>
                  </div>
                </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${panelClass} flex flex-col`}>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Bookings Distribution</h3>
              <p className="text-slate-500 text-xs font-medium mb-10">Movies vs Events volume</p>
              
              <div className="space-y-8 flex-1">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Movies</span>
                    <span className="text-xs font-black text-indigo-400">32.4K (72%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[72%] shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xs font-black text-white uppercase tracking-widest">Events</span>
                    <span className="text-xs font-black text-rose-400">12.8K (28%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full w-[28%] shadow-[0_0_12px_rgba(244,63,94,0.4)]" />
                  </div>
                </div>
              </div>

              <div className="mt-auto p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Movies increased by <span className="text-white font-bold">14%</span> this weekend following the release of "Neon Nights".
                </p>
              </div>
            </div>
          </div>

          {/* Lists Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 ${panelClass}`}>
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Top Performing Content</h3>
                <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">View All</button>
              </div>
              <div className="space-y-6">
                {topEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-800/20 rounded-3xl border border-slate-800/50 hover:border-slate-700 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 group-hover:scale-105 transition-transform">
                        <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&w=100&q=80`} className="w-full h-full object-cover" alt="event" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">{event.name}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Movie • Action/Sci-Fi</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white tracking-tighter">{formatNumber(event.value * 100)}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                        {i === 0 ? 'Top Gainer' : 'Stable'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={panelClass}>
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Latest Bookings</h3>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <div className="space-y-8">
                {recentBookings.map((booking, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={`https://i.pravatar.cc/150?u=${booking.userId}`} className="w-full h-full object-cover" alt="user" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-white truncate">{booking.userName || 'Anonymous User'}</h4>
                        <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap ml-2">
                          {i === 0 ? '2 MINS AGO' : i === 1 ? '15 MINS AGO' : '1 HR AGO'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Booked {booking.seats?.length} seats for <span className="text-indigo-400 font-bold">{booking.eventTitle}</span>
                      </p>
                      <p className="text-xs font-black text-emerald-500 mt-1">₹{booking.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Table */}
          <div className={panelClass}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Detailed Bookings Log</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                <Filter size={14} />
                All Status
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-6 pb-2">Booking ID</th>
                    <th className="px-6 pb-2">User</th>
                    <th className="px-6 pb-2">Movie/Event</th>
                    <th className="px-6 pb-2">Date</th>
                    <th className="px-6 pb-2">Seats</th>
                    <th className="px-6 pb-2">Amount</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, i) => (
                    <tr key={i} className="group hover:bg-slate-800/20 transition-all">
                      <td className="px-6 py-5 bg-slate-800/10 rounded-l-3xl border-y border-l border-slate-800/50">
                        <span className="text-xs font-black text-indigo-400">#NC-{booking.id?.slice(-5).toUpperCase()}</span>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white">
                            {booking.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-black text-white">{booking.userName || 'User'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <p className="text-xs font-bold text-slate-400">{booking.eventTitle}</p>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <p className="text-xs font-bold text-slate-500">{new Date(booking.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <span className="text-xs font-black text-white">{booking.seats?.length.toString().padStart(2, '0')}</span>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <span className="text-xs font-black text-white">₹{booking.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 border-y border-slate-800/50">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          booking.paymentStatus === 'paid' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-5 bg-slate-800/10 rounded-r-3xl border-y border-r border-slate-800/50 text-right">
                        <button className="p-2 text-slate-600 hover:text-indigo-400 transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-10 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Showing 1-10 of {formatNumber(stats.totalBookings * 100)} entries
              </p>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-600 hover:text-white transition-all">
                  <ChevronDown size={16} className="rotate-90" />
                </button>
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${p === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-500 hover:text-white'}`}>
                    {p}
                  </button>
                ))}
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/50 text-slate-600 hover:text-white transition-all">
                  <ChevronDown size={16} className="-rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
