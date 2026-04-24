import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const InputWrapper = ({ label, name, type = "text", placeholder, maxLength, readOnly, required, value, onChange, onBlur, error, isTouched }) => {
  const isError = isTouched && error;
  const borderClass = isError 
    ? 'border-destructive focus:ring-destructive focus:border-destructive' 
    : isTouched && !error 
    ? 'border-success focus:ring-success focus:border-success' 
    : 'border-border focus:ring-primary focus:border-primary';
    
  const readOnlyClass = readOnly ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-white';

  return (
    <div className="flex flex-col mb-5 relative group">
      <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      
      {type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          rows="3"
          className={`w-full px-4 py-3 rounded-xl border ${borderClass} outline-none transition-all shadow-sm font-medium text-slate-700 resize-y`}
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
          className={`w-full px-4 py-3 rounded-xl border ${borderClass} outline-none transition-all shadow-sm font-medium text-slate-700 ${readOnlyClass}`}
        />
      )}
      
      {error && isTouched && <span className="text-sm font-bold text-red-500 mt-1.5 ml-1">{error}</span>}
    </div>
  );
};

const BookingRequestForm = () => {
  const { stallId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stall, setStall] = useState(null);
  
  const [formData, setFormData] = useState({
    vendorName: user?.fullName || user?.name || '',
    contactNumber: user?.phone || user?.contactNumber || '',
    businessName: user?.businessName || '',
    itemsToSell: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      vendorName: prev.vendorName || user.fullName || user.name || '',
      contactNumber: prev.contactNumber || user.phone || user.contactNumber || '',
      businessName: prev.businessName || user.businessName || '',
    }));
  }, [user]);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const res = await api.get(`/stalls/${stallId}`);
        if (res.data.success) {
          setStall(res.data.data);
        }
      } catch (err) {
        toast.error('Stall not found');
        navigate('/vendor/stalls');
      }
    };
    fetchStall();
  }, [stallId]);

  const validateField = (name, value) => {
    let error = null;
    const trimValue = (value || '').toString().trim();

    if (name === "vendorName") {
      if (!trimValue) error = "Vendor name is required.";
      else if (!/^[A-Za-z\s]{3,50}$/.test(trimValue)) error = "Name must be 3-50 characters, containing only letters and spaces.";
    }

    if (name === "contactNumber") {
      if (!trimValue) error = "Contact number is required.";
      else if (!/^0[0-9]{9}$/.test(trimValue)) error = "Phone number must be exactly 10 digits starting with 0.";
    }

    if (name === "businessName") {
      if (!trimValue) error = "Business name is required.";
      else if (!/^[A-Za-z\s0-9]+$/.test(trimValue)) error = "Business name can only contain letters, numbers, and spaces.";
      else if (trimValue.length < 5 || trimValue.length > 35) error = "Business name must be between 5 and 35 characters.";
    }

    if (name === "itemsToSell") {
      if (!trimValue) error = "Product manifest is required.";
      else if (trimValue.length < 10 || trimValue.length > 80) error = "Description must be between 10 and 80 characters.";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({ ...formData, [name]: value });
    
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key] || '');
      if (err) newErrors[key] = err;
      touched[key] = true;
    });
    setTouched({ ...touched });
    setErrors(newErrors);

    if (Object.values(newErrors).some(err => err !== null)) {
      return;
    }

    try {
      const payload = {
        stallId,
        ...formData
      };
      const res = await api.post('/stall-bookings', payload);
      if (res.data.success) {
        toast.success('Booking request submitted successfully!');
        navigate('/vendor/my-bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting request');
      console.error(err);
    }
  };

  const field = (name) => ({
    name,
    value: formData[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    isTouched: touched[name],
    error: errors[name],
  });

  if (!stall) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent shadow-lg text-primary"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Navigation Area */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-1.5 w-12 bg-accent rounded-full"></span>
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-accent">Merchant Acquisition</p>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-primary leading-none">
              Apply for <span className="text-accent">Space.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-xl">
              Initiate your commercial presence within the campus network. Secure your node before allocations reach capacity.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/vendor/dashboard')}
            className="group flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-sm transition-all hover:border-slate-300 hover:shadow-lg active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Abort Application
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Stall Preview Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-8">
            <div className="bg-primary rounded-[40px] p-10 text-primary-foreground shadow-2xl relative overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-6">Target Node Summary</p>
                
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-7xl font-semibold tracking-tighter text-white drop-shadow-2xl">{stall.stallNumber}</h2>
                    <p className="text-xl font-bold text-primary-foreground/80 mt-2">{stall.stallName}</p>
                  </div>
                  <div className="px-4 py-2 bg-accent rounded-2xl text-sm font-semibold uppercase tracking-widest shadow-lg shadow-accent/30">
                    {stall.stallType}
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/60 font-medium">Operational Zone</span>
                    <span className="font-bold text-accent">{stall.locationZone}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary-foreground/60 font-medium">Spatial Footprint</span>
                    <span className="font-bold text-accent">{stall.size}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-primary-foreground/60 font-medium text-sm">Deployment Rate</span>
                    <span className="text-2xl font-semibold text-white tracking-tight">LKR {stall.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 text-slate-50 transition-transform group-hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Application Policy</h4>
               <p className="text-sm text-slate-600 font-medium leading-relaxed relative z-10">
                 Submission establishes a <span className="text-slate-950 font-semibold">Temporal Hold (72h)</span> on the node. Final clearance requires administrative review and financial verification.
               </p>
            </div>
          </div>

          {/* Application Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
               <div className="p-8 md:p-12 lg:p-16">
                 
                 <form onSubmit={handleSubmit} className="space-y-12">
                    
                    {/* Brand Identity Group */}
                    <section>
                       <div className="flex items-center gap-5 mb-10">
                          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                             </svg>
                          </div>
                          <div>
                             <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Merchant Identity</h3>
                             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Verification Details</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <InputWrapper 
                            {...field('vendorName')}
                            label="Cloud Identity (Owner)" 
                            readOnly={true} 
                            required={true}
                          />
                          <InputWrapper 
                            {...field('contactNumber')}
                            label="Direct Communication Link" 
                            type="tel"
                            placeholder="e.g. 0712345678" 
                            maxLength="10" 
                            required={true}
                          />
                       </div>
                       
                       <div className="mt-8">
                          <InputWrapper 
                            {...field('businessName')}
                            label="Commercial Brand / Business Name" 
                            placeholder="e.g. Zenith Tech Hub" 
                            maxLength="35" 
                            required={true}
                          />
                       </div>
                    </section>

                    {/* Operational Intent Group */}
                    <section className="pt-12 border-t border-slate-100">
                       <div className="flex items-center gap-5 mb-10">
                          <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent shadow-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                             </svg>
                          </div>
                          <div>
                             <h3 className="text-xl font-semibold text-primary tracking-tight">Market Strategy</h3>
                             <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Inventory & Manifest</p>
                          </div>
                       </div>

                       <div className="space-y-8">
                          <InputWrapper 
                            {...field('itemsToSell')}
                            label="Product Manifest (Market Offerings)" 
                            placeholder="Describe your primary inventory modules..." 
                            maxLength="80" 
                            required={true}
                          />
                          <InputWrapper 
                            {...field('notes')}
                            label="Logistic Constraints & Special Requirements" 
                            type="textarea"
                            placeholder="Specify power, layout delta, or hardware needs..." 
                            maxLength="300" 
                          />
                       </div>
                    </section>

                    <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-end">
                       <button 
                         type="button" 
                         onClick={() => navigate('/vendor/dashboard')}
                         className="px-10 py-5 rounded-3xl font-semibold text-sm uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all active:scale-95"
                       >
                         Abort Change
                       </button>
                       <button 
                         type="submit" 
                         className="px-14 py-5 rounded-3xl font-semibold text-sm uppercase tracking-widest text-white bg-slate-950 hover:bg-indigo-600 shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all active:scale-95 flex items-center gap-3"
                       >
                         Transmit Application
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                         </svg>
                       </button>
                    </div>

                 </form>

               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingRequestForm;
