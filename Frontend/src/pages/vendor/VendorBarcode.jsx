import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const VendorBarcode = () => {
  const { bookingId } = useParams();

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5000/api";

  const fetchBarcode = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/attendance/generate/${bookingId}`);
      setQrData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to generate event day QR code."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchBarcode();
    }
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500 px-8 py-8 text-white">
            <h1 className="text-3xl font-black tracking-tight">Vendor Event QR Pass</h1>
            <p className="mt-2 text-sm text-slate-200">
              This QR is available only on the event day after approval and advance payment.
            </p>
          </div>

          <div className="p-8">
            {loading && (
              <div className="text-center py-10">
                <p className="text-slate-600 font-medium">Generating QR token...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {!loading && !error && qrData && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      Vendor Name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {qrData.vendorName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      Event Name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {qrData.eventName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      Stall Name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {qrData.stallName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                      Stall Number
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {qrData.stallNumber}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50 p-8 text-center">
                  <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-4">
                    Attendance QR Token
                  </p>

                  <div className="mx-auto max-w-xl rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                    <p className="break-all text-lg md:text-xl font-mono font-bold text-slate-900">
                      {qrData.barcodeToken}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    Show this QR/token to the organizer or admin on the event day for attendance confirmation.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={fetchBarcode}
                    className="rounded-2xl bg-orange-500 text-white px-6 py-3 font-bold shadow-lg hover:bg-orange-600 transition"
                  >
                    Refresh QR Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorBarcode;