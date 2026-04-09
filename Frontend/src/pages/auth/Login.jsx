import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-accent text-xl shadow-lg border border-primary/20 group-hover:scale-105 transition-transform">⚡</div>
          <span className="text-primary font-black text-2xl tracking-tighter">EventAura</span>
        </Link>
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          New to EventAura? <Link to="/register/vendor" className="text-accent font-bold hover:underline underline-offset-4">Sign Up</Link>
        </span>
      </header>

      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-8 px-6 py-20 z-10">
        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-center gap-8 pl-8 pr-12 border-r border-border/50">
          <div>
            <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-xs uppercase tracking-widest rounded-full mb-6">EVENTAURA PORTAL</div>
            <h1 className="text-4xl xl:text-5xl font-black text-primary leading-tight mb-4 tracking-tight">Welcome Back! <span className="text-accent">👋</span></h1>
            <p className="text-lg text-muted-foreground">Sign in to manage your stall bookings, review requests, and oversee campus events.</p>
          </div>

          <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 border border-primary relative overflow-hidden mt-4 group">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="relative z-10">
              <h3 className="text-primary-foreground font-black text-lg mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                Secure Access
              </h3>
              <p className="text-primary-foreground/70 text-sm">You are logging into the official EventAura platform. Verify that the URL matches eventaura.sliit.lk before proceeding.</p>
            </div>
            <div className="absolute right-0 bottom-0 text-7xl opacity-5 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">🔒</div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex justify-center items-center">
          <div className="bg-white w-full max-w-[450px] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-border">
            <div className="mb-8">
              <div className="w-16 h-16 bg-slate-50 border border-border rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">🔐</div>
              <h2 className="text-3xl font-black text-primary mb-2 tracking-tight">Sign In</h2>
              <p className="text-muted-foreground font-medium text-sm">Enter your credentials to access your portal</p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3">
                <span className="text-lg leading-none mt-0.5">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username or Email</label>
                <input
                  type="text"
                  name="username"
                  className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                  placeholder="Enter username or email"
                  value={form.username}
                  onChange={handleChange}
                  required autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  className="w-full bg-slate-50 border border-border rounded-xl px-4 py-3.5 text-primary font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex justify-end mt-1">
                <a href="#" className="text-sm font-bold text-accent hover:text-accent/80 transition-colors">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : '→ Sign In to EventAura'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border">
              <span className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">New User?</span>
            </div>

            <div className="flex gap-3 mt-6">
              <Link to="/register/vendor" className="flex-1 border-2 border-border hover:border-accent hover:text-accent text-muted-foreground font-bold py-3 text-center rounded-xl transition-all hover:bg-accent/5 text-sm">
                Register Vendor
              </Link>
              <Link to="/register/admin" className="flex-1 border-2 border-border hover:border-primary hover:text-primary text-muted-foreground font-bold py-3 text-center rounded-xl transition-all hover:bg-primary/5 text-sm">
                Register Admin
              </Link>
            </div>

            <div className="mt-8 text-center sm:hidden">
              <span className="text-sm font-medium text-muted-foreground">
                <Link to="/register/vendor" className="text-accent font-bold hover:underline underline-offset-4">Sign Up Instead</Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
