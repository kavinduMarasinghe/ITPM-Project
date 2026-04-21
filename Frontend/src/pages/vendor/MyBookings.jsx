import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (createdAt) => {
    const expiryTimestamp = new Date(createdAt).getTime() + 15 * 60000;
    const diff = expiryTimestamp - now;
    if (diff <= 0) return null;
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const fetchRequests = async () => {
    if (!user?.name) return;
    try {
      const res = await api.get(`/stall-bookings/my?vendor=${encodeURIComponent(user.name)}`);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleDelete = async (id, isRecord = false) => {
    if (!window.confirm(isRecord ? "Are you sure you want to remove this record?" : "Are you sure you want to cancel this request?")) return;
    try {
      await api.delete(`/stall-bookings/${id}`);
      toast.success(isRecord ? 'Record removed successfully!' : 'Booking request cancelled successfully!');
      fetchRequests();
    } catch (err) {
      toast.error('Error removing: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/stall-bookings/${id}`, editForm);
      toast.success('Booking updated successfully!');
      setEditingId(null);
      fetchRequests();
    } catch (err) {
      toast.error('Error updating booking: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirm = (req) => {
    navigate('/vendor/booking-payment', { state: { booking: req } });
  };

  const startEdit = (req) => {
    setEditingId(req._id);
    setEditForm({
      contactNumber: req.contactNumber,
      businessName: req.businessName,
      itemsToSell: req.itemsToSell,
      notes: req.notes || ''
    });
  };

  const handleViewPass = (req) => {
    toast.success(
      `🎟️ Booking Pass\nStall: ${req.stallNumber} - ${req.stallName}\nEvent: ${req.eventName}\nStatus: Approved ✅`,
      { duration: 5000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent font-bold text-[0.65rem] uppercase tracking-widest rounded-full mb-3 shadow-sm">
          Booking Records
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">My Requests</h1>
        <p className="text-muted-foreground mt-2 font-medium">Track your historical booking statuses and pending reservation passes.</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-10 overflow-x-auto">
        <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6 tracking-tight">Request History Overview</h3>
        
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-widest border-b-2 border-slate-100">
              <th className="py-4 pr-4">Event Details</th>
              <th className="py-4 px-4">Stall Info</th>
              <th className="py-4 px-4">Request Date</th>
              <th className="py-4 px-4">Status Map</th>
              <th className="py-4 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <React.Fragment key={req._id}>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 pr-4 align-top">
                    <div className="font-bold text-slate-800">{req.eventName}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">Org: <span className="text-slate-700">{req.businessName}</span></div>
                  </td>
                  <td className="py-5 px-4 align-top">
                    <div className="font-bold text-primary tracking-tight">Stall {req.stallNumber}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{req.stallName}</div>
                  </td>
                  <td className="text-sm font-medium text-slate-600 py-5 px-4 align-top">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-4 align-top">
                    {req.status === 'Pending' && (
                      <span className="inline-flex px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold leading-tight">Awaiting Admin Approval</span>
                    )}
                    {req.status === 'PreApproved' && (
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-orange-500 text-white border border-orange-600 text-xs font-bold leading-tight shadow-sm shadow-orange-500/20">Awaiting Payment</span>
                        {getRemainingTime(req.updatedAt) ? (
                          <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 leading-tight">
                            ⏱️ Expires in {getRemainingTime(req.updatedAt)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 leading-tight">
                            Expired
                          </span>
                        )}
                      </div>
                    )}
                    {req.status === 'Confirmed' && <span className="inline-flex px-2.5 py-1 rounded-md bg-blue-500 text-white border border-blue-600 text-xs font-bold leading-tight shadow-sm shadow-blue-500/20">Pending Verification</span>}
                    {req.status === 'Approved' && <span className="inline-flex px-2.5 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-black uppercase tracking-wider leading-tight shadow-sm">Locked & Approved</span>}
                    {req.status === 'Rejected' && <span className="inline-flex px-2.5 py-1 rounded-md bg-red-100 text-red-700 border border-red-200 text-xs font-bold leading-tight">Cancelled/Expired</span>}
                  </td>
                  <td className="py-5 pl-4 align-top text-right whitespace-nowrap">
                    {req.status === 'Approved' ? (
                      <button onClick={() => handleViewPass(req)} className="px-4 py-2 border-2 border-emerald-500 text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 transition-colors text-xs flex items-center gap-1.5 ml-auto">
                        <span className="text-sm">🎟️</span> View Pass
                      </button>
                    ) : req.status === 'PreApproved' ? (
                      <div className="flex gap-2 items-center justify-end">
                        {getRemainingTime(req.updatedAt) && (
                           <button onClick={() => handleConfirm(req)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5">
                             <span className="text-sm">💳</span> Pay Now
                           </button>
                        )}
                        <button className="px-3 py-2 border border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors text-xs" onClick={() => handleDelete(req._id, false)}>Cancel</button>
                      </div>
                    ) : req.status === 'Pending' ? (
                      <button className="px-4 py-2 border border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors text-xs ml-auto block" onClick={() => handleDelete(req._id, false)}>Cancel Request</button>
                    ) : req.status === 'Rejected' ? (
                      <button className="px-4 py-2 border border-slate-200 text-slate-500 font-bold rounded-lg hover:bg-slate-50 transition-colors text-xs ml-auto block" onClick={() => handleDelete(req._id, true)}>Delete Record</button>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Processing...</span>
                    )}
                  </td>
                </tr>
                {/* Embedded Edit Row if matched */}
                {editingId === req._id && (
                  <tr>
                    <td colSpan="5" className="p-6 bg-slate-50 border-b border-slate-200 shadow-inner rounded-xl my-2">
                      <div className="font-bold mb-4 text-primary flex items-center gap-2">
                        <span>✏️</span> Editing Reference #{editingId.slice(-6)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 text-sm">
                        <div className="flex flex-col">
                          <label className="font-bold text-slate-700 mb-1.5 text-xs">Contact Number</label>
                          <input className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" value={editForm.contactNumber} onChange={e => setEditForm({...editForm, contactNumber: e.target.value})} />
                        </div>
                        <div className="flex flex-col">
                          <label className="font-bold text-slate-700 mb-1.5 text-xs">Business Name</label>
                          <input className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" value={editForm.businessName} onChange={e => setEditForm({...editForm, businessName: e.target.value})} />
                        </div>
                        <div className="flex flex-col lg:col-span-3">
                          <label className="font-bold text-slate-700 mb-1.5 text-xs">Items to Sell</label>
                          <input className="px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" value={editForm.itemsToSell} onChange={e => setEditForm({...editForm, itemsToSell: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end items-center border-t border-slate-200 pt-5">
                        <button className="px-5 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm" onClick={() => setEditingId(null)}>Cancel Edit</button>
                        <button className="px-6 py-2.5 font-bold text-white bg-primary rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-primary/20 text-sm" onClick={() => handleUpdate(editingId)}>Save Changes</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            {requests.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 m-4">
                  <div className="text-3xl mb-3 opacity-50">📋</div>
                  <div className="font-bold text-slate-700">No Booking Records Found</div>
                  <div className="text-sm font-medium text-slate-500 mt-1">You haven't initiated any vendor requests for upcoming events yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBookings;
