import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSimulatedSave = (e) => {
    e.preventDefault();
    // Simulate an API call latency to update details.
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Saving profile updates...',
        success: 'Profile successfully updated!',
        error: 'Error updating profile.',
      }
    );
  };

  const displayName = user?.name || (user?.role === 'admin' ? 'Admin User' : 'Vendor User');
  const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3 shadow-sm">
          Account Identification
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground mt-2 font-medium">Manage your EventAura persona and security configurations.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Profile Card Side Panel */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center">
           <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-tr from-accent to-orange-400 text-white flex items-center justify-center font-black text-5xl mb-6 mt-4">
              {initials}
           </div>
           <h2 className="text-2xl font-black text-slate-800">{displayName}</h2>
           <div className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg mt-2 uppercase tracking-widest">
             {user?.role === 'admin' ? 'Administrator' : 'Vendor Account'}
           </div>

           <p className="text-sm text-slate-500 font-medium text-center mt-6">
             Your account identity dictates the features and modules available to you on the central EventAura directory.
           </p>

           <div className="mt-8 w-full border-t border-slate-200 pt-8">
             <div className="flex justify-between items-center mb-4 text-sm">
               <span className="font-bold text-slate-400 uppercase tracking-wider text-xs">Security Status</span>
               <span className="font-bold text-green-500 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                 Healthy
                </span>
             </div>
             <button onClick={() => navigate('/')} className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 transition-colors">
               Sign Out Securely
             </button>
           </div>
        </div>

        {/* Configuration Form */}
        <div className="w-full md:w-2/3 p-8 lg:p-10">
          <form className="h-full flex flex-col" onSubmit={handleSimulatedSave}>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6">Personal Identification</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" defaultValue={user?.name || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-primary focus:ring-primary shadow-sm font-medium text-slate-700 bg-slate-50 cursor-not-allowed" readOnly />
                  <span className="text-xs text-slate-400 mt-1 font-medium">To change your primary registered identity, contact IT.</span>
                </div>
                
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" defaultValue={user?.email || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-primary focus:ring-primary shadow-sm font-medium text-slate-700 bg-slate-50 cursor-not-allowed" readOnly />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 mb-1.5">Contact Interface</label>
                  <input type="text" defaultValue={user?.contactNumber || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-primary focus:ring-primary shadow-sm font-medium text-slate-700" placeholder="e.g. 0712345678" />
                </div>
               </div>
            </div>

            {user?.role === 'vendor' && (
              <div className="mb-6 mt-4">
                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2 mb-6">Business Operations</h3>
                
                <div className="flex flex-col mb-5">
                  <label className="text-sm font-bold text-slate-700 mb-1.5">Organization / Frontline Identity</label>
                  <input type="text" defaultValue={user?.businessName || ''} className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none transition-all focus:border-primary focus:ring-primary shadow-sm font-medium text-slate-700" placeholder="Your registered structural business name" />
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 flex gap-4 justify-end border-t border-slate-100">
               <button type="submit" className="px-8 py-3.5 rounded-xl font-bold text-white transition-all bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 outline-none shadow-lg shadow-primary/30 flex items-center gap-2">
                  Update Configuration Profile
               </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
