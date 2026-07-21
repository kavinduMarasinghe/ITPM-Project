import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const GlobalNotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchAttendanceLogs = useCallback(async () => {
    try {
      const res = await api.get('/attendance/logs');
      const payload = res.data;
      const logs = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
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
      setNotifications(prev => {
        const merged = notifs.map(n => {
          const existing = prev.find(p => p.vendorName === n.vendorName && p.time === n.time && p.stallNumber === n.stallNumber);
          return existing ? { ...n, read: existing.read } : n;
        });
        return merged.sort((a, b) => new Date(b.time) - new Date(a.time));
      });
    } catch (err) {
      console.error('Notification fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceLogs();
    const interval = setInterval(fetchAttendanceLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchAttendanceLogs]);

  const onClear = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-semibold rounded-full flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-13 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">Attendance Notifications</span>
              {notifications.length > 0 && (
                <button onClick={onClear} className="text-sm font-bold text-accent hover:text-orange-600 transition-colors">
                  Clear all
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
                  <p className="text-sm text-slate-400 mt-1">QR scan alerts will appear here</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className={`px-5 py-4 hover:bg-slate-50 transition-colors ${!n.read ? 'border-l-4 border-l-accent' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${!n.read ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {!n.read ? '✅' : '📋'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{n.vendorName}</p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">{n.stallName}</span>
                          {n.stallNumber ? <span className="text-slate-400"> · #{n.stallNumber}</span> : null}
                          <span className="text-slate-400"> · {n.eventName}</span>
                        </p>
                        <p className="text-sm text-slate-400 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <Link to="/admin/attendance/logs" onClick={() => setOpen(false)} className="text-sm font-bold text-primary hover:text-accent transition-colors">
                  View all attendance logs →
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GlobalNotificationBell;
