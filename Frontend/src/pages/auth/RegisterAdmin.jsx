import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await register(form);
      navigate('/admin/stalls');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-300/30 rounded-full blur-3xl translate-y-1/2 translate-x-1/3"></div>

      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl shadow-lg border border-primary/20 group-hover:scale-105 transition-transform">⚡</div>
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
            <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest rounded-full mb-6 flex-inline items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block"></span> ADMIN PORTAL
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-primary leading-tight mb-4 tracking-tight">System Administration</h1>
            <p className="text-lg text-muted-foreground">Manage campus events, stalls, and vendor bookings with full administrative control.</p>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center text-xl shrink-0">🏢</div>
              <div>
                <h4 className="text-primary font-bold text-base">Full Stall Control</h4>
                <p className="text-muted-foreground text-sm font-medium pr-8">Add, edit, and orchestrate all SLIIT campus stall allocations effortlessly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center text-xl shrink-0">✅</div>
              <div>
                <h4 className="text-primary font-bold text-base">Booking Approvals</h4>
                <p className="text-muted-foreground text-sm font-medium pr-8">Review, approve or safely decline pending vendor reservation requests.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-border shadow-sm flex items-center justify-center text-xl shrink-0">📊</div>
              <div>
                <h4 className="text-primary font-bold text-base">Analytics Overview</h4>
                <p className="text-muted-foreground text-sm font-medium pr-8">Systematic monitoring of occupancy statistics on the campus interactive map.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-slate-200/50 p-5 rounded-2xl border border-slate-200 flex gap-4">
            <span className="text-2xl mt-0.5">🔐</span>
            <div>
              <div className="text-sm text-primary font-bold mb-1">Authorization Note</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Admin access strictly reserved for university representatives. Creation logged for verification.</div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex justify-center items-center">
          <div className="bg-white w-full max-w-[500px] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-border">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">🛡️</div>
              <h2 className="text-3xl font-black text-primary mb-2 tracking-tight">Admin Registry</h2>
              <p className="text-muted-foreground font-medium text-sm">Create your master administrator account</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
                <input type="text" name="name" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="e.g. Dr. Kamal Silva"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
                <input type="email" name="email" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="admin@sliit.lk"
                  value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username *</label>
                <input type="text" name="username" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="admin_username"
                  value={form.username} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password *</label>
                  <input type="password" name="password" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Min. 6 chars"
                    value={form.password} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm *</label>
                  <input type="password" name="confirmPassword" className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Repeat"
                    value={form.confirmPassword} onChange={handleChange} required />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:hover:translate-y-0" disabled={loading}>
                {loading ? 'Creating Admin Account...' : '🛡️ Establish Privileges'}
              </button>
            </form>

            <div className="mt-8 text-center sm:hidden">
              <span className="text-sm font-medium text-muted-foreground">
                <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Sign In Instead</Link>
              </span>
            </div>

            <p className="mt-6 pt-6 border-t border-border text-center text-sm font-bold text-muted-foreground">
              Registering as a vendor? <Link to="/register/vendor" className="text-accent hover:underline underline-offset-4">Vendor Portal</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
