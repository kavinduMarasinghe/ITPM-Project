import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const VendorLayout = () => (
  <div className='flex h-screen bg-slate-100 overflow-hidden text-slate-800'>
    <Sidebar role='vendor' />
    <main className='flex-1 w-full h-full overflow-y-auto relative scroll-smooth'>
      <Outlet />
    </main>
  </div>
);

export default VendorLayout;
