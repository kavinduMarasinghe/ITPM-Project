import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import StallLayoutMap from '../StallLayoutMap';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    booked: 0,
    reserved: 0
  });

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await api.get('/stalls');
        if (res.data.success) {
          const stalls = res.data.data;
          setStats({
            total: stalls.length,
            available: stalls.filter(s => s.status === 'Available').length,
            booked: stalls.filter(s => s.status === 'Booked').length,
            reserved: stalls.filter(s => s.status === 'Reserved').length
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStalls();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest rounded-full mb-3 flex-inline items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block animate-pulse"></span> ADMIN DASHBOARD
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-primary tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-1 text-base font-medium">Real-time statistics and rapid management links for your campus events.</p>
        </div>
        <Link 
          to="/admin/stalls/add" 
          className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
        >
          <span className="mr-2 text-xl leading-none">+</span> Setup New Stall
        </Link>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-primary to-slate-800 text-white rounded-3xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70 mb-4 flex justify-between items-center">
            Total Inventory
            <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">🏢</span>
          </div>
          <div className="text-5xl font-black leading-none">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-success to-emerald-600 text-white rounded-3xl p-8 shadow-xl shadow-success/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex justify-between items-center">
            Currently Available
            <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">✅</span>
          </div>
          <div className="text-5xl font-black leading-none">{stats.available}</div>
        </div>

        <div className="bg-gradient-to-br from-warning to-yellow-600 text-white rounded-3xl p-8 shadow-xl shadow-warning/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4 flex justify-between items-center">
            Pending Approval
            <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">⏳</span>
          </div>
          <div className="text-5xl font-black leading-none">{stats.reserved}</div>
        </div>

        <div className="bg-gradient-to-br from-slate-500 to-slate-700 text-white rounded-3xl p-8 shadow-xl shadow-slate-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="text-xs font-bold uppercase tracking-widest text-slate-200/70 mb-4 flex justify-between items-center">
            Fully Booked
            <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">🔒</span>
          </div>
          <div className="text-5xl font-black leading-none">{stats.booked}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 flex items-center justify-between before:content-[''] before:flex-1 before:h-[2px] before:bg-border after:content-[''] after:flex-1 after:h-[2px] after:bg-border">
        <span className="px-6 text-sm font-black text-slate-400 uppercase tracking-widest">Rapid Command Center</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/admin/stalls" className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-primary/30 transition-all hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-3xl group-hover:bg-primary group-hover:text-white transition-colors">
              📋
            </div>
            <h4 className="text-xl font-black text-primary">Manage Stalls</h4>
          </div>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Navigate to the primary records list to view, edit, or delete existing stalls. Adjust prices and zone allocations efficiently.
          </p>
        </Link>

        <Link to="/admin/stalls/requests" className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-accent/30 transition-all hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/5 text-accent flex items-center justify-center text-3xl group-hover:bg-accent group-hover:text-white transition-colors">
              📥
            </div>
            <h4 className="text-xl font-black text-primary">Review Requests</h4>
          </div>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Review vendor submissions requiring your attention. You can securely approve or deny booking applications from this queue.
          </p>
        </Link>

        <Link to="/admin/stalls/layout" className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-success/30 transition-all hover:-translate-y-1 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-success/5 text-success flex items-center justify-center text-3xl group-hover:bg-success group-hover:text-white transition-colors">
              🗺️
            </div>
            <h4 className="text-xl font-black text-primary">Campus Topology</h4>
          </div>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            Visualize the entire operational venue using the interactive geographical mapping system indicating real-time booth status.
          </p>
        </Link>
      </div>

      {/* Global Stall Map Section */}
      <div className="mt-16 mb-20 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50 bg-slate-50/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 bg-accent rounded-full animate-ping"></span>
            <h3 className="text-sm font-black text-primary uppercase tracking-widest">Interactive Command Map</h3>
          </div>
          <p className="text-muted-foreground font-medium text-sm">Visualize real-time stall topology and operational states across the campus venue.</p>
        </div>
        <StallLayoutMap role="admin" />
      </div>
    </div>
  );
};

export default AdminDashboard;
