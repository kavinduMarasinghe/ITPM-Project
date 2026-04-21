import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* Top green/teal gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 50%, transparent 70%)' }}></div>
      {/* Side subtle orange glow */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)' }}></div>

      <div className="w-full max-w-lg mx-4 z-10 py-10">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
          {/* Header badge */}
          <div className="mb-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Admin Portal</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Admin Registry</h2>

          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">Create Administrator Account</h3>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Set up your master admin account to manage the platform.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold mb-5 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Full Name *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input type="text" name="name" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all" placeholder="e.g. Dr. Kamal Silva"
                  value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email Address *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <input type="email" name="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all" placeholder="admin@sliit.lk"
                  value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Username *</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <input type="text" name="username" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all" placeholder="admin_username"
                  value={form.username} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Password *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-11 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all" placeholder="Min. 6 chars"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Confirm *</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-11 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all" placeholder="Repeat"
                    value={form.confirmPassword} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirm ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full font-bold py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 mt-3 disabled:opacity-70 disabled:hover:translate-y-0 text-white text-base" style={{ background: '#f97316', boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Admin Account...
                </span>
              ) : '🛡️ Establish Privileges'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Already registered?</span>
            <Link to="/login" className="font-bold hover:underline underline-offset-4 transition-colors" style={{ color: '#f97316' }}>
              Sign In
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-center text-sm">
            <span className="text-slate-400 font-medium">Registering as a vendor?</span>
            <Link to="/register-vendor" className="font-bold hover:underline underline-offset-4 transition-colors ml-1.5" style={{ color: '#f97316' }}>
              Vendor Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
