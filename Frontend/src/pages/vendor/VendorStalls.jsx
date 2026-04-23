import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const VendorStalls = () => {
  const [stalls, setStalls] = useState([]);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stalls');
        if (res.data.success) {
          // Only show available stalls to vendors
          setStalls(res.data.data.filter(s => s.status === 'Available'));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStalls();
  }, []);

  const TYPE_MAP = {
    Food: 'Food Stall',
    Sponsor: 'Sponsor Booth',
    Game: 'Game Stall',
    Retail: 'Retail Stall',
  };

  const filteredStalls =
    filterType === 'All'
      ? stalls
      : stalls.filter((s) => (s.stallType || '').toLowerCase() === (TYPE_MAP[filterType] || '').toLowerCase());

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-sm uppercase tracking-widest rounded-full mb-3 shadow-sm">
            Event Resources
          </div>
          <h1 className="text-4xl font-semibold text-primary tracking-tight">Events Gallery</h1>
          <p className="text-muted-foreground mt-2 font-medium">Browse and request available stalls across all active global events.</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-4">
        {['All', 'Food', 'Sponsor', 'Game', 'Retail'].map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type)} 
            className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${filterType === type ? 'bg-primary text-white border-transparent' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
          >
            {type === 'All' ? 'All Stalls' : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStalls.map(stall => (
          <div key={stall._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl shadow-slate-200/40 flex flex-col hover:-translate-y-1 transition-transform duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
            <div className="mb-4 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-xl text-primary tracking-tight leading-tight">{stall.stallName}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{stall.eventName}</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-semibold uppercase tracking-wider shrink-0 shadow-sm border border-green-200">Available</span>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 mb-6 border border-slate-50">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Type</span>
                  <span className="font-bold text-slate-700">{stall.stallType}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zone</span>
                  <span className="font-bold text-slate-700">{stall.locationZone}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Size Ratio</span>
                  <span className="font-bold text-slate-700">{stall.size}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cost (LKR)</span>
                  <span className="font-semibold text-accent">{stall.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <Link to={`/stalls/${stall._id}`} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-center flex-1 hover:bg-slate-50 transition-colors text-sm shadow-sm">View Details</Link>
              <Link to={`/vendor/stalls/request/${stall._id}`} className="px-4 py-2.5 bg-accent text-white font-bold rounded-xl text-center flex-1 hover:bg-orange-600 transition-colors text-sm shadow-md shadow-accent/30">Request</Link>
            </div>
          </div>
        ))}

        {filteredStalls.length === 0 && (
          <div className="col-span-full text-center p-16 border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center">
            <div className="text-4xl mb-4 opacity-50">🎪</div>
            <h3 className="text-lg font-bold text-slate-700">No Stalls Available</h3>
            <p className="text-slate-500 font-medium mt-1">There are currently no stalls available matching your criteria in the global directory.</p>
            <button onClick={() => setFilterType('All')} className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStalls;
