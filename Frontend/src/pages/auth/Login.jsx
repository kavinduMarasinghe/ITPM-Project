import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      if (user.role === 'admin') {
        navigate('/admin/stalls');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
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

      <div className="w-full max-w-lg mx-4 z-10">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
          {/* Header badge */}
          <div className="mb-2">
            <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-500">Access Portal</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold mb-5 flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {/* Vendor Login label */}
          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800">Vendor Login</h3>
            <p className="text-slate-400 text-sm font-medium mt-0.5">Use your vendor username or email to manage stall bookings and vendor requests.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Username or Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <input
                  type="text"
                  name="username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                  placeholder="Enter username or email"
                  value={form.username}
                  onChange={handleChange}
                  required autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 text-slate-800 font-medium placeholder-slate-400 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full font-bold py-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2 disabled:opacity-70 disabled:hover:translate-y-0 text-white text-base"
              style={{ background: '#f97316', boxShadow: '0 8px 24px rgba(249,115,22,0.25)' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </span>
              ) : 'Continue to Vendor Portal →'}
            </button>
          </form>

          {/* Bottom links */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <Link to="/register-vendor" className="font-bold hover:underline underline-offset-4 transition-colors" style={{ color: '#f97316' }}>
              Vendor registration
            </Link>
            <span className="text-slate-300">·</span>
            <Link to="/register-admin" className="font-bold hover:underline underline-offset-4 transition-colors" style={{ color: '#f97316' }}>
              Admin registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
