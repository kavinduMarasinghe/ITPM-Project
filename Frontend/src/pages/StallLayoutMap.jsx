import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

const StallLayoutMap = ({ role = "admin" }) => {
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ZONE_CONFIG = {
    "VIP Area": {
      title: "MAIN EVENT PLAZA",
      startX: 190,
      startY: 120,
      columns: 6,
      gapX: 78,
      gapY: 64,
    },
    "Zone A": {
      title: "ZONE A (WEST WING)",
      startX: 125,
      startY: 315,
      columns: 3,
      gapX: 72,
      gapY: 68,
    },
    "Zone B": {
      title: "ZONE B (EAST WING)",
      startX: 535,
      startY: 315,
      columns: 3,
      gapX: 72,
      gapY: 68,
    },
    "Central Hub": {
      title: "CAMPUS CENTRAL",
      startX: 348,
      startY: 315,
      columns: 2,
      gapX: 72,
      gapY: 68,
    },
    "Platinum Plaza": {
      title: "PLATINUM PLAZA",
      startX: 348,
      startY: 430,
      columns: 2,
      gapX: 72,
      gapY: 68,
    },
  };

  const entrancePoint = { x: 400, y: 560 };

  const normalizeType = (type) => {
    if (!type) return "General Stall";
    const mapping = {
      Food: "Food Stall",
      Game: "Game Stall",
      Shop: "Retail Stall",
      Sponsor: "Sponsor Booth",
    };
    return mapping[type] || type;
  };

  const normalizeSize = (size) => {
    if (!size) return "Standard";
    if (size === "Small") return "Small (2×2m)";
    if (size === "Medium") return "Medium (3×3m)";
    if (size === "Large") return "Large (4×4m)";
    return size;
  };

  useEffect(() => {
    const fetchStalls = async () => {
      try {
        const res = await api.get("/stalls");
        const stallData = res?.data?.data || [];

        const grouped = {
          "VIP Area": [],
          "Zone A": [],
          "Zone B": [],
          "Central Hub": [],
          "Platinum Plaza": [],
        };

        stallData.forEach((stall) => {
          // Place in its zone if we know it, otherwise fallback to Central Hub
          const zone = grouped[stall.locationZone] !== undefined ? stall.locationZone : "Central Hub";
          grouped[zone].push({
            ...stall,
            stallType: normalizeType(stall.stallType),
            size: normalizeSize(stall.size),
          });
        });

        Object.keys(grouped).forEach((zone) => {
          grouped[zone].sort((a, b) => {
            const aNum = a.stallNumber || "";
            const bNum = b.stallNumber || "";
            return aNum.localeCompare(bNum, undefined, { numeric: true, sensitivity: "base" });
          });
        });

        const mapped = [];
        Object.keys(grouped).forEach((zone) => {
          const config = ZONE_CONFIG[zone];
          if (!config) return;
          grouped[zone].forEach((stall, index) => {
            const col = index % config.columns;
            const row = Math.floor(index / config.columns);
            mapped.push({
              ...stall,
              mapX: config.startX + col * config.gapX,
              mapY: config.startY + row * config.gapY,
            });
          });
        });

        setStalls(mapped);
        setLoading(false);
      } catch (error) {
        console.error("Error loading stalls:", error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStalls();

    // Auto-refresh every 10 seconds so newly created stalls appear automatically
    const interval = setInterval(fetchStalls, 10000);
    return () => clearInterval(interval);
  }, []);

  const zoneCounts = useMemo(() => {
    return stalls.reduce(
      (acc, stall) => {
        acc.total += 1;
        if (stall.status === "Available") acc.available += 1;
        if (stall.status === "Reserved") acc.reserved += 1;
        if (stall.status === "Booked") acc.booked += 1;
        return acc;
      },
      { total: 0, available: 0, reserved: 0, booked: 0 }
    );
  }, [stalls]);

  const getStallIcon = (type) => {
    switch (type) {
      case "Food Stall": return "🍔";
      case "Game Stall": return "🎮";
      case "Retail Stall": return "🛍️";
      case "Sponsor Booth": return "⭐";
      default: return "🏬";
    }
  };

  const getStallFill = (stall) => {
    switch (stall.status) {
      case "Available": return "#22C55E";
      case "Reserved": return "#F59E0B";
      case "Booked": return "#64748b";
      default: return "#cbd5e1";
    }
  };

  const getStallStroke = (stall) => {
    if (selectedStall?._id === stall._id) return "#F97316";
    switch (stall.status) {
      case "Available": return "#16A34A";
      case "Reserved": return "#D97706";
      case "Booked": return "#475569";
      default: return "#94A3B8";
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Available") {
      return "bg-emerald-500 text-white shadow-emerald-200/50";
    }
    if (status === "Reserved") {
      return "bg-amber-500 text-white shadow-amber-200/50";
    }
    return "bg-slate-500 text-white shadow-slate-200/50";
  };

  const createRoutePath = (stall) => {
    if (!stall) return "";

    const targetX = stall.mapX;
    const targetY = stall.mapY;

    // Creative staggered path
    const laneY = targetY < 270 ? 255 : 430;

    return `
      M ${entrancePoint.x} ${entrancePoint.y}
      L ${entrancePoint.x} 500
      C ${entrancePoint.x} 470, ${targetX} 470, ${targetX} 470
      L ${targetX} ${laneY}
      L ${targetX} ${targetY + 30}
    `;
  };

  const estimatedRoute = useMemo(() => {
    if (!selectedStall) return null;

    const dx = Math.abs(selectedStall.mapX - entrancePoint.x);
    const dy = Math.abs(selectedStall.mapY - entrancePoint.y);
    const pixels = dx + dy;
    const meters = Math.round(pixels / 15);
    const seconds = Math.max(15, Math.round(meters * 1.5));

    return {
      meters,
      seconds,
    };
  }, [selectedStall]);

  const handleAction = () => {
    if (!selectedStall) return;

    if (role === "admin") {
      navigate(`/admin/stalls/edit/${selectedStall._id}`);
      return;
    }

    if (selectedStall.status === "Available") {
      navigate(`/vendor/stalls/request/${selectedStall._id}`);
    }
  };

  return (
    <div className="w-full px-6 py-6 pb-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-lg text-[0.65rem] font-black uppercase tracking-widest mb-3 border border-accent/20">
              Interactive Blueprint
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-primary leading-none">
              Event <span className="text-accent">Flow</span> Map
            </h1>
            <p className="mt-4 text-lg text-muted-foreground font-medium max-w-2xl">
              Visualize the global stall ecosystem. Select any node to calculate route geometry and operational constraints.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl shadow-sm">
                <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Global Density</p>
                <p className="text-2xl font-black text-slate-900">{stalls.length}</p>
             </div>
             <div className="bg-emerald-500 border-2 border-emerald-400 p-4 rounded-2xl shadow-lg shadow-emerald-200">
                <p className="text-[0.6rem] font-bold text-emerald-100 uppercase tracking-widest">Available</p>
                <p className="text-2xl font-black text-white">{zoneCounts.available}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative">
          <div className="xl:col-span-8 group">
            <div className="relative overflow-hidden rounded-[40px] border-4 border-white bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] ring-1 ring-slate-100 transition-all hover:shadow-[0_48px_80px_-20px_rgba(0,0,0,0.15)]">
              
              {/* Simple Legend */}
              <div className="absolute right-8 top-8 z-10 rounded-xl bg-white border border-slate-200 shadow-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Map Legend</p>
                <div className="space-y-3">
                  {[
                    { label: 'Available', color: '#22C55E' },
                    { label: 'Pending', color: '#F59E0B' },
                    { label: 'Occupied', color: '#64748B' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              <svg
                width="100%"
                height="100%"
                viewBox="0 0 800 600"
                className="w-full min-h-[680px]"
              >
                <defs>

                  
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>

                <rect width="800" height="600" fill="url(#grid)" />

                {/* VIP AREA */}
                <g filter="url(#glow)">
                   <rect x="150" y="50" width="500" height="150" rx="30" fill="white" stroke="#e2e8f0" strokeWidth="1" />
                   <rect x="160" y="60" width="480" height="130" rx="24" fill="#fffbeb" stroke="#fef3c7" strokeWidth="2" style={{opacity: 0.8}} />
                   <text x="400" y="105" textAnchor="middle" fill="#92400e" className="text-[14px] font-bold tracking-widest">PLATINUM PLAZA</text>
                </g>

                {/* ZONES */}
                <rect x="70" y="270" width="220" height="210" rx="28" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                <rect x="510" y="270" width="220" height="210" rx="28" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                <rect x="320" y="280" width="160" height="190" rx="28" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 5" />

                <text x="180" y="295" textAnchor="middle" fill="#64748b" className="text-[11px] font-black tracking-widest uppercase">West Wing</text>
                <text x="620" y="295" textAnchor="middle" fill="#64748b" className="text-[11px] font-black tracking-widest uppercase">East Wing</text>
                <text x="400" y="305" textAnchor="middle" fill="#64748b" className="text-[11px] font-black tracking-widest uppercase">Central Hub</text>

                {/* PATHS */}
                <path d="M 400 600 L 400 480 M 400 480 L 120 480 L 120 400 M 400 480 L 680 480 L 680 400 M 400 480 L 400 230" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />

                {/* MAIN ENTRANCE - V2 */}
                <g transform="translate(400, 560)">
                   <rect x="-60" y="-30" width="120" height="60" rx="15" fill="#1e293b" />
                   <rect x="-50" y="-20" width="100" height="40" rx="10" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                   <text y="5" textAnchor="middle" fill="white" className="text-[12px] font-black tracking-widest">GATE A</text>
                   <circle cy="15" r="3" fill="#fbbf24" className="animate-pulse" />
                </g>

                {/* Animated Route */}
                {selectedStall && (
                  <g>
                    <path
                      d={createRoutePath(selectedStall)}
                      stroke="#F97316"
                      strokeWidth="5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="10 10"
                      className="animate-[dash_20s_linear_infinite]"
                      style={{
                        strokeDashoffset: 1000,
                        WebkitAnimation: 'dash 20s linear infinite'
                      }}
                    />
                    <style>
                      {`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: 0;
                          }
                        }
                      `}
                    </style>
                    <circle cx={entrancePoint.x} cy={entrancePoint.y} r="14" fill="#F97316" style={{opacity: 0.2}} />
                    <circle cx={entrancePoint.x} cy={entrancePoint.y} r="6" fill="#F97316" />
                    
                    <g transform={`translate(${selectedStall.mapX}, ${selectedStall.mapY})`}>
                       <circle r="40" fill="#F97316" style={{opacity: 0.1}}>
                          <animate attributeName="r" from="30" to="50" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                       </circle>
                    </g>
                  </g>
                )}

                {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center flex-col">
                   <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                   <p className="font-black text-slate-900 uppercase tracking-widest text-sm">Synchronizing Ledger...</p>
                </div>
              )}

                {stalls.map((stall) => {
                  const isSelected = selectedStall?._id === stall._id;
                  const isAvailable = stall.status === "Available";
                  
                  return (
                    <g
                      key={stall._id}
                      transform={`translate(${stall.mapX}, ${stall.mapY})`}
                      onClick={() => setSelectedStall(stall)}
                      className="cursor-pointer group/stall"
                    >
                      {/* Base Plate */}
                      <rect
                        x="-28"
                        y="-28"
                        width="56"
                        height="56"
                        rx="16"
                        fill={getStallFill(stall)}
                        stroke={getStallStroke(stall)}
                        strokeWidth={isSelected ? "4" : "2"}
                        className="transition-all duration-300 group-hover/stall:-translate-y-1 group-hover/stall:shadow-2xl"
                        style={{ filter: isSelected ? 'url(#glow)' : '' }}
                      />
                      
                      {/* Icon Container (Removed Emojis) */}
                      
                      {/* Label */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={isSelected ? "white" : "white"}
                        className="text-[10px] font-bold tracking-tight select-none"
                      >
                        {stall.stallNumber}
                      </text>

                      {/* Micro Indicators */}
                      {!isAvailable && !isSelected && (
                         <circle cx="18" cy="-18" r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
                      )}
                      
                      {isSelected && (
                        <path d="M -8 -40 L 0 -32 L 8 -40" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce" />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Side Control Panel */}
          <div className="xl:col-span-4 h-full">
            <div className="sticky top-8 space-y-6">
              <div className="rounded-[40px] bg-slate-950 text-white shadow-2xl overflow-hidden border border-slate-800">
                <div className="p-10 border-b border-white/5 bg-gradient-to-br from-slate-900 to-slate-950">
                  <div className="flex items-center gap-3 mb-8">
                     <span className="h-2 w-12 bg-sky-500 rounded-full"></span>
                     <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sky-400 font-black">Module: Telemetry</p>
                  </div>

                  {!selectedStall ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white/5 border border-white/10 text-4xl shadow-inner group-hover:scale-110 transition-transform">
                        🔭
                      </div>
                      <h3 className="text-3xl font-black mb-4 tracking-tighter">Waiting for Input</h3>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto font-medium">
                        Select a coordinate on the interactive grid to initiate data retrieval and route synthesis.
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-start justify-between mb-10">
                        <div className="flex-1">
                          <h2 className="text-7xl font-black tracking-tighter leading-none mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            {selectedStall.stallNumber}
                          </h2>
                          <p className="text-2xl font-bold text-sky-400 leading-tight">
                            {selectedStall.stallName}
                          </p>
                          <div className="flex items-center gap-2 mt-3 p-2 bg-white/5 rounded-xl inline-flex">
                             <span className="text-lg">📍</span>
                             <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedStall.locationZone}</span>
                          </div>
                        </div>

                        <span className={`px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-widest shadow-lg ${getStatusBadge(selectedStall.status)}`}>
                          {selectedStall.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                          <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-black mb-2">Spatial Class</p>
                          <p className="text-lg font-bold text-white">{selectedStall.size}</p>
                        </div>

                        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                          <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-black mb-2">Financial Tier</p>
                          <p className="text-lg font-bold text-sky-400">
                             {Number(selectedStall.price || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                          <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-black mb-2">Distance</p>
                          <p className="text-lg font-bold text-white">
                            {estimatedRoute ? `${estimatedRoute.meters}m` : "-"}
                          </p>
                        </div>

                        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors">
                          <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-black mb-2">Est. Travel</p>
                          <p className="text-lg font-bold text-white">
                            {estimatedRoute ? `${estimatedRoute.seconds}s` : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="mb-10 group/desc">
                        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500 font-black mb-4 flex items-center gap-2">
                           Manifest Details
                        </p>
                        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 group-hover/desc:border-sky-500/30 transition-all">
                          <p className="text-sm text-slate-300 leading-relaxed font-medium">
                            {selectedStall.description?.trim()
                              ? selectedStall.description
                              : "No supplemental manifest data provided for this node."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleAction}
                        className={`w-full rounded-2xl py-5 text-sm font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:scale-95 ${
                          role === "admin" 
                          ? "bg-primary text-primary-foreground hover:bg-accent shadow-[0_20px_40px_-10px_rgba(15,23,42,0.1)]"
                          : selectedStall.status === "Available"
                          ? "bg-accent text-white hover:bg-orange-600 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)]"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                        disabled={role !== "admin" && selectedStall.status !== "Available"}
                      >
                        {role === "admin" ? "Recalibrate Stall" : (selectedStall.status === "Available" ? "Secure Allocation" : "Node Locked")}
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-black/40">
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                      SYSTEMS NOMINAL - VER 2.0.4
                   </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="rounded-3xl bg-white border border-slate-100 p-8 shadow-sm">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tactical Intelligence</h4>
                 <ul className="space-y-4">
                    {[
                      { icon: '🗺️', text: 'Select icons to view route geometry from Gate A.' },
                      { icon: '🔒', text: 'Red markers indicate node occupancy / reservation.' },
                      { icon: '✨', text: 'Gradients highlight your active focal selection.' }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4 text-xs font-bold text-slate-600 leading-relaxed">
                        <span>{item.icon}</span>
                        {item.text}
                      </li>
                    ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StallLayoutMap;