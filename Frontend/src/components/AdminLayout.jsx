import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import GlobalNotificationBell from './GlobalNotificationBell'

const AdminLayout = () => (
  <div className='flex h-screen bg-slate-100 overflow-hidden text-slate-800'>
    <Sidebar role='admin' />
    <main className='flex-1 w-full h-full overflow-y-auto relative scroll-smooth flex flex-col'>
      {/* Global Admin Header */}
      <div className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
          EventAura <span className="text-slate-400 font-medium">Control Center</span>
        </h2>
        <div className="flex items-center gap-4">
          <GlobalNotificationBell />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AdminLayout;
