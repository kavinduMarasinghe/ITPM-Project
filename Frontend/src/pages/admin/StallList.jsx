import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StallList = () => {
  const [stalls, setStalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStalls = async () => {
    try {
      const res = await api.get('/stalls');
      if (res.data.success) {
        setStalls(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStalls();
  }, []);

  const formatPrice = (val) => {
    if (!val) return '0';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stall? This action cannot be undone.")) return;
    try {
      await api.delete(`/stalls/${id}`);
      toast.success('Stall deleted successfully!');
      fetchStalls();
    } catch (err) {
      console.error(err);
      toast.error('Error deleting stall');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">🟢 Available</span>;
      case 'Booked': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">🔒 Booked</span>;
      case 'Reserved': 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/20">⏳ Pending</span>;
      default: 
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const filteredStalls = stalls.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return s.stallName.toLowerCase().startsWith(term) || 
           s.eventName.toLowerCase().startsWith(term) ||
           s.stallNumber.toLowerCase().startsWith(term);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="flex -space-x-2">
                  <span className="h-5 w-5 rounded-full bg-accent border-2 border-white shadow-sm animate-pulse"></span>
                  <span className="h-5 w-5 rounded-full bg-accent/30 border-2 border-white shadow-sm"></span>
               </div>
               <p className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-accent">Operations Control</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary leading-none">
              Stall <span className="text-accent">Registry.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-medium max-w-xl">
              Real-time directory of all commercial nodes. Synchronized with the global geospatial map system.
            </p>
          </div>
          
          <Link 
            to="/admin/stalls/add" 
            className="group flex items-center gap-4 px-10 py-5 bg-primary rounded-3xl text-primary-foreground font-black text-xs uppercase tracking-widest transition-all hover:bg-accent hover:shadow-[0_20px_40px_rgba(249,115,22,0.3)] hover:-translate-y-1 active:scale-95"
          >
            <span className="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
            Register New Node
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            <div className="lg:col-span-8 relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground text-xl pointer-events-none group-focus-within:text-accent transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Synchronous search by Identity, Map ID or Event Label..." 
                className="w-full bg-white border border-border rounded-[30px] pl-16 pr-8 py-6 text-primary font-bold outline-none ring-offset-4 focus:ring-2 focus:ring-accent/20 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[30px] px-8 py-4 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div>
                 <p className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-1">Live Feed</p>
                 <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">Directory Connected</span>
                 </div>
              </div>
              <button 
                onClick={fetchStalls}
                className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all active:rotate-180"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
              </button>
           </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden ring-1 ring-slate-100/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-10 py-6">Operational Node</th>
                  <th className="px-10 py-6">Deployment Meta</th>
                  <th className="px-10 py-6">Valuation</th>
                  <th className="px-10 py-6">Global Status</th>
                  <th className="px-10 py-6 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStalls.map(stall => (
                  <tr key={stall._id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg group-hover:bg-accent transition-colors">
                          {stall.stallNumber}
                        </div>
                        <div>
                          <p className="text-lg font-black text-primary tracking-tight leading-tight">{stall.stallName}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[0.65rem] font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-md">{stall.stallType}</span>
                             <span className="text-slate-300">&bull;</span>
                             <span className="text-[0.65rem] font-black uppercase text-muted-foreground">{stall.locationZone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-bold text-slate-600 text-sm tracking-tight">{stall.eventName}</p>
                       <p className="text-[0.65rem] font-black uppercase text-slate-300 mt-1">Tier: {stall.locationCategory}</p>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fixed Rate</p>
                       <p className="text-lg font-black text-slate-900 tracking-tighter">
                          <span className="text-xs text-slate-300 mr-1.5 font-medium uppercase tracking-normal">lkr</span> 
                          {formatPrice(stall.price)}
                       </p>
                    </td>
                    <td className="px-10 py-8">
                       {getStatusBadge(stall.status)}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <Link 
                          to={`/admin/stalls/edit/${stall._id}`} 
                          className="w-11 h-11 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-amber-500 hover:border-amber-100 hover:bg-amber-50 flex items-center justify-center transition-all shadow-sm active:scale-90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDelete(stall._id)} 
                          className="w-11 h-11 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 flex items-center justify-center transition-all shadow-sm active:scale-90"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredStalls.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-10 py-32 text-center text-slate-300">
                       <div className="flex flex-col items-center">
                          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                          </div>
                          <p className="text-xl font-black text-slate-900 tracking-tight">Zero Nodes Intercepted</p>
                          <p className="text-sm font-medium text-slate-400 mt-2">Adjust search parameters or initialize a new node.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center text-[0.65rem] font-black uppercase tracking-widest text-slate-400">
            <span>Manifest Coverage: 100%</span>
            <span>Intercepted Count: {filteredStalls.length} Nodes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallList;
