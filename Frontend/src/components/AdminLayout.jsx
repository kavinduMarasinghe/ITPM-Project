import React from 'react';
import Sidebar from './Sidebar';

const AdminLayout = ({ children }) => (
  <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
    <Sidebar role="admin" />
    <main className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth">
      {children}
    </main>
  </div>
);

export default AdminLayout;
