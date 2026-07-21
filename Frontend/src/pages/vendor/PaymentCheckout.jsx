import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ADVANCE_CAP = 10000;
const ADVANCE_MIN = 5000;

const PaymentCheckout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [stallInfo, setStallInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(!booking);

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(5000);

  // Fetch Booking if not passed via state
  useEffect(() => {
    if (booking) {
      setIsLoading(false);
      return;
    }
    
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/stall-bookings/my?vendor=${encodeURIComponent(user.name)}`);
        if (res.data.success) {
          const found = res.data.data.find(b => b._id === bookingId);
          if (found) {
            setBooking(found);
          } else {
            toast.error('Booking not found.');
            navigate('/vendor/booking-payment');
          }
        }
      } catch (err) {
        toast.error('Error fetching booking details.');
        navigate('/vendor/booking-payment');
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.name && bookingId) fetchBooking();
  }, [user, bookingId, booking, navigate]);

  // Fetch stall info for the booking
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
        navigate('/vendor/booking-payment');
      }
    };
    fetchStallData();
  }, [booking, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const amt = Number(advanceAmount);
    if (!Number.isFinite(amt) || amt < ADVANCE_MIN || amt > ADVANCE_CAP) {
      toast.error(`Enter an advance between LKR ${ADVANCE_MIN.toLocaleString()} and LKR ${ADVANCE_CAP.toLocaleString()}.`);
      setIsProcessing(false);
      return;
    }

    try {
      const res = await api.put(`/stall-bookings/${booking._id}/confirm`, { advanceAmount: amt });
      if (res.data.success) {
        toast.success('Advance verified. Stall locked. Opening your check-in QR…');
        navigate(`/vendor/qr/${booking._id}`);
        return;
      }
      toast.error(res.data?.message || 'Payment was not successful.');
    } catch (err) {
      toast.error('Error processing payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const getPriceBreakdown = () => {
    if (!stallInfo) return { total: 0, advanceLabel: '0' };
    const total = stallInfo.price;
    const adv = Number.isFinite(Number(advanceAmount)) ? Number(advanceAmount) : ADVANCE_MIN;
    return {
      total: total.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      advanceLabel: adv.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    };
  };

  const prices = getPriceBreakdown();

  if (isLoading || !stallInfo) return (
    <div className="flex flex-col items-center justify-center p-24">
       <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
       <div className="text-slate-500 font-medium">Initializing Secure Gateway...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <button
          onClick={() => navigate('/vendor/booking-payment')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Selection
        </button>

      <div className="mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-sm uppercase tracking-widest rounded-full mb-3 shadow-sm">
            Event Billing
          </div>
          <h1 className="text-4xl font-semibold text-primary tracking-tight">Secure Advance Payment</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Pay an advance up to LKR {ADVANCE_CAP.toLocaleString()} to lock your stall. After verification you receive a unique check-in QR for event day.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
        
        {/* Payment Form side */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden pointer-events-none">
             <span className="text-9xl leading-none font-semibold tracking-tighter block transform translate-x-4">💳</span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Advance amount</h3>
          <div className="mb-8 relative z-10">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">
              Lock advance (LKR {ADVANCE_MIN.toLocaleString()} – {ADVANCE_CAP.toLocaleString()})
            </label>
            <input
              type="range"
              min={ADVANCE_MIN}
              max={ADVANCE_CAP}
              step={100}
              value={Math.min(ADVANCE_CAP, Math.max(ADVANCE_MIN, advanceAmount))}
              onChange={(e) => setAdvanceAmount(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-orange-500 h-2 rounded-lg cursor-pointer disabled:opacity-50"
            />
            <div className="flex items-center justify-between gap-4 mt-3">
              <input
                type="number"
                min={ADVANCE_MIN}
                max={ADVANCE_CAP}
                step={100}
                value={advanceAmount}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n)) setAdvanceAmount(Math.min(ADVANCE_CAP, Math.max(ADVANCE_MIN, n)));
                }}
                disabled={isProcessing}
                className="w-40 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-sm text-slate-500 font-medium flex-1">
                Maximum advance to lock: <strong className="text-slate-800">LKR {ADVANCE_CAP.toLocaleString()}</strong>
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Card details</h3>
          
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="mb-5 relative">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Name on Card <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Card Number <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Expiry <span className="text-red-500">*</span></label>
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
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">CVV <span className="text-red-500">*</span></label>
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
                    <span className="tracking-wide text-lg">Pay advance LKR {prices.advanceLabel}</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-widest">
               <span>🔒</span> 256-bit SSL Encrypted Transaction
            </div>
          </form>
        </div>

        {/* Order Summary side */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-lg relative h-max">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-200 pb-4 tracking-tight flex items-center gap-2">
            <span>🛒</span> Order Summary
          </h3>
          
          <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-1 h-full bg-primary absolute left-0 top-0"></div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Event Registration</div>
            <div className="font-bold text-slate-800 text-lg leading-tight ml-2">{booking.eventName}</div>
          </div>
          
          <div className="mb-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-1 h-full bg-accent absolute left-0 top-0"></div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-2">Stall Allocation</div>
            <div className="font-semibold text-primary text-xl leading-tight ml-2 flex justify-between items-center">
               <span>{booking.stallNumber}</span>
               <span className="text-sm font-bold text-slate-500 uppercase">{booking.stallName}</span>
            </div>
            <div className="mt-3 ml-2 flex gap-2">
               <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 text-sm font-semibold uppercase tracking-wider rounded-lg border border-green-200">{stallInfo.locationCategory} Category</span>
               <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-sm font-bold uppercase tracking-wider rounded-lg border border-slate-200">{stallInfo.stallType}</span>
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
               <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Your advance</span>
               <span className="font-semibold text-slate-800 text-xl tracking-tight">LKR</span>
            </div>
            <span className="font-semibold text-4xl tracking-tighter text-green-600 drop-shadow-sm">{prices.advanceLabel}</span>
          </div>

          <div className="mt-8 p-5 rounded-2xl text-sm leading-relaxed bg-blue-50 border border-blue-100 text-blue-800 shadow-inner flex gap-3 items-start">
            <span className="text-xl">ℹ️</span>
            <div>
               <strong className="font-semibold tracking-tight mb-1 block">Stall lock</strong> 
               Pay <strong className="font-bold">LKR {prices.advanceLabel}</strong> now (cap LKR {ADVANCE_CAP.toLocaleString()}) to lock this stall. You will get a unique QR for organizer check-in on the event day.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentCheckout;
