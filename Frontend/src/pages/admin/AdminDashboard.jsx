import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import StallLayoutMap from '../StallLayoutMap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#1e293b', '#f97316', '#22c55e', '#eab308', '#06b6d4', '#8b5cf6'];

// ── Main Dashboard ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, reserved: 0 });
  const [stalls, setStalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [stallRes, bookingRes, attendRes] = await Promise.allSettled([
        api.get('/stalls'),
        api.get('/stall-bookings'),
        api.get('/attendance/logs'),
      ]);

      if (stallRes.status === 'fulfilled' && stallRes.value.data.success) {
        const s = stallRes.value.data.data;
        setStalls(s);
        setStats({
          total: s.length,
          available: s.filter(x => x.status === 'Available').length,
          booked: s.filter(x => x.status === 'Booked').length,
          reserved: s.filter(x => x.status === 'Reserved').length,
        });
      }

      if (bookingRes.status === 'fulfilled' && bookingRes.value.data.success) {
        setBookings(bookingRes.value.data.data || []);
      }

      if (attendRes.status === 'fulfilled') {
        const raw = attendRes.value.data;
        const logs = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
        setAttendanceLogs(logs);
        // Build notifications from recent scan logs
        const notifs = [];
        logs.forEach(log => {
          if (log.scanLogs && log.scanLogs.length > 0) {
            const latest = log.scanLogs[log.scanLogs.length - 1];
            notifs.push({
              vendorName: log.vendorName,
              stallName: log.stallName,
              stallNumber: log.stallNumber,
              eventName: log.eventName,
              time: new Date(latest.scannedAt).toLocaleString(),
              read: false,
            });
          }
        });
        // Merge with existing (don't overwrite read state)
        setNotifications(prev => {
          const merged = notifs.map(n => {
            const existing = prev.find(p => p.vendorName === n.vendorName && p.time === n.time && p.stallNumber === n.stallNumber);
            return existing ? { ...n, read: existing.read } : n;
          });
          return merged.sort((a, b) => new Date(b.time) - new Date(a.time));
        });
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Poll every 5 seconds for instant QR scan notifications
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── Chart Data ──────────────────────────────────────────────────────────────
  const stallStatusData = [
    { name: 'Available', value: stats.available },
    { name: 'Booked', value: stats.booked },
    { name: 'Reserved', value: stats.reserved },
  ].filter(d => d.value > 0);

  // Stall type breakdown
  const typeMap = {};
  stalls.forEach(s => { typeMap[s.stallType] = (typeMap[s.stallType] || 0) + 1; });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Booking status breakdown
  const bookingStatusMap = {};
  bookings.forEach(b => { bookingStatusMap[b.status] = (bookingStatusMap[b.status] || 0) + 1; });
  const bookingStatusData = Object.entries(bookingStatusMap).map(([name, value]) => ({ name, value }));

  // Bookings over time (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const dateStr = d.toDateString();
    const count = bookings.filter(b => new Date(b.createdAt).toDateString() === dateStr).length;
    return { label, count };
  });

  // Zone utilisation
  const zoneMap = {};
  stalls.forEach(s => {
    if (!zoneMap[s.locationZone]) zoneMap[s.locationZone] = { zone: s.locationZone, total: 0, booked: 0 };
    zoneMap[s.locationZone].total++;
    if (s.status === 'Booked') zoneMap[s.locationZone].booked++;
  });
  const zoneData = Object.values(zoneMap);

  // Attendance analytics (last 7 days + summary)
  const attendance7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toDateString();
    const count = attendanceLogs.filter(
      (log) => log.attendanceConfirmedAt && new Date(log.attendanceConfirmedAt).toDateString() === dateStr
    ).length;
    return { label, count };
  });

  const attendanceConfirmedCount = attendanceLogs.filter((l) => l.attendanceConfirmed).length;
  const attendancePendingCount = Math.max(attendanceLogs.length - attendanceConfirmedCount, 0);
  const attendanceSummaryData = [
    { name: 'Confirmed', value: attendanceConfirmedCount },
    { name: 'Pending', value: attendancePendingCount },
  ].filter((d) => d.value > 0);

  // Revenue estimate (price of booked stalls)
  const totalRevenue = stalls.filter(s => s.status === 'Booked').reduce((sum, s) => sum + (s.price || 0), 0);
  const pendingRevenue = stalls.filter(s => s.status === 'Reserved').reduce((sum, s) => sum + (s.price || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-sm uppercase tracking-widest rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block animate-pulse" />
            Admin Dashboard
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-primary tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Real-time analytics, stall performance, and attendance tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/stalls/add"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 text-sm"
          >
            <span className="mr-1.5 text-lg leading-none">+</span> New Stall
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Stalls', value: stats.total, icon: '🏢', color: 'from-primary to-slate-700', shadow: 'shadow-primary/20' },
          { label: 'Available', value: stats.available, icon: '✅', color: 'from-success to-emerald-600', shadow: 'shadow-success/20' },
          { label: 'Reserved', value: stats.reserved, icon: '⏳', color: 'from-warning to-yellow-500', shadow: 'shadow-warning/20' },
          { label: 'Booked', value: stats.booked, icon: '🔒', color: 'from-slate-500 to-slate-700', shadow: 'shadow-slate-400/20' },
        ].map((card, i) => (
          <div key={i} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-6 shadow-xl ${card.shadow} relative overflow-hidden group`}>
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl" />
            <div className="flex justify-between items-start mb-3">
              <p className="text-sm font-bold uppercase tracking-widest text-white/70">{card.label}</p>
              <span className="text-xl group-hover:scale-110 transition-transform">{card.icon}</span>
            </div>
            <div className="text-4xl font-semibold">{card.value}</div>
            <div className="mt-2 text-sm text-white/50 font-medium">
              {Math.round((card.value / (stats.total || 1)) * 100)}% of total
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Confirmed Revenue</p>
          <p className="text-3xl font-semibold text-success">LKR {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-slate-400 mt-1 font-medium">From {stats.booked} locked stalls</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Pending Revenue</p>
          <p className="text-3xl font-semibold text-warning">LKR {pendingRevenue.toLocaleString()}</p>
          <p className="text-sm text-slate-400 mt-1 font-medium">From {stats.reserved} reserved stalls</p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2">Attendance Check-ins</p>
          <p className="text-3xl font-semibold text-info">{attendanceLogs.filter(l => l.attendanceConfirmed).length}</p>
          <p className="text-sm text-slate-400 mt-1 font-medium">Vendors confirmed present</p>
        </div>
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Bookings Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Booking Activity</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">New booking requests over the last 7 days</p>
            </div>
            <span className="text-xl">📈</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e293b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Bookings" stroke="#1e293b" strokeWidth={2.5} fill="url(#bookGrad)" dot={{ fill: '#1e293b', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stall Status Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Stall Status</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Current distribution</p>
            </div>
            <span className="text-xl">🥧</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stallStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {stallStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Stall Type Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Stalls by Type</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Count per stall category</p>
            </div>
            <span className="text-xl">📊</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Stalls" radius={[6, 6, 0, 0]}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Utilisation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Zone Utilisation</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Booked vs total per zone</p>
            </div>
            <span className="text-xl">🗺️</span>
          </div>
          {zoneData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={zoneData} margin={{ top: 5, right: 5, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="booked" name="Booked" fill="#1e293b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">
              No zone data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Status Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Booking Pipeline</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Requests at each approval stage</p>
            </div>
            <Link to="/admin/stalls/requests" className="text-sm font-bold text-accent hover:text-orange-600 transition-colors">
              Manage requests →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 overflow-y-auto">
            {bookingStatusData.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">No booking data yet.</p>
            ) : (
              bookingStatusData.map((item, i) => {
                const colors = {
                  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  PreApproved: 'bg-blue-50 text-blue-700 border-blue-200',
                  Confirmed: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                  Approved: 'bg-green-50 text-green-700 border-green-200',
                  Rejected: 'bg-red-50 text-red-700 border-red-200',
                };
                return (
                  <div key={i} className={`flex items-center gap-3 px-5 py-3 rounded-xl border font-bold text-sm ${colors[item.name] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                    <span className="text-2xl font-semibold">{item.value}</span>
                    <span className="text-sm uppercase tracking-wider">{item.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Recent Attendance Logs ── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full max-h-[400px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <div>
              <h3 className="font-semibold text-primary text-base">Recent Check-ins</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Vendors scanned via QR</p>
            </div>
            <Link to="/admin/attendance/logs" className="text-sm font-bold text-accent hover:text-orange-600 transition-colors">
              View logs →
            </Link>
          </div>
          
          {attendanceLogs.filter(l => l.attendanceConfirmed).length === 0 ? (
            <p className="text-sm text-slate-400 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 text-center mt-2">No vendors have checked in yet.</p>
          ) : (
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {attendanceLogs.filter(l => l.attendanceConfirmed).slice(0, 5).map((log, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl">✅</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{log.vendorName}</p>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mt-1">{log.stallNumber} - {log.stallName}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Scanned at</p>
                      <p className="text-sm font-bold text-slate-700">{new Date(log.attendanceConfirmedAt).toLocaleString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Attendance Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Attendance Trend</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Confirmed vendors over the last 7 days</p>
            </div>
            <span className="text-xl">📈</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={attendance7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Confirmed" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-primary text-base">Attendance Summary</h3>
              <p className="text-sm text-slate-400 font-medium mt-0.5">Confirmed vs pending records</p>
            </div>
            <span className="text-xl">✅</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-green-700">Confirmed</p>
              <p className="text-3xl font-semibold text-green-700 mt-1">{attendanceConfirmedCount}</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-amber-700">Pending</p>
              <p className="text-3xl font-semibold text-amber-700 mt-1">{attendancePendingCount}</p>
            </div>
          </div>

          {attendanceSummaryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={attendanceSummaryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={58}>
                  {attendanceSummaryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.name === 'Confirmed' ? '#22c55e' : '#eab308'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-slate-400 text-sm font-medium">
              No attendance data yet
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mb-6 flex items-center justify-between before:content-[''] before:flex-1 before:h-px before:bg-slate-200 after:content-[''] after:flex-1 after:h-px after:bg-slate-200">
        <span className="px-5 text-sm font-semibold text-slate-400 uppercase tracking-widest">Quick Actions</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-12">
        {[
          { to: '/admin/stalls/list', icon: '📋', label: 'Manage Stalls', color: 'hover:border-primary/30', iconBg: 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white' },
          { to: '/admin/stalls/requests', icon: '📥', label: 'Booking Approvals', color: 'hover:border-accent/30', iconBg: 'bg-accent/5 text-accent group-hover:bg-accent group-hover:text-white' },
          { to: '/admin/stalls/layout', icon: '🗺️', label: 'Layout Map', color: 'hover:border-success/30', iconBg: 'bg-success/5 text-success group-hover:bg-success group-hover:text-white' },
          { to: '/admin/attendance', icon: '✅', label: 'Attendance Logs', color: 'hover:border-info/30', iconBg: 'bg-info/5 text-info group-hover:bg-info group-hover:text-white' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${a.color} transition-all hover:-translate-y-1 group`}>
            <div className={`w-12 h-12 rounded-xl ${a.iconBg} flex items-center justify-center text-2xl mb-3 transition-colors`}>
              {a.icon}
            </div>
            <h4 className="text-sm font-semibold text-primary">{a.label}</h4>
          </Link>
        ))}
      </div>

      {/* ── Map ── */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
          <div>
            <h3 className="text-sm font-semibold text-primary uppercase tracking-widest">Live Stall Map</h3>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Real-time venue topology</p>
          </div>
        </div>
        <StallLayoutMap role="admin" />
      </div>
    </div>
  );
};

export default AdminDashboard;
