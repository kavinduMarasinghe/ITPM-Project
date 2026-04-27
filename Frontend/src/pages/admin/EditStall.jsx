import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Brand palette (inline styles for guaranteed rendering) ──
const C = {
  bg:       '#F4F6F9',
  white:    '#FFFFFF',
  primary:  '#0F172A',
  accent:   '#F97316',
  muted:    '#64748B',
  border:   '#E2E8F0',
  secondary:'#E9EEF5',
  readonly: '#F1F5F9',
};

const inputBase = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '12px',
  border: `1px solid ${C.border}`,
  outline: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  color: C.primary,
  background: C.white,
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: C.muted,
  marginBottom: '6px',
};

const EditStall = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    stallName: '',
    stallNumber: '',
    stallType: 'Food Stall',
    eventName: '',
    size: 'Medium',
    locationCategory: 'Standard',
    price: '30 000',
    locationZone: 'Zone A',
    description: '',
    status: 'Available',
  });

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await api.get(`/stalls/${id}`);
        if (res.data.success) {
          const d = res.data.data;
          setFormData({
            stallName:        d.stallName        || '',
            stallNumber:      d.stallNumber      || '',
            stallType:        d.stallType        || 'Food Stall',
            eventName:        d.eventName        || '',
            size:             d.size             || 'Medium',
            locationCategory: d.locationCategory || 'Standard',
            price:            d.price ? d.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '30 000',
            locationZone:     d.locationZone     || 'Zone A',
            description:      d.description      || '',
            status:           d.status           || 'Available',
          });
        }
      } catch {
        toast.error('Stall not found');
        navigate('/admin/stalls/list');
      }
    };
    fetchStall();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'price') {
      const cleanNum = value.toString().replace(/\D/g, '');
      processedValue = cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    setFormData(prev => {
      const next = { ...prev, [name]: processedValue };
      if (name === 'locationCategory') {
        if (value === 'Premium')  next.price = '50 000';
        if (value === 'Standard') next.price = '30 000';
        if (value === 'Basic')    next.price = '15 000';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price.toString().replace(/\s/g, '')),
      };
      const res = await api.put(`/stalls/${id}`, submitData);
      if (res.data.success) {
        toast.success('Stall updated successfully! ✅');
        navigate('/admin/stalls/list');
      }
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const Field = ({ label, name, type = 'text', options, readOnly, rows }) => (
    <div style={{ display:'flex', flexDirection:'column', marginBottom:'8px' }}>
      <label style={labelStyle}>{label}</label>
      {type === 'select' ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          style={{ ...inputBase, background: C.white, cursor:'pointer' }}
        >
          {options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={rows || 4}
          placeholder="List essential amenities..."
          style={{ ...inputBase, resize:'vertical' }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          readOnly={readOnly}
          style={{ ...inputBase, background: readOnly ? C.readonly : C.white, cursor: readOnly ? 'not-allowed' : 'text', color: readOnly ? C.muted : C.primary }}
        />
      )}
    </div>
  );

  const SectionHeader = ({ icon, title, sub }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px' }}>
      <div style={{ padding:'12px', borderRadius:'16px', background:'rgba(249,115,22,0.1)' }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontSize:'1.2rem', fontWeight:900, color: C.primary, margin:0 }}>{title}</h2>
        <p style={{ fontSize:'0.7rem', fontWeight:700, color: C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'4px' }}>{sub}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background: C.bg, padding:'48px 16px' }}>
      <div style={{ maxWidth:'1152px', margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom:'48px', display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'flex-end', gap:'24px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
              <span style={{ height:'6px', width:'48px', borderRadius:'9999px', background: C.accent, display:'inline-block' }}></span>
              <p style={{ fontSize:'0.65rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.3em', color: C.accent }}>Administrative Portal</p>
            </div>
            <h1 style={{ fontSize:'3.5rem', fontWeight:900, letterSpacing:'-0.04em', color: C.primary, lineHeight:1, margin:0 }}>
              Edit <span style={{ color: C.accent }}>Node.</span>
            </h1>
            <p style={{ marginTop:'12px', fontSize:'1rem', color: C.muted, fontWeight:500 }}>
              Modify operational parameters for stall <strong style={{ color: C.primary }}>{formData.stallNumber}</strong>.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/stalls/list')}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 20px', background: C.white, border:`1px solid ${C.border}`, borderRadius:'16px', fontWeight:700, fontSize:'0.875rem', color: C.primary, cursor:'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap:'32px', alignItems:'start' }}>
          {/* Main Form */}
          <div style={{ gridColumn:'span 8' }}>
            <div style={{ background: C.white, borderRadius:'40px', border:`1px solid ${C.secondary}`, boxShadow:'0 32px 64px -16px rgba(0,0,0,0.08)', overflow:'hidden' }}>
              <div style={{ padding:'48px' }}>
                <form onSubmit={handleSubmit}>

                  {/* Section 1 */}
                  <SectionHeader
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                    title="Core Identification"
                    sub="Stall Identity & Mapping"
                  />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'32px' }}>
                    <Field label="Stall Name *" name="stallName" />
                    <Field label="Map Code *" name="stallNumber" />
                  </div>

                  <hr style={{ borderColor: C.secondary, margin:'24px 0' }} />

                  {/* Section 2 */}
                  <SectionHeader
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    title="Classification & Metrics"
                    sub="Tier & Placement Logic"
                  />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'32px' }}>
                    <Field label="Stall Type *" name="stallType" type="select" options={[
                      { value:'Food Stall',    label:'Food & Beverage' },
                      { value:'Game Stall',    label:'Interactive Games' },
                      { value:'Retail Stall',  label:'Retail & Apparel' },
                      { value:'Sponsor Booth', label:'Corporate Sponsor' },
                    ]} />
                    <Field label="Event Name *" name="eventName" />
                    <Field label="Stall Size *" name="size" type="select" options={[
                      { value:'Small',  label:'Small [2×2m]' },
                      { value:'Medium', label:'Medium [3×3m]' },
                      { value:'Large',  label:'Large [5×5m]' },
                    ]} />
                    <Field label="Location Zone *" name="locationZone" type="select" options={[
                      { value:'Zone A',         label:'West Wing (Zone A)' },
                      { value:'Zone B',         label:'East Wing (Zone B)' },
                      { value:'Central Hub',    label:'Campus Central' },
                      { value:'Platinum Plaza', label:'Platinum Plaza' },
                    ]} />
                    <Field label="Placement Tier *" name="locationCategory" type="select" options={[
                      { value:'Premium',  label:'Premium Tier' },
                      { value:'Standard', label:'Standard Tier' },
                      { value:'Basic',    label:'Basic Tier' },
                    ]} />
                  </div>

                  <hr style={{ borderColor: C.secondary, margin:'24px 0' }} />

                  {/* Section 3 */}
                  <SectionHeader
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={C.accent}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    title="Operations & Ledger"
                    sub="Financial Defaults & Status"
                  />
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'24px' }}>
                    <Field label="Status *" name="status" type="select" options={[
                      { value:'Available', label:'Available' },
                      { value:'Reserved',  label:'Reserved (Pending)' },
                      { value:'Booked',    label:'Booked' },
                    ]} />
                    <Field label="Rate (LKR)" name="price" />
                  </div>
                  <Field label="Amenities / Description" name="description" type="textarea" rows={4} />

                  {/* Buttons */}
                  <div style={{ paddingTop:'32px', borderTop:`1px solid ${C.secondary}`, display:'flex', justifyContent:'flex-end', gap:'16px', marginTop:'32px' }}>
                    <button type="button" onClick={() => navigate('/admin/stalls/list')}
                      style={{ padding:'14px 28px', borderRadius:'16px', fontWeight:900, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em', background: C.secondary, border:`1px solid ${C.border}`, color: C.muted, cursor:'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit"
                      style={{ padding:'14px 40px', borderRadius:'16px', fontWeight:900, fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em', background: C.primary, color:'#F8FAFC', cursor:'pointer', boxShadow:'0 8px 32px rgba(249,115,22,0.2)' }}>
                      Save Changes ✦
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ gridColumn:'span 4' }}>
            <div style={{ background: C.primary, borderRadius:'40px', padding:'40px', position:'relative', overflow:'hidden', color:'#F8FAFC' }}>
              <div style={{ position:'absolute', top:0, right:0, width:'160px', height:'160px', background:'rgba(249,115,22,0.15)', borderRadius:'9999px', filter:'blur(40px)', transform:'translate(50%,-50%)' }}></div>
              <h3 style={{ fontSize:'1.4rem', fontWeight:900, marginBottom:'12px' }}>Live Directory Sync</h3>
              <p style={{ fontSize:'0.875rem', color:'rgba(248,250,252,0.65)', lineHeight:1.6, marginBottom:'24px' }}>
                Updating this node triggers a global cache refresh for all Vendor dashboards.
              </p>
              <div style={{ padding:'20px', background:'rgba(255,255,255,0.08)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.15)' }}>
                <p style={{ fontSize:'0.65rem', fontWeight:900, color:'rgba(248,250,252,0.5)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'8px' }}>Node Status</p>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <span style={{ width:'10px', height:'10px', borderRadius:'9999px', background:'#22C55E', boxShadow:'0 0 10px #22C55E', animation:'pulse 1.5s infinite' }}></span>
                  <p style={{ fontSize:'0.875rem', fontWeight:700 }}>Secure Socket Active</p>
                </div>
              </div>
            </div>

            <div style={{ background: C.white, borderRadius:'40px', padding:'40px', border:`1px solid ${C.secondary}`, marginTop:'24px' }}>
              <h4 style={{ fontSize:'0.7rem', fontWeight:900, color: C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'24px' }}>Edit Notes</h4>
              <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'16px' }}>
                {[
                  { label:'Status Switch', text:'Marking Booked disables vendor request triggers.' },
                  { label:'Map ID',        text:'Changing Map Code requires coordinate validation.' },
                  { label:'Price Lock',    text:'Price depends on Placement Tier selection.' },
                ].map((item, i) => (
                  <li key={i} style={{ display:'flex', gap:'12px' }}>
                    <span style={{ flexShrink:0, width:'24px', height:'24px', borderRadius:'8px', background:'rgba(249,115,22,0.1)', color: C.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:900 }}>{i+1}</span>
                    <div>
                      <p style={{ fontSize:'0.7rem', fontWeight:900, color: C.primary, textTransform:'uppercase', letterSpacing:'0.05em', margin:0, marginBottom:'4px' }}>{item.label}</p>
                      <p style={{ fontSize:'0.875rem', color: C.muted, fontWeight:500, margin:0, lineHeight:1.4 }}>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStall;
