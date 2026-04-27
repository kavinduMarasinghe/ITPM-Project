import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null); // For View modal

  const fetchRequests = async () => {
    try {
      const res = await api.get('/stall-bookings');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    if (!window.confirm("Are you sure you want to accept this request? The vendor will have 5 days to pay the advance.")) return;
    try {
      await api.put(`/stall-bookings/${id}/accept`);
      toast.success('Request accepted! Vendor notified to pay advance.');
      fetchRequests();
    } catch (err) {
      toast.error('Error accepting: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to confirm and lock this booking?")) return;
    try {
      await api.put(`/stall-bookings/${id}/approve`);
      toast.success('Booking approved and stall locked!');
      fetchRequests();
    } catch (err) {
      toast.error('Error approving: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await api.put(`/stall-bookings/${id}/reject`);
      toast.success('Booking rejected. Stall is now available.');
      fetchRequests();
    } catch (err) {
      toast.error('Error rejecting: ' + (err.response?.data?.message || err.message));
      console.error(err);
    }
  };

  const closeModal = () => setSelectedReq(null);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest border border-primary/20">
            Booking Workflow
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-primary tracking-tight">Booking Approvals</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Review vendor stall requests and finalize reservations.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table className="w-full min-w-[880px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Stall Allocation</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map(req => (
              <tr key={req._id} className="hover:bg-slate-50/60 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{req.vendorName}</div>
                  <div className="text-sm text-slate-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{req.stallNumber}</div>
                  <div className="text-sm font-medium text-slate-500">{req.eventName}</div>
                </td>
                <td className="px-6 py-4">
                  {req.status === 'Pending' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-yellow-100/50 text-yellow-700 border border-yellow-200">Needs Approval</span>}
                  {req.status === 'PreApproved' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-orange-100 text-orange-700 border border-orange-200">Awaiting Advance (5 Days)</span>}
                  {req.status === 'Confirmed' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-blue-100/50 text-blue-700 border border-blue-200">Advance Paid</span>}
                  {req.status === 'Approved' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-emerald-100/50 text-emerald-700 border border-emerald-200">Locked</span>}
                  {req.status === 'Rejected' && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-red-100/50 text-red-700 border border-red-200">Cancelled</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end items-center">
                    <button 
                      onClick={() => setSelectedReq(req)} 
                      className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                    >
                      View
                    </button>

                    {req.status === 'Pending' && (
                      <>
                        <button onClick={() => handleAccept(req._id)} className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">Accept Request</button>
                        <button onClick={() => handleReject(req._id)} className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">Cancel</button>
                      </>
                    )}
                    {req.status === 'PreApproved' && (
                      <button onClick={() => handleReject(req._id)} className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">Cancel Request</button>
                    )}
                    {req.status === 'Confirmed' && (
                      <>
                        <button onClick={() => handleApprove(req._id)} className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          Lock Booking
                        </button>
                        <button onClick={() => handleReject(req._id)} className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">Cancel</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-500 font-medium">No booking requests pending.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-semibold text-primary">Booking Details</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Vendor Name</p>
                   <p className="font-bold text-primary">{selectedReq.vendorName}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                   <p className="font-bold text-primary">{selectedReq.contactNumber}</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Business/Brand Name</p>
                   <p className="font-bold text-primary">{selectedReq.businessName}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Items to Sell</p>
                   <p className="font-bold text-primary">{selectedReq.itemsToSell || 'N/A'}</p>
                 </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Requested Allocation</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-primary text-lg">{selectedReq.stallNumber}</p>
                    <p className="text-sm text-slate-500 font-medium">{selectedReq.stallName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 font-medium">{selectedReq.eventName}</p>
                  </div>
                </div>
              </div>

              {selectedReq.notes && (
                <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Additional Notes</p>
                   <p className="text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedReq.notes}</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
               <button onClick={closeModal} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold uppercase tracking-widest rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingRequests;
