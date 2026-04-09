import React from 'react';
import Sidebar from './Sidebar';

const VendorLayout = ({ children }) => (
  <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-800">
    <Sidebar role="vendor" />
    <main className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth">
      {children}
    </main>
  </div>
);

export default VendorLayout;
