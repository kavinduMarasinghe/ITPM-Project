import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StallLayoutMap from '../StallLayoutMap';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedStall, setSelectedStall] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events/published');
        if (res.data.success) {
          const today = new Date();
          const list = Array.isArray(res.data.data)
            ? res.data.data
            : res.data.data?.events || [];
          const mapped = list.map((evt) => {
            const start = evt.startDate ? new Date(evt.startDate) : null;
            const end = evt.endDate ? new Date(evt.endDate) : start;
            let status = 'open';
            if (end && end < today) status = 'closed';
            else if (start && start > today) status = 'upcoming';
            return {
              id: evt.id,
              name: evt.eventTitle,
              date: start
                ? start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : '',
              location: evt.venue || evt.venueLocation || '',
              status,
              image: evt.imageUrl,
              stats: { available: 0, pending: 0, booked: 0 },
            };
          });
          setEvents(mapped);
          if (mapped.length > 0) setSelectedEventId(mapped[0].id);
        }
      } catch (err) {
        console.error('Error fetching events', err);
      }
    };
    fetchEvents();
  }, []);

  const fetchRequests = async () => {
    if (!user?.name) return;
    try {
      const res = await api.get(`/stall-bookings/my?vendor=${encodeURIComponent(user.name)}`);
      if (res.data.success) {
        const bookings = res.data.data;
        setMyBookings(bookings);
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        
        bookings.forEach(b => {
           if (b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'PreApproved') pending++;
           else if (b.status === 'Approved') approved++;
           else if (b.status === 'Rejected') rejected++;
        });
        
        setStats({ pending, approved, rejected });
      }
    } catch (err) {
      console.error('Error fetching bookings', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await api.get('/stalls');
        if (res.data.success) {
          const stallsWithCoords = res.data.data.map((stall, index) => {
            let x, y;
            if (stall.locationZone === 'Zone A') {
              x = 150 + (index % 3) * 100; y = 300 + Math.floor(index / 3) * 80;
            } else if (stall.locationZone === 'Zone B') {
              x = 550 + (index % 3) * 100; y = 300 + Math.floor(index / 3) * 80;
            } else if (stall.locationZone === 'VIP Area') {
              x = 350 + (index % 3) * 100; y = 150 + Math.floor(index / 3) * 80;
            } else {
              x = 150 + (index % 5) * 100; y = 150 + Math.floor(index / 5) * 80;
            }
            return { ...stall, x, y };
          });
          setStalls(stallsWithCoords);
        }
      } catch (err) {
        console.error('Map stalls error:', err);
      }
    };
    fetchStalls();
  }, []);

  const handlePayment = (booking) => {
    navigate('/vendor/booking-payment', { state: { booking } });
  };

  const CountdownTimer = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      if (!deadline) return;
      const updateTimer = () => {
        const diff = new Date(deadline) - new Date();
        if (diff <= 0) {
          setTimeLeft('Expired');
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // update every minute
      return () => clearInterval(interval);
    }, [deadline]);

    return <span>{timeLeft}</span>;
  };

  const chartData = [
    { name: 'Pending', count: stats.pending, color: '#f97316' }, // orange-500
    { name: 'Approved / Locked', count: stats.approved, color: '#10b981' }, // emerald-500
    { name: 'Rejected', count: stats.rejected, color: '#e11d48' }, // rose-600
  ];

  // Get active items to show in the Payments/Allocation section
  const activeBookings = myBookings.filter(b => b.status === 'PreApproved' || b.status === 'Confirmed' || b.status === 'Approved');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-sm uppercase tracking-widest rounded-full mb-3 shadow-sm">
            Control Center
          </div>
          <h1 className="text-4xl font-semibold text-primary tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-medium">Overview of your external event bookings, approval status, and financial commitments.</p>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden border-l-8 border-blue-600">
          <div className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Total Events</div>
          <div>
            <div className="text-5xl font-semibold tracking-tighter text-primary">12</div>
            <div className="text-sm font-bold uppercase tracking-widest mt-2 text-blue-600">+2 this month</div>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <span className="text-7xl leading-none block">📅</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden border-l-8 border-orange-500">
          <div className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Pending Requests</div>
          <div>
            <div className="text-5xl font-semibold tracking-tighter text-primary">{stats.pending}</div>
            <div className="text-sm font-bold uppercase tracking-widest mt-2 text-orange-600">Awaiting approval</div>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <span className="text-7xl leading-none block">⏳</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden border-l-8 border-emerald-500">
          <div className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Approved Stalls</div>
          <div>
            <div className="text-5xl font-semibold tracking-tighter text-primary">{stats.approved}</div>
            <div className="text-sm font-bold uppercase tracking-widest mt-2 text-emerald-600">Active bookings</div>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <span className="text-7xl leading-none block">⭐</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden border-l-8 border-rose-600">
          <div className="text-sm font-bold uppercase tracking-widest mb-6 text-slate-400">Rejected</div>
          <div>
            <div className="text-5xl font-semibold tracking-tighter text-primary">{stats.rejected}</div>
            <div className="text-sm font-bold uppercase tracking-widest mt-2 text-rose-600">Check feedback</div>
          </div>
          <div className="absolute top-0 right-0 p-6 opacity-5">
             <span className="text-7xl leading-none block">❌</span>
          </div>
        </div>
      </div>

      {/* MY PENDING PAYMENTS & ALLOCATIONS */}
      {activeBookings.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">Action Required: Allocations & Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBookings.map(booking => (
              <div key={booking._id} className="bg-white border text-left border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden">
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-2 ${
                  booking.status === 'PreApproved' ? 'bg-orange-400' :
                  booking.status === 'Confirmed' ? 'bg-blue-400' : 'bg-emerald-500'
                }`}></div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{booking.stallNumber}</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{booking.stallName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                    booking.status === 'PreApproved' ? 'bg-orange-100 text-orange-700' :
                    booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {booking.status === 'PreApproved' ? 'Needs Payment' :
                     booking.status === 'Confirmed' ? 'Paid' : 'Locked'}
                  </div>
                </div>

                <div className="text-sm font-medium text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Event</span>
                  {booking.eventName}
                </div>

                <div className="mt-auto">
                  {booking.status === 'PreApproved' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm font-bold text-orange-800">
                        <span>Payment Deadline:</span>
                        <CountdownTimer deadline={booking.paymentDeadline} />
                      </div>
                      <button 
                        onClick={() => handlePayment(booking)}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors text-sm shadow-md"
                      >
                        Pay Advance Now
                      </button>
                    </div>
                  )}
                  {booking.advancePaid && (booking.status === 'Approved' || booking.status === 'Confirmed') && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <span className="text-2xl mb-2 block">🔒</span>
                      <p className="text-sm font-bold text-emerald-800">
                        {booking.status === 'Confirmed' ? 'Advance received — final lock pending' : 'Stall locked'}
                      </p>
                      <p className="text-sm font-medium text-emerald-600 mt-1 mb-3">Your check-in QR is available below.</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/vendor/qr/${booking._id}`)}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors text-sm shadow-md flex items-center justify-center gap-2"
                      >
                        <span className="text-sm">🎟️</span> View QR pass
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANALYTICS DASHBOARD SECTION */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-primary mb-6">Vendor Performance Analytics</h2>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col relative overflow-hidden">
           <p className="text-muted-foreground font-medium mb-8">View the real-time status distribution of your active stall requests.</p>
           
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                 <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} dx={-10} />
                 <Tooltip 
                   cursor={{ fill: 'transparent' }} 
                   contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} 
                 />
                 <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={80}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* UPCOMING EVENTS ROW */}
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-semibold text-primary">Upcoming Events</h2>
        <a href="#view-all" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View All</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {events.length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-500 font-medium">
            No published events yet. Check back once organizers publish their events.
          </div>
        )}
        {events.map((evt) => (
          <div key={evt.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 flex flex-col group">
            <div className="relative h-48 bg-slate-200 overflow-hidden">
               <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors duration-500 z-10"></div>
               <img src={evt.image} alt={evt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 blur-[2px] group-hover:blur-0" />
               <div className="absolute top-4 left-4 z-20">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest shadow-lg ${
                    evt.status === 'upcoming' ? 'bg-amber-400 text-amber-900' :
                    evt.status === 'open' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    {evt.status}
                  </div>
               </div>
               <div className="absolute bottom-4 left-4 right-4 z-20">
                 <h3 className="text-2xl font-semibold text-white leading-tight shadow-sm">{evt.name}</h3>
               </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">
                <span>{evt.date}</span>
                <span className="truncate ml-2">{evt.location}</span>
              </div>
              <button
                onClick={() => navigate('/vendor/stalls/layout')}
                className={`mt-auto w-full py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  evt.status === 'closed'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
                }`}
                disabled={evt.status === 'closed'}
              >
                {evt.status === 'closed' ? 'Booking Closed' : (
                  <>
                    Browse Stalls & Book
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MAP & BOOKING SECTION */}
      <div id="map-section" className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col mb-20">
        <div className="flex flex-col md:flex-row justify-between items-center p-8 lg:px-10 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold text-primary mb-1">Stall Booking: <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">Event Venue Map</span></h2>
            <p className="text-slate-500 font-medium">Select a stall from the structural map below to view details and invoke reservation holds.</p>
          </div>
        </div>
        
        <StallLayoutMap role="vendor" />
      </div>
    </div>
  );
};

export default VendorDashboard;
