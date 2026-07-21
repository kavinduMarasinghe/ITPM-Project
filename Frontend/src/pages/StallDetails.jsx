import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const StallDetails = () => {
  const { id } = useParams();
  const [stall, setStall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/stalls/${id}`);
        if (res.data.success) {
          setStall(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStall();
  }, [id]);

  if (!stall) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-semibold mb-6 transition-colors group"
          >
            <span className="transform transition-transform group-hover:-translate-x-1">←</span> Back to Map
          </button>
          
          <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-semibold text-primary leading-tight tracking-tight">
                  {stall.stallName}
                </h1>
                {stall.status === 'Available' && <span className="bg-success/20 text-success border border-success/30 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Available</span>}
                {stall.status === 'Reserved' && <span className="bg-warning/20 text-warning border border-warning/30 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Pending</span>}
                {stall.status === 'Booked' && <span className="bg-muted text-muted-foreground border border-border px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Booked</span>}
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                ID: <span className="text-accent font-bold">{stall.stallNumber}</span> • {stall.eventName}
              </p>
            </div>
            
            {stall.status === 'Available' && (
              <Link 
                to={`/vendor/stalls/request/${stall._id}`} 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base py-4 px-8 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 text-center whitespace-nowrap"
              >
                Book This Stall
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
            {/* Main Details Card */}
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 transition-transform duration-700 group-hover:scale-110"></div>
              
              <h3 className="text-xl text-primary font-bold mb-8 flex items-center gap-3">
                <span className="block w-1.5 h-6 bg-accent rounded-full"></span>
                Stall Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Type</div>
                  <div className="font-bold text-2xl text-slate-900">{stall.stallType}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Location Zone</div>
                  <div className="font-bold text-2xl text-slate-900">{stall.locationZone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Size Specifications</div>
                  <div className="font-bold text-2xl text-slate-900">{stall.size}</div>
                </div>
                
                <div className="bg-gradient-to-br from-primary to-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2 relative z-10">Booking Price</div>
                  <div className="font-semibold text-3xl md:text-4xl relative z-10">LKR {stall.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                </div>
              </div>
              
              <hr className="border-border my-10" />
              
              <h4 className="text-lg text-slate-800 font-bold mb-4">Description & Amenities</h4>
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-slate-600 leading-relaxed text-base">
                {stall.description || "No specific description or amenities provided for this stall."}
              </div>
            </div>
          </div>
          
          {/* Sidebar Cards */}
          <div className="lg:col-span-1 flex flex-col gap-8 animate-in slide-in-from-right-8 duration-500 delay-150 fill-mode-both">
            
            {/* QR Code Card */}
            <div className="bg-gradient-to-b from-white to-slate-50 p-8 rounded-[2rem] border border-border shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-lg text-primary font-bold mb-6">Stall Share Code</h3>
              
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 mb-6 transition-transform hover:scale-105 duration-300">
                <QRCodeSVG 
                  value={currentUrl} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#0F172A"}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
              
              <p className="text-sm font-medium text-muted-foreground max-w-[200px] mb-8">
                Scan with any device to instantly access these details on the go.
              </p>
              
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(currentUrl);
                  toast.success('Share link securely copied to clipboard!');
                }} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 rounded-xl transition-colors border border-slate-200"
              >
                Copy Link URL
              </button>
            </div>
            
            {/* Status Context Card */}
            <div className={`p-6 rounded-[2rem] border ${stall.status === 'Available' ? 'bg-success/10 border-success/30' : 'bg-slate-100 border-slate-200'}`}>
              <h4 className={`text-lg font-bold mb-3 flex items-center gap-2 ${stall.status === 'Available' ? 'text-green-800' : 'text-slate-800'}`}>
                 State: {stall.status}
              </h4>
              <p className={`text-sm font-medium leading-relaxed ${stall.status === 'Available' ? 'text-green-900' : 'text-slate-600'}`}>
                {stall.status === 'Available' 
                  ? 'This stall represents an open node in the layout. You can submit a vendor booking request for administrative review immediately.' 
                  : 'This stall is currently locked from the selection pool and is not accepting new booking requests.'}
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallDetails;
