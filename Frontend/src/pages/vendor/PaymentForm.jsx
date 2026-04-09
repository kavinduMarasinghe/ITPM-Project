import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [income, setIncome] = useState('');
  const [reference, setReference] = useState('');
  const [event, setEvent] = useState('');
  const percentage = 15; // 15% to university

  const calculatedAmount = income ? (parseFloat(income) * (percentage / 100)).toFixed(2) : '0.00';

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Payment submitted! Event: ${event} | Amount: LKR ${calculatedAmount}`);
    navigate('/vendor/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8 px-2">
        <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3 shadow-sm">
          Revenue Management
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">University Revenue Share</h1>
        <p className="text-muted-foreground mt-2 font-medium">Remit the university's percentage of stall income after event closure.</p>
      </div>

      <div className="max-w-3xl px-2">
        <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          
          <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl mb-10 flex gap-5 items-start">
            <div className="text-3xl bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-primary/5">ℹ️</div>
            <div className="text-sm leading-relaxed text-slate-600">
              <strong className="text-primary font-black block mb-1">Event Management Policy</strong>
              As per the vendor agreement, you are required to remit <span className="font-bold text-primary">{percentage}%</span> of your total gross income generated during the event to the university within 3 days of event closure.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-slate-700 uppercase tracking-widest ml-1">Vendor Business Name</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-400 outline-none cursor-not-allowed" 
                value={user?.businessName || user?.name || ''} 
                readOnly 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-slate-700 uppercase tracking-widest ml-1">Select Completed Event <span className="text-red-500">*</span></label>
              <select 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer" 
                required 
                value={event} 
                onChange={(e) => setEvent(e.target.value)}
              >
                <option value="">-- Choose Completed Event --</option>
                <option value="Annual Tech Innovation Expo 2026">Annual Tech Innovation Expo 2026</option>
                <option value="Campus Career Fair 2026">Campus Career Fair 2026</option>
                <option value="International Food Festival">International Food Festival</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-slate-700 uppercase tracking-widest ml-1">Total Gross Income Generated (LKR) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-xl pl-16 shadow-inner" 
                  placeholder="0.00" 
                  required 
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 pointer-events-none">LKR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 rounded-3xl my-10 bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
              <div>
                <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1.5">University Share</div>
                <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                   <span>{percentage}</span>
                   <span className="text-sm opacity-60">%</span>
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-right">Amount Payable</div>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">
                  <span className="text-sm align-middle mr-1.5 opacity-60">LKR</span>
                  {calculatedAmount}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[0.7rem] font-black text-slate-700 uppercase tracking-widest ml-1">Bank Transfer Reference Number <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm" 
                placeholder="e.g. BOC-12345678" 
                required 
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-3 flex items-center gap-2 px-2">
                <span className="text-blue-500">🏦</span> Please transfer to: <span className="text-primary underline decoration-2 underline-offset-4">123-456-789 (BOC Malabe)</span>
              </div>
            </div>

            <div className="pt-8 transition-transform hover:-translate-y-1">
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 transition-all text-lg tracking-tight uppercase"
              >
                Submit Revenue Declaration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
