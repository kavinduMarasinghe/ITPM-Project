import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const BookingPayment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [availableBookings, setAvailableBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  // Fetch 'PreApproved' bookings 
  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await api.get(`/stall-bookings/my?vendor=${encodeURIComponent(user.name)}`);
        if (res.data.success) {
          const preApproved = res.data.data.filter(b => b.status === 'PreApproved');
          setAvailableBookings(preApproved);
        }
      } catch (err) {
        toast.error('Error fetching pending payments.');
      } finally {
        setIsLoadingBookings(false);
      }
    };
    if (user?.name) fetchMyBookings();
  }, [user]);

  if (isLoadingBookings) return (
    <div className="flex flex-col items-center justify-center p-24">
       <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
       <div className="text-slate-500 font-medium">Checking Pending Payments...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-sm uppercase tracking-widest rounded-full mb-3 shadow-sm">
          Event Billing
        </div>
        <h1 className="text-4xl font-semibold text-primary tracking-tight">Select Booking to Pay</h1>
        <p className="text-muted-foreground mt-2 font-medium">Choose an advance up to LKR 10,000 on the next screen to lock your stall after admin has accepted your request.</p>
      </div>

      {availableBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-xl shadow-slate-200/40 border border-slate-100 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-slate-800">No Pending Payments!</h3>
            <p className="text-slate-500 mt-2">All your active reservations are either paid or awaiting admin approval.</p>
            <button onClick={() => navigate('/vendor/dashboard')} className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Return to Dashboard</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableBookings.map(b => (
              <div key={b._id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-primary">{b.stallNumber}</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase">{b.stallName}</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Event</span>
                  {b.eventName}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/vendor/checkout/${b._id}`, { state: { booking: b } });
                  }} 
                  className="mt-auto w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md"
                >
                  Select & Pay Advance
                </button>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingPayment;
