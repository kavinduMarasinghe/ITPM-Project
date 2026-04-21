import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stallStats, setStallStats] = useState({ available: 12, pending: 5, booked: 43 });
  const [selectedMapStall, setSelectedMapStall] = useState(null);
  const [activeEvent, setActiveEvent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api.get('/stalls').then(res => {
      if (res.data.success) {
        const stalls = res.data.data;
        setStallStats({
          available: stalls.filter(s => s.status === 'Available').length,
          pending: stalls.filter(s => s.status === 'Reserved').length,
          booked: stalls.filter(s => s.status === 'Booked').length,
        });
      }
    }).catch(() => {});
  }, []);

  const events = [
    {
      id: 'evt-001',
      name: 'Annual Tech Innovation Expo 2026',
      date: 'Oct 15, 2026',
      location: 'Main Auditorium, New Building',
      status: 'open',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=900',
      description: 'Sri Lanka\'s premier student-led technology exhibition showcasing innovations in AI, robotics, IoT, and software.',
      stalls: 62
    },
    {
      id: 'evt-002',
      name: 'Campus Career Fair 2026',
      date: 'Nov 2, 2026',
      location: 'Sports Complex',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=900',
      description: 'Connect top companies with talented graduates. Featuring 100+ companies and campus recruitment sessions.',
      stalls: 77
    },
    {
      id: 'evt-003',
      name: 'International Food Festival',
      date: 'Sep 20, 2026',
      location: 'Campus Grounds',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=900',
      description: 'A celebration of global cuisines on campus. Vendors from across Sri Lanka present authentic food experiences.',
      stalls: 60
    }
  ];

  const steps = [
    { step: '01', icon: '👤', title: 'Register as Vendor', desc: 'Create your free EventAura vendor account with your business details.' },
    { step: '02', icon: '🗓️', title: 'Browse Events', desc: 'Explore upcoming campus events and find the perfect opportunity.' },
    { step: '03', icon: '🗺️', title: 'Choose a Stall', desc: 'Use our interactive campus map to select your preferred stall location.' },
    { step: '04', icon: '✅', title: 'Get Approved', desc: 'Submit your request. The administration team will securely lock stalls after payment verification.' },
  ];

  const mapStalls = [
    { id: 'A1', x: 95, y: 80, status: 'Available', zone: 'Zone A' },
    { id: 'A2', x: 145, y: 80, status: 'Booked', zone: 'Zone A' },
    { id: 'A3', x: 195, y: 80, status: 'Available', zone: 'Zone A' },
    { id: 'A4', x: 95, y: 120, status: 'Pending', zone: 'Zone A' },
    { id: 'A5', x: 145, y: 120, status: 'Available', zone: 'Zone A' },
    { id: 'A6', x: 195, y: 120, status: 'Booked', zone: 'Zone A' },
    { id: 'B1', x: 330, y: 80, status: 'Booked', zone: 'Zone B' },
    { id: 'B2', x: 380, y: 80, status: 'Pending', zone: 'Zone B' },
    { id: 'B3', x: 430, y: 80, status: 'Available', zone: 'Zone B' },
    { id: 'B4', x: 330, y: 120, status: 'Available', zone: 'Zone B' },
    { id: 'B5', x: 380, y: 120, status: 'Booked', zone: 'Zone B' },
    { id: 'B6', x: 430, y: 120, status: 'Available', zone: 'Zone B' },
    { id: 'V1', x: 195, y: 235, status: 'Booked', zone: 'VIP' },
    { id: 'V2', x: 260, y: 235, status: 'Available', zone: 'VIP' },
    { id: 'V3', x: 325, y: 235, status: 'Pending', zone: 'VIP' },
  ];

  const getMapStallColor = (status) => {
    switch(status) {
      case 'Available': return 'hsl(var(--success))';
      case 'Pending': return 'hsl(var(--warning))';
      case 'Booked': return 'hsl(var(--muted-foreground))';
      default: return '#fff';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-border transition-all">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white font-bold text-xl group-hover:bg-accent transition-colors duration-300">
              ⚡
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-primary text-xl leading-none">EventAura</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">Campus Hub</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#events" className="text-sm font-semibold text-primary hover:text-accent transition-colors">Campus Events</a>
            <a href="#how-to-book" className="text-sm font-semibold text-primary hover:text-accent transition-colors">How to Book</a>
            <a href="#about" className="text-sm font-semibold text-primary hover:text-accent transition-colors">About</a>
            <a href="#map" className="text-sm font-semibold text-primary hover:text-accent transition-colors">Interactive Map</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin/stalls' : '/vendor/dashboard'} className="px-5 py-2.5 rounded-full border border-border bg-white text-sm font-bold text-primary hover:bg-muted transition duration-300">Dashboard</Link>
                <button onClick={logout} className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition shadow-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-5 py-2.5 rounded-full border border-border bg-white text-sm font-bold text-primary hover:bg-muted transition duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">Login</Link>
                <div className="relative">
                  <button onClick={() => setShowDropdown(!showDropdown)} className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground text-sm font-bold hover:bg-accent/90 focus:ring-4 focus:ring-accent/20 transition-all shadow-md">
                    Register Now ▾
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-3 w-48 bg-white border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <Link to="/register-vendor" className="flex items-center px-4 py-3 text-sm font-semibold text-primary hover:bg-muted border-b border-border" onClick={() => setShowDropdown(false)}>🎪 Vendor Account</Link>
                      <Link to="/register-admin" className="flex items-center px-4 py-3 text-sm font-semibold text-primary hover:bg-muted" onClick={() => setShowDropdown(false)}>🛡️ Administrator</Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button className="lg:hidden text-primary p-2 focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path></svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-b border-border shadow-lg absolute w-full left-0 animate-in slide-in-from-top-1">
            <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col gap-4">
              <a href="#events" className="text-primary font-bold block" onClick={() => setMenuOpen(false)}>Events</a>
              <a href="#how-to-book" className="text-primary font-bold block" onClick={() => setMenuOpen(false)}>How to Book</a>
              <Link to="/register-vendor" className="text-accent font-bold block" onClick={() => setMenuOpen(false)}>Register as Vendor</Link>
              <Link to="/login" className="text-primary font-bold block" onClick={() => setMenuOpen(false)}>Login</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== CREATIVE HERO ===== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-primary text-white">
        {/* Background Decorative Blur */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accent blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[70%] rounded-full bg-blue-500 blur-[120px]"></div>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12">
          
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
              <span className="text-accent">⚡</span> Verified Platform
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-6 mt-2">
              Next-Gen Campus <br className="hidden lg:block"/>
              <span className="text-accent relative inline-block">
                Events & Stalls
                <svg className="absolute w-full h-[12px] -bottom-1 left-0 text-accent opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-primary-foreground/80 mb-10 max-w-2xl font-medium leading-relaxed">
              Official digital framework managing high-traffic campus exhibitions. Streamline your presence on campus seamlessly — from tech expos to food festivals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/register-vendor" className="px-8 py-4 rounded-xl bg-accent text-accent-foreground text-center font-bold shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all transform">
                Enroll as a Vendor
              </Link>
              <a href="#events" className="px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-center font-bold backdrop-blur-sm hover:bg-white/20 transition-all">
                Explore The Events
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-6 saturate-0 opacity-60">
              <div className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">Trusted by 200+ Vendors</div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative w-full mt-10 lg:mt-0">
             <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ transform: 'rotate(2deg) scale(0.98)' }}>
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200" alt="Students gathering at event" className="w-full h-auto object-cover opacity-90 transition duration-700 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
             </div>
             
             {/* Floating Stats Widget over Hero Image */}
             <div className="absolute -bottom-8 -left-4 lg:-left-12 bg-card p-6 rounded-2xl shadow-2xl border border-border flex gap-6 z-20 animate-in slide-in-from-bottom" style={{ transform: 'rotate(-2deg)' }}>
                <div>
                  <div className="text-3xl font-black text-primary mb-1">100<span className="text-accent">+</span></div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Annual Fairs</div>
                </div>
                <div className="w-[1px] h-12 bg-border"></div>
                <div>
                  <div className="text-3xl font-black text-primary mb-1">{stallStats.available}<span className="text-success">+</span></div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Stalls Left</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT WRAPPER ===== */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full pt-20 pb-20">
        
        {/* EVENTS SECTION */}
        <section id="events" className="mb-32 scroll-mt-24">
          <div className="text-center md:text-left mb-12">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Premium Real Estate</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Active Campus Events</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Featured Event - Left Side */}
            <div className="lg:col-span-7 bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden group">
              <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                <div className={`absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest uppercase backdrop-blur-md ${events[activeEvent].status === 'open' ? 'bg-success/90 text-success-foreground' : 'bg-warning/90 text-warning-foreground'}`}>
                  {events[activeEvent].status === 'open' ? '🟢 Booking Open' : '🟡 Opening Soon'}
                </div>
                <img src={events[activeEvent].image} alt={events[activeEvent].name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
              </div>
              
              <div className="p-8 md:p-10 -mt-20 relative z-20">
                <div className="bg-card w-full rounded-2xl p-6 md:p-8 shadow-xl border border-border">
                  <h3 className="text-2xl md:text-3xl font-black text-primary mb-4 leading-tight">{events[activeEvent].name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-primary">📅 {events[activeEvent].date}</span>
                    <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-primary">📍 {events[activeEvent].location}</span>
                    <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-primary">🛍️ {events[activeEvent].stalls} Slots</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                    {events[activeEvent].description}
                  </p>
                  <Link to="/register-vendor" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3.5 rounded-xl hover:bg-primary/90 transition-all w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                    Reserve a Slot
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Upcoming List - Right Side */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h3 className="font-bold text-muted-foreground mb-2 px-2 uppercase tracking-wider text-sm">More Upcoming Frameworks</h3>
              {events.map((evt, idx) => (
                <button 
                  key={evt.id} 
                  onClick={() => setActiveEvent(idx)}
                  className={`flex items-stretch text-left group rounded-2xl overflow-hidden transition-all duration-300 border ${
                    activeEvent === idx 
                      ? 'bg-card border-accent shadow-[0_8px_30px_rgba(249,115,22,0.12)] -translate-y-1' 
                      : 'bg-white border-border hover:bg-muted/30 hover:border-border/80'
                  }`}
                >
                  <div className="w-[120px] md:w-[150px] relative overflow-hidden shrink-0">
                    <img src={evt.image} alt={evt.name} className={`w-full h-full object-cover transition-transform duration-500 ${activeEvent === idx ? 'scale-110' : 'group-hover:scale-105'}`}/>
                    {activeEvent === idx && <div className="absolute inset-0 bg-accent/20"></div>}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-center">
                    <div className="text-xs font-bold text-accent mb-1.5 uppercase tracking-wider">{evt.date}</div>
                    <div className={`font-bold transition-colors ${activeEvent === idx ? 'text-primary' : 'text-primary group-hover:text-accent'} mb-2 leading-tight md:text-lg`}>
                      {evt.name}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground truncate">{evt.location}</div>
                  </div>
                </button>
              ))}
            </div>
            
          </div>
        </section>

        {/* MAP OVERVIEW */}
        <section id="map" className="mb-32 scroll-mt-24">
          <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Live Topology</span>
                <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Interactive Campus Plan</h2>
              </div>
              <div className="flex bg-muted p-2 rounded-2xl gap-2 font-bold text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm"><span className="w-3 h-3 rounded-full bg-success"></span> Available ({stallStats.available})</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm"><span className="w-3 h-3 rounded-full bg-warning"></span> Pending ({stallStats.pending})</div>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start">
              <div className="xl:w-2/3 w-full bg-[#f8fafc] border border-border rounded-3xl p-6 overflow-hidden relative shadow-inner">
                <svg viewBox="0 0 530 320" className="w-full h-auto drop-shadow-sm">
                   {/* Grass bg */}
                   <rect width="530" height="320" fill="#f1f5f9" rx="20"/>
                   {/* Roads */}
                   <rect x="250" y="0" width="30" height="320" fill="#e2e8f0"/>
                   <rect x="0" y="160" width="530" height="30" fill="#e2e8f0"/>
                   
                   {/* Zones with modern subtle fills */}
                   <rect x="30" y="30" width="200" height="110" rx="12" fill="white" stroke="#cbd5e1" strokeWidth="2"/>
                   <text x="130" y="60" textAnchor="middle" fontSize="12" fontWeight="800" fill="#94a3b8" letterSpacing="0.1em">WEST WING</text>
                   
                   <rect x="300" y="30" width="200" height="110" rx="12" fill="white" stroke="#cbd5e1" strokeWidth="2"/>
                   <text x="400" y="60" textAnchor="middle" fontSize="12" fontWeight="800" fill="#94a3b8" letterSpacing="0.1em">EAST WING</text>
                   
                   <rect x="130" y="210" width="270" height="90" rx="12" fill="none" stroke="#f97316" strokeDasharray="6 6" strokeWidth="2"/>
                   <rect x="130" y="210" width="270" height="90" rx="12" fill="#fff7ed" opacity="0.6"/>
                   <text x="265" y="240" textAnchor="middle" fontSize="12" fontWeight="800" fill="#c2410c" letterSpacing="0.1em">MAIN PLAZA STAGE</text>
                   
                   {mapStalls.map(stall => (
                     <g key={stall.id} onClick={() => setSelectedMapStall(stall)} className="cursor-pointer transition-transform hover:scale-110 transform-origin-center">
                       <rect
                         x={stall.x - 22} y={stall.y - 13}
                         width="44" height="26" rx="6"
                         fill={selectedMapStall?.id === stall.id ? '#0F172A' : getMapStallColor(stall.status)}
                         opacity={selectedMapStall?.id === stall.id ? 1 : 0.9}
                         stroke={selectedMapStall?.id === stall.id ? '#0F172A' : (stall.status === 'Available' ? '#166534' : 'transparent')}
                         strokeWidth={selectedMapStall?.id === stall.id ? '2' : '1'}
                         className="transition-all duration-300 shadow-sm"
                       />
                       <text x={stall.x} y={stall.y + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">
                         {stall.id}
                       </text>
                     </g>
                   ))}
                </svg>
              </div>

              <div className="xl:w-1/3 w-full border border-border p-8 rounded-3xl bg-white shadow-xl xl:-ml-16 z-10 xl:mt-12 transition-all min-h-[300px]">
                <h3 className="text-secondary-foreground font-black text-xl mb-6">Target Diagnostics</h3>
                {selectedMapStall ? (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-5xl font-black text-primary tracking-tighter leading-none">{selectedMapStall.id}</div>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${selectedMapStall.status === 'Available' ? 'bg-success/20 text-success border border-success/30' : (selectedMapStall.status === 'Pending' ? 'bg-warning/20 text-warning border border-warning/30' : 'bg-muted text-muted-foreground')}`}>
                        {selectedMapStall.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 mb-8">
                       <div>
                         <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Located in Grid</div>
                         <div className="font-semibold text-primary">{selectedMapStall.zone} Section</div>
                       </div>
                    </div>
                    {selectedMapStall.status === 'Available' ? (
                      <Link to="/register-vendor" className="block w-full bg-accent text-accent-foreground text-center font-bold py-3.5 rounded-xl hover:bg-accent/90 transition shadow-md shadow-accent/20">
                        Proceed to Booking Setup
                      </Link>
                    ) : (
                       <button disabled className="block w-full bg-muted text-muted-foreground text-center font-bold py-3.5 rounded-xl cursor-not-allowed">
                        Slot Unavailable
                       </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center opacity-60">
                     <span className="text-5xl mb-4">📍</span>
                     <p className="text-muted-foreground font-semibold">Select a node from the interactive layout to analyze metadata.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HOW TO BOOK */}
        <section id="how-to-book" className="mb-20 scroll-mt-24">
          <div className="max-w-[800px] mx-auto text-center mb-16">
            <span className="text-accent font-bold tracking-widest uppercase text-sm mb-2 block">Standard Operating Procedure</span>
            <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-6">Admission Protocol</h2>
            <div className="bg-warning/10 border border-warning/30 text-warning-foreground p-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-sm max-w-lg mx-auto shadow-sm">
              <span className="text-xl">⚠️</span> Fair Access Policy: Single vendor entity strictly caped to 3 stalls.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-card p-8 rounded-3xl border border-border hover:border-accent hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.15)] transition-all group relative overflow-hidden">
                <div className="text-7xl font-black text-muted/40 absolute -right-4 -bottom-6 select-none group-hover:text-accent/10 transition-colors">{step.step}</div>
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:bg-accent transition-colors shadow-sm">{step.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium mb-4 relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ===== CREATIVE FOOTER ===== */}
      <footer className="bg-primary text-primary-foreground pt-20 pb-10 border-t border-primary/20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 no-underline mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-white font-bold text-xl">⚡</div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-xl leading-none">EventAura</span>
                  <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-widest mt-1">Campus Hub</span>
                </div>
              </Link>
              <p className="text-primary-foreground/70 text-sm leading-relaxed font-medium pr-4">
                Structured digital portal standardizing real estate allocation across prestigious academic exhibitions.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">Operations</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium text-primary-foreground/70">
                <li><Link to="/register-vendor" className="hover:text-accent transition-colors">Vendor Contract</Link></li>
                <li><Link to="/register-admin" className="hover:text-accent transition-colors">Staff Access</Link></li>
                <li><Link to="/login" className="hover:text-accent transition-colors">Authentication</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">Resources</h4>
              <ul className="flex flex-col gap-4 text-sm font-medium text-primary-foreground/70">
                <li><a href="#events" className="hover:text-accent transition-colors">Global Event List</a></li>
                <li><a href="#map" className="hover:text-accent transition-colors">Campus Topology Map</a></li>
                <li><a href="#how-to-book" className="hover:text-accent transition-colors">Security Protocol</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-6">Institution</h4>
              <ul className="flex flex-col gap-2 text-sm font-medium text-primary-foreground/70">
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Main Campus Block</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> New Kandy Rd, Malabe</li>
                <li className="flex items-center gap-2"><span className="text-accent">●</span> Sri Lanka</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-sm text-primary-foreground/50 font-semibold">© 2026 EventAura Systems. Standardized Web Platform.</span>
            <div className="flex gap-4">
               <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 hover:bg-accent hover:text-white transition cursor-pointer">in</span>
               <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/50 hover:bg-accent hover:text-white transition cursor-pointer">tw</span>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  );
};

export default Home;
