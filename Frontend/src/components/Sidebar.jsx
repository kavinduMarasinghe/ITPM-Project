import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SVGIcon = ({ d, viewBox = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox={viewBox} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  stalls: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
  add: "M12 4v16m8-8H4",
  map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  requests: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  creditCard: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  attendance: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  scan: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
  home: "M10 19l-7-7m0 0l7-7m-7 7h18",
  menu: "M4 6h16M4 12h16M4 18h16",
  analytics: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
};

const Sidebar = ({ role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentRole = role || user?.role || 'vendor';
  const displayName =
    user?.fullName ||
    user?.name ||
    (currentRole === 'admin' ? 'Admin User' : 'Vendor User');
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const NavItem = ({ to, end, icon, label, badge }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap overflow-hidden ${
          isActive
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
      title={label}
    >
      <SVGIcon d={icon} />
      <span className={`transition-opacity duration-300 flex-1 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100 block'}`}>
        {label}
      </span>
      {badge && !isCollapsed && (
        <span className="ml-auto bg-accent text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );

  const SectionLabel = ({ children }) => (
    isCollapsed
      ? <div className="h-px bg-slate-800 w-full mb-3" />
      : <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest pl-4 mb-3">{children}</div>
  );

  return (
    <div
      className={`relative flex flex-col h-screen bg-[#0f172a] border-r border-slate-800 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-slate-800 text-white rounded-full p-1.5 border border-slate-700 hover:bg-slate-700 z-10 transition-colors shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 shadow-lg shadow-primary/20">
          e
        </div>
        {!isCollapsed && (
          <span className="text-white font-semibold text-xl tracking-tight leading-none">EventAura</span>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">

        {/* ADMIN */}
        {currentRole === 'admin' && (
          <>
            <div>
              <SectionLabel>Main Menu</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/admin/dashboard" end icon={Icons.analytics} label="Dashboard" />
                <NavItem to="/admin/stalls/list" icon={Icons.stalls} label="Manage Stalls" />
                <NavItem to="/admin/stalls/add" icon={Icons.add} label="Add Stall" />
              </nav>
            </div>
            <div>
              <SectionLabel>General</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/admin/stalls/requests" icon={Icons.requests} label="Booking Approvals" />
                <NavItem to="/admin/stalls/layout" icon={Icons.map} label="Layout Map" />
              </nav>
            </div>
            <div>
              <SectionLabel>Attendance</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/admin/attendance/logs" icon={Icons.attendance} label="Attendance Logs" />
                <NavItem to="/admin/attendance/scan" icon={Icons.scan} label="Scan QR (Organizer)" />
              </nav>
            </div>
          </>
        )}

        {/* VENDOR */}
        {currentRole === 'vendor' && (
          <>
            <div>
              <SectionLabel>Main Menu</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/vendor/dashboard" end icon={Icons.dashboard} label="My Dashboard" />
                <NavItem to="/vendor/stalls" icon={Icons.stalls} label="Events Gallery" />
              </nav>
            </div>
            <div>
              <SectionLabel>General</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/vendor/stalls/layout" icon={Icons.map} label="Browse Stalls" />
                <NavItem to="/vendor/my-bookings" icon={Icons.requests} label="My Requests" />
              </nav>
            </div>
            <div>
              <SectionLabel>Advance Payments</SectionLabel>
              <nav className="space-y-1.5">
                <NavItem to="/vendor/booking-payment" icon={Icons.creditCard} label="Pay Advance" />
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700 overflow-hidden cursor-pointer hover:bg-slate-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          onClick={isCollapsed ? handleLogout : () => navigate('/profile')}
          title={isCollapsed ? 'Logout' : 'View Profile'}
        >
          <div className="flex bg-gradient-to-tr from-accent to-orange-400 text-white items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 font-semibold shadow-lg shadow-accent/20">
            {initials}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex flex-col flex-1 truncate">
                <span className="text-sm font-bold text-white truncate">{displayName}</span>
                <span className="text-sm text-slate-400 font-medium">{currentRole === 'admin' ? 'Administrator' : 'Vendor'}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleLogout(); }}
                title="Logout"
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
