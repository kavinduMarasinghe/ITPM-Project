import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterVendor = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    contactNumber: '',
    role: 'vendor'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.username) {
        setError('Please fill in all required fields.');
        return;
      }

      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(form.name)) {
        setError('Name cannot contain numbers or special characters.');
        return;
      }

      const emailRegex = /^[A-Za-z0-9]+@[A-Za-z0-9]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(form.email)) {
        setError('Email can only contain letters, numbers, @ and . symbols.');
        return;
      }

      if (form.contactNumber) {
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(form.contactNumber)) {
          setError('Contact number can only contain numbers (0-9).');
          return;
        }
      }

      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form);
      navigate('/vendor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Header */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent text-xl shadow-lg border border-primary/20 group-hover:scale-105 transition-transform">⚡</div>
          <span className="text-primary font-black text-2xl tracking-tighter">EventAura</span>
        </Link>
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          Already registered? <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In</Link>
        </span>
      </header>

      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 gap-8 px-6 py-20 z-10">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center gap-8 pl-8 pr-12 border-r border-border/50">
          <div>
            <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-xs uppercase tracking-widest rounded-full mb-6">VENDOR PORTAL</div>
            <h1 className="text-4xl xl:text-5xl font-black text-primary leading-tight mb-4 tracking-tight">Join EventAura</h1>
            <p className="text-lg text-muted-foreground">Register as a vendor to seamlessly book stalls at SLIIT campus events and expos.</p>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-2xl shrink-0">🗺️</div>
              <div>
                <h4 className="text-primary font-bold text-lg">Interactive Campus Map</h4>
                <p className="text-muted-foreground text-sm font-medium">Browse and lock in stalls directly on the campus floor plan.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center text-2xl shrink-0">📋</div>
              <div>
                <h4 className="text-primary font-bold text-lg">Easy Booking</h4>
                <p className="text-muted-foreground text-sm font-medium">Submit requests and track administrative approvals in real-time.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl shrink-0">🎪</div>
              <div>
                <h4 className="text-primary font-bold text-lg">Multiple Events</h4>
                <p className="text-muted-foreground text-sm font-medium">Gain access to all upcoming fairs, expos, and exhibitions natively.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex justify-center items-center">
          <div className="bg-white w-full max-w-[500px] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-border">
            
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-accent text-white shadow-md shadow-accent/30' : 'bg-slate-100 text-slate-400'}`}>1</div>
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full bg-accent transition-all duration-500 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= 2 ? 'bg-accent text-white shadow-md shadow-accent/30' : 'bg-slate-100 text-slate-400'}`}>2</div>
              </div>
              <h2 className="text-3xl font-black text-primary mb-2 tracking-tight">
                {step === 1 ? 'Personal Info' : 'Business & Security'}
              </h2>
              <p className="text-muted-foreground font-medium text-sm">
                {step === 1 ? 'Step 1 of 2 — Tell us about yourself' : 'Step 2 of 2 — Set up your account and password'}
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">⚠️</span> {error}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleNextStep} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                  <input type="text" name="name" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="e.g. Nimal Perera"
                    value={form.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
                  <input type="email" name="email" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="you@email.com"
                    value={form.email} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username *</label>
                    <input type="text" name="username" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="unique_username"
                      value={form.username} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                    <input type="tel" name="contactNumber" maxLength="10" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="07X XXX XXXX"
                      value={form.contactNumber} onChange={handleChange} />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-6 mt-4">
                  Continue to Step 2 →
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Business / Brand Name</label>
                  <input type="text" name="businessName" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="e.g. Tasty Bites LK"
                    value={form.businessName} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password *</label>
                  <input type="password" name="password" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="Min. 6 characters"
                    value={form.password} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm Password *</label>
                  <input type="password" name="confirmPassword" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all" placeholder="Repeat password"
                    value={form.confirmPassword} onChange={handleChange} required />
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-4 rounded-xl transition-colors shrink-0" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 text-center sm:hidden">
              <span className="text-sm font-medium text-muted-foreground">
                <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In Instead</Link>
              </span>
            </div>
            
            <p className="mt-6 pt-6 border-t border-border text-center text-sm font-bold text-muted-foreground">
              Are you an administrator? <Link to="/register/admin" className="text-primary hover:underline underline-offset-4">Register as Admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterVendor;
