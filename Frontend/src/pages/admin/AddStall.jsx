import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Helper function to trim and clean values safely
const cleanString = (str) => (typeof str === 'string' ? str.trim().replace(/\s+/g, ' ') : str);

// Helper to format price with space separation
const formatPrice = (val) => {
  const cleanNum = val.toString().replace(/\D/g, '');
  return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// ──────────────────────────────────────────────────────────────────────────────
// InputGroup is defined OUTSIDE AddStall so it never remounts on state change.
// Defining it inside the component causes a new element type every render,
// which means React unmounts/remounts the input, losing focus after 1 keystroke.
// ──────────────────────────────────────────────────────────────────────────────
const InputGroup = ({
  label, name, type = 'text', placeholder, options,
  helperText, maxLength, readOnly, prefix,
  value, onChange, onBlur, touched, error
}) => {
  const isError   = touched && error;
  const isSuccess = touched && !error;

  const borderClass = isError
    ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
    : isSuccess
    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
    : 'border-[#E2E8F0] focus:ring-[#F97316] focus:border-[#F97316]';

  const readOnlyClass = readOnly
    ? 'bg-[#F1F5F9] text-[#64748B] cursor-not-allowed'
    : 'bg-white text-[#0F172A]';

  const base = `w-full px-4 py-3 rounded-xl border ${borderClass} outline-none transition-all shadow-sm font-medium focus:ring-2`;

  return (
    <div className="flex flex-col mb-5">
      <label className="text-sm font-bold text-[#0F172A] mb-1.5">{label}</label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#64748B] text-sm pointer-events-none">
            {prefix}
          </span>
        )}

        {type === 'select' ? (
          <div style={{ position: 'relative' }}>
            <select
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                borderRadius: '12px',
                border: `1px solid ${isError ? '#EF4444' : isSuccess ? '#22C55E' : '#E2E8F0'}`,
                outline: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#0F172A',
                background: '#FFFFFF',
                appearance: 'none',
                WebkitAppearance: 'none',
                cursor: 'pointer',
              }}
            >
              {options.map((opt, i) => (
                <option key={i} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
              ))}
            </select>
            {/* Clean chevron arrow */}
            <span style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            rows={3}
            className={`${base} text-[#0F172A] resize-y`}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            maxLength={maxLength}
            readOnly={readOnly}
            className={`${base} ${readOnlyClass} ${prefix ? 'pl-12' : ''}`}
          />
        )}

        {/* Validation Icons */}
        {isSuccess && type !== 'textarea' && type !== 'select' && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </span>
        )}
        {isError && type !== 'textarea' && type !== 'select' && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {helperText && !error && (
        <span className="text-xs font-medium text-[#64748B] mt-1.5 ml-1">{helperText}</span>
      )}
      {error && touched && (
        <span className="text-xs font-bold text-red-500 mt-1.5 ml-1">{error}</span>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
const AddStall = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    stallName: '',
    stallNumber: '',
    stallType: '',
    eventName: '',
    locationCategory: 'Standard',
    locationZone: '',
    size: '',
    price: '30000',
    status: 'Available',
    description: '',
  });

  const [errors, setErrors]     = useState({});
  const [touched, setTouched]   = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- VALIDATION RULES ---
  const validateField = (name, value) => {
    let error = null;
    switch (name) {
      case 'stallName': {
        const v = cleanString(value);
        if (!v) error = 'Stall name is required.';
        else if (!/^[a-zA-Z0-9\s]+$/.test(v)) error = 'Letters, numbers and spaces only.';
        else if (v.length < 3 || v.length > 50) error = 'Must be 3–50 characters.';
        break;
      }
      case 'stallNumber': {
        if (!value) error = 'Stall number is required.';
        else if (!/^[A-Z0-9]+$/.test(value)) error = 'Capital letters and numbers only.';
        else if (value.length < 2 || value.length > 6) error = '2–6 characters.';
        break;
      }
      case 'stallType':
        if (!value) error = 'Please select a stall type.';
        break;
      case 'eventName': {
        const v = cleanString(value);
        if (!v) error = 'Event name is required.';
        else if (!/^[A-Za-z0-9\s]+$/.test(v)) error = 'Letters, numbers and spaces only.';
        else if (v.length < 3 || v.length > 50) error = 'Must be 3–50 characters.';
        break;
      }
      case 'locationCategory':
        if (!value) error = 'Select a location category.';
        break;
      case 'locationZone':
        if (!value) error = 'Select a location zone.';
        break;
      case 'size':
        if (!value) error = 'Select a stall size.';
        break;
      case 'price': {
        const raw = value ? value.toString().replace(/\s/g, '') : '';
        if (!raw) error = 'Price is required.';
        break;
      }
      case 'status':
        if (!value) error = 'Select a valid status.';
        break;
      case 'description': {
        const v = cleanString(value);
        if (v && (v.length < 5 || v.length > 300))
          error = 'Description must be 5–300 characters.';
        break;
      }
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    let newValue = value;
    if (['stallName', 'eventName', 'description'].includes(name)) {
      newValue = cleanString(value);
      setFormData(prev => ({ ...prev, [name]: newValue }));
    }
    setErrors(prev => ({ ...prev, [name]: validateField(name, newValue) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processed = value;
    if (name === 'stallNumber') processed = value.toUpperCase();
    if (name === 'price') processed = formatPrice(value);

    setFormData(prev => {
      const next = { ...prev, [name]: processed };
      if (name === 'locationCategory') {
        if (value === 'Premium')  next.price = '50 000';
        if (value === 'Standard') next.price = '30 000';
        if (value === 'Basic')    next.price = '15 000';
      }
      return next;
    });

    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, processed) }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((a, k) => ({ ...a, [k]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        stallName:   cleanString(formData.stallName),
        eventName:   cleanString(formData.eventName),
        description: cleanString(formData.description),
        price: Number(formData.price.toString().replace(/\s/g, '')),
      };
      const res = await api.post('/stalls', submitData);
      if (res.data.success) {
        toast.success('Stall Added Successfully! ✅');
        navigate('/admin/stalls/list');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error adding stall ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shorthand to pass all field props to InputGroup
  const field = (name) => ({
    name,
    value:   formData[name],
    onChange: handleChange,
    onBlur:  handleBlur,
    touched: touched[name],
    error:   errors[name],
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#F4F6F9' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="h-1.5 w-12 rounded-full" style={{ background: '#F97316' }}></span>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.3em]" style={{ color: '#F97316' }}>Administrative Portal</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none" style={{ color: '#0F172A' }}>
              Deploy <span style={{ color: '#F97316' }}>Node.</span>
            </h1>
            <p className="mt-4 text-lg font-medium max-w-xl" style={{ color: '#64748B' }}>
              Register a new operational stall within the campus ecosystem.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/stalls/list')}
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 shadow-sm"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Directory
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] overflow-hidden" style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.08)', border: '1px solid #E9EEF5' }}>
              <div className="p-8 md:p-12 lg:p-16">
                <form onSubmit={handleSubmit} className="space-y-10">

                  {/* ── Section 1: Core Identification ── */}
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl" style={{ background: 'rgba(249,115,22,0.1)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#F97316">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight" style={{ color: '#0F172A' }}>Core Identification</h2>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#64748B' }}>Stall Identity &amp; Mapping</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputGroup {...field('stallName')} label="Stall Name *" placeholder="e.g. Skyline Refreshments" maxLength={50} />
                      <InputGroup {...field('stallNumber')} label="Map Code *" placeholder="e.g. A01" helperText="Links to SVG grid." maxLength={6} />
                    </div>
                  </section>

                  {/* ── Section 2: Classification ── */}
                  <section className="pt-10 border-t" style={{ borderColor: '#F1F5F9' }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl" style={{ background: 'rgba(249,115,22,0.1)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#F97316">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight" style={{ color: '#0F172A' }}>Classification &amp; Metrics</h2>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#64748B' }}>Tier &amp; Placement Logic</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InputGroup
                        {...field('stallType')} label="Stall Type *" type="select"
                        options={[
                          { value: '', label: 'Select type...', disabled: true },
                          { value: 'Food Stall',    label: 'Food & Beverage' },
                          { value: 'Game Stall',    label: 'Interactive Games' },
                          { value: 'Retail Stall',  label: 'Retail & Apparel' },
                          { value: 'Sponsor Booth', label: 'Corporate Sponsor' },
                        ]}
                      />
                      <InputGroup
                        {...field('eventName')} label="Event Name *" placeholder="e.g. Tech Fest 2025" maxLength={50}
                      />
                      <InputGroup
                        {...field('size')} label="Stall Size *" type="select"
                        options={[
                          { value: '',       label: 'Select size...', disabled: true },
                          { value: 'Small',  label: 'Small [2×2m]' },
                          { value: 'Medium', label: 'Medium [3×3m]' },
                          { value: 'Large',  label: 'Large [5×5m]' },
                        ]}
                      />
                      <InputGroup
                        {...field('locationZone')} label="Location Zone *" type="select"
                        options={[
                          { value: '',              label: 'Select zone...', disabled: true },
                          { value: 'Zone A',        label: 'West Wing (Zone A)' },
                          { value: 'Zone B',        label: 'East Wing (Zone B)' },
                          { value: 'Central Hub',   label: 'Campus Central' },
                          { value: 'Platinum Plaza',label: 'Platinum Plaza' },
                        ]}
                      />
                      <InputGroup
                        {...field('locationCategory')} label="Placement Tier *" type="select"
                        options={[
                          { value: 'Premium',  label: 'High Exposure [Premium]' },
                          { value: 'Standard', label: 'Mid-Range [Standard]' },
                          { value: 'Basic',    label: 'Budget [Basic]' },
                        ]}
                      />
                    </div>
                  </section>

                  {/* ── Section 3: Operations ── */}
                  <section className="pt-10 border-t" style={{ borderColor: '#F1F5F9' }}>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 rounded-2xl" style={{ background: 'rgba(249,115,22,0.1)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#F97316">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight" style={{ color: '#0F172A' }}>Operations &amp; Ledger</h2>
                        <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: '#64748B' }}>Financial Defaults &amp; Notes</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <InputGroup
                        {...field('status')} label="Status *" type="select"
                        options={[
                          { value: 'Available', label: 'Available' },
                          { value: 'Reserved',  label: 'Reserved (Pending)' },
                          { value: 'Booked',    label: 'Booked' },
                        ]}
                      />
                      <InputGroup
                        {...field('price')} label="Rate (LKR)" prefix="LKR"
                        helperText="Auto-computed based on Tier. Can be edited manually."
                      />
                    </div>
                    <div className="mt-8">
                      <InputGroup
                        {...field('description')} label="Amenities / Notes" type="textarea"
                        placeholder="e.g. 15A Socket, LED signage, Wi-Fi access..." maxLength={300}
                      />
                    </div>
                  </section>

                  {/* ── Buttons ── */}
                  <div className="pt-10 border-t flex flex-col sm:flex-row gap-4 justify-end" style={{ borderColor: '#E9EEF5' }}>
                    <button
                      type="button"
                      onClick={() => navigate('/admin/stalls/list')}
                      className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
                      style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#64748B' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                      style={{
                        background: isSubmitting ? '#94a3b8' : '#0F172A',
                        color: '#F8FAFC',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: isSubmitting ? 'none' : '0 8px 32px rgba(249,115,22,0.2)',
                      }}
                    >
                      {isSubmitting ? 'Saving...' : 'Deploy Node ✦'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="rounded-[40px] p-10 overflow-hidden relative" style={{ background: '#0F172A', color: '#F8FAFC' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(249,115,22,0.15)' }}></div>
              <h3 className="text-2xl font-black tracking-tight mb-4 leading-tight">Automated Mapping Protocol</h3>
              <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: 'rgba(248,250,252,0.65)' }}>
                New nodes sync automatically with the interactive SVG layout. Ensure the <code className="px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>Map Code</code> is exact.
              </p>
              <div className="p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <p className="text-[0.65rem] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(248,250,252,0.5)' }}>System Status</p>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#22C55E', boxShadow: '0 0 10px #22C55E' }}></span>
                  <p className="text-sm font-bold">Cloud Link Active</p>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] p-10 border" style={{ background: '#FFFFFF', borderColor: '#E9EEF5' }}>
              <h4 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: '#64748B' }}>Validation Rules</h4>
              <ul className="space-y-5">
                {[
                  { label: 'Map Code',    text: 'Must be unique and exist in SVG layers.' },
                  { label: 'Tier Logic',  text: 'Price is auto-set by Placement Tier.' },
                  { label: 'Event Name',  text: 'Use letters and numbers, 3–50 chars.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>{i + 1}</span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter mb-1" style={{ color: '#0F172A' }}>{item.label}</p>
                      <p className="text-sm font-medium leading-tight" style={{ color: '#64748B' }}>{item.text}</p>
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

export default AddStall;
