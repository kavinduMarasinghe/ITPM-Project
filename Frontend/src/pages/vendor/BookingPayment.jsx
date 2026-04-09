import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const BookingPayment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(!location.state?.booking);
  const [stallInfo, setStallInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State (Simulated)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Fetch 'PreApproved' bookings if no booking was passed via state
  useEffect(() => {
    if (booking) {
      setIsLoadingBookings(false);
      return;
    }
    
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
  }, [user, booking]);

  // Fetch stall info for selected booking
  useEffect(() => {
    if (!booking) return;

    const fetchStallData = async () => {
      try {
        const res = await api.get(`/stalls/${booking.stallId}`);
        if (res.data.success) {
          setStallInfo(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to fetch stall pricing information.');
        setBooking(null);
      }
    };
    fetchStallData();
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate 2-second payment gateway processing
    setTimeout(async () => {
      try {
        const res = await api.put(`/stall-bookings/${booking._id}/confirm`);
        if (res.data.success) {
          toast.success('Advance payment processed! Booking sent to Admin for final lock.');
          navigate('/vendor/my-bookings');
        }
      } catch (err) {
        toast.error('Error processing payment: ' + (err.response?.data?.message || err.message));
        setIsProcessing(false);
      }
    }, 2000);
  };

  const getPriceBreakdown = () => {
    if (!stallInfo) return { total: 0, advance: 0 };
    const total = stallInfo.price;
    const advance = total * 0.5; // 50% advance
    return {
      total: total.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      advance: advance.toLocaleString('en-US', { minimumFractionDigits: 2 })
    };
  };

  const prices = getPriceBreakdown();

  if (isLoadingBookings) return (
    <div className="flex flex-col items-center justify-center p-24">
       <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
       <div className="text-slate-500 font-medium">Checking Pending Payments...</div>
    </div>
  );

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3 shadow-sm">
            Event Billing
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Select Booking to Pay</h1>
          <p className="text-muted-foreground mt-2 font-medium">You must pay an advance to lock your reservations.</p>
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
               <div key={b._id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col hover:-translate-y-1 transition-transform cursor-pointer" onClick={() => setBooking(b)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-primary">{b.stallNumber}</h3>
                      <p className="text-xs font-bold text-slate-500 uppercase">{b.stallName}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Event</span>
                    {b.eventName}
                  </div>
                  <button className="mt-auto w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-md">
                    Select & Pay Advance
                  </button>
               </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!stallInfo) return (
    <div className="flex flex-col items-center justify-center p-24">
       <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
       <div className="text-slate-500 font-medium">Initializing Secure Gateway...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3 shadow-sm">
            Event Billing
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Secure Advance Payment</h1>
          <p className="text-muted-foreground mt-2 font-medium">Complete your transaction to lock the FCFS stall reservation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* Payment Form side */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden pointer-events-none">
             <span className="text-9xl leading-none font-black tracking-tighter block transform translate-x-4">💳</span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Card Details</h3>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-5 relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Name on Card <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800 shadow-sm pl-12" 
                  placeholder="e.g. John Doe" 
                  required 
                  disabled={isProcessing}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
              </div>
            </div>
            
            <div className="mb-5 relative">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Card Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800 font-mono shadow-sm pl-12 tracking-wider" 
                  placeholder="0000 0000 0000 0000" 
                  required 
                  maxLength="19"
                  disabled={isProcessing}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">💳</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-8">
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Expiry (MM/YY) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800 shadow-sm pl-10" 
                    placeholder="MM/YY" 
                    required 
                    maxLength="5"
                    disabled={isProcessing}
                    value={expiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                      setExpiry(val);
                    }}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📅</span>
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">CVV <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800 shadow-sm pl-10" 
                    placeholder="123" 
                    required 
                    maxLength="4"
                    disabled={isProcessing}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2 mb-4"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="tracking-wide">Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <span>🛡️</span>
                    <span className="tracking-wide text-lg">Pay Advance LKR {prices.advance}</span>
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                className="w-full bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-70" 
                onClick={() => navigate('/vendor/my-bookings')} 
                disabled={isProcessing}
              >
                Cancel & Return
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
               <span>🔒</span> 256-bit SSL Encrypted Transaction
            </div>
          </form>
        </div>

        {/* Order Summary side */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-lg relative h-max">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          
          <h3 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-200 pb-4 tracking-tight flex items-center gap-2">
            <span>🛒</span> Order Summary
          </h3>
          
          <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-1 h-full bg-primary absolute left-0 top-0"></div>
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Event Registration</div>
            <div className="font-bold text-slate-800 text-lg leading-tight ml-2">{booking.eventName}</div>
          </div>
          
          <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-1 h-full bg-accent absolute left-0 top-0"></div>
            <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Stall Allocation</div>
            <div className="font-black text-primary text-xl leading-tight ml-2 flex justify-between items-center">
               <span>{booking.stallNumber}</span>
               <span className="text-sm font-bold text-slate-500 uppercase">{booking.stallName}</span>
            </div>
            <div className="mt-3 ml-2 flex gap-2">
               <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-[0.65rem] font-black uppercase tracking-wider rounded-lg border border-green-200">{stallInfo.locationCategory} Category</span>
               <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[0.65rem] font-bold uppercase tracking-wider rounded-lg border border-slate-200">{stallInfo.stallType}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed border-slate-300 mb-6">
             <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
               <span>Total Stall Tariff</span>
               <span className="font-bold text-slate-800">LKR {prices.total}</span>
             </div>
             <div className="flex justify-between items-center text-slate-500 font-medium text-sm">
               <span>Service Fee</span>
               <span>Included</span>
             </div>
          </div>
          
          <div className="flex justify-between items-end pt-5 border-t-2 border-slate-200">
            <div>
               <span className="block text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mb-1">Required Advance (50%)</span>
               <span className="font-black text-slate-800 text-xl tracking-tight">LKR</span>
            </div>
            <span className="font-black text-4xl tracking-tighter text-green-600 drop-shadow-sm">{prices.advance}</span>
          </div>

          <div className="mt-8 p-5 rounded-2xl text-sm leading-relaxed bg-blue-50 border border-blue-100 text-blue-800 shadow-inner flex gap-3 items-start">
            <span className="text-xl">ℹ️</span>
            <div>
               <strong className="font-black tracking-tight mb-1 block">Important Notice</strong> 
               You must pay this 50% advance to lock your reservation. The remaining balance of <strong className="font-bold">LKR {prices.advance}</strong> will be collected in cash on the event day.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingPayment;
