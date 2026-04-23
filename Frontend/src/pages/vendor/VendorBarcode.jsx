import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api';

// Opens admin scan screen (login required); only admins can POST scan — notifications stay admin-side only.
const configuredScanBase = (import.meta.env.VITE_SCAN_BASE_URL || '').trim();
const fallbackScanBase = `${window.location.origin}/admin/attendance/scan/`;
const SCAN_BASE = configuredScanBase || fallbackScanBase;

const isLocalhostUrl = (url) => {
  try {
    const host = new URL(url).hostname;
    return host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
};

function formatDate(d) {
  if (!d) return 'Not set';
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const VendorBarcode = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState('');

  const fetchBarcode = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/attendance/generate/${bookingId}`);
      setQrData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load QR pass. Complete advance payment first.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { if (bookingId) fetchBarcode(); }, [fetchBarcode, bookingId]);

  const normalizedBase = SCAN_BASE.endsWith('/') ? SCAN_BASE : `${SCAN_BASE}/`;
  const scanUrl = qrData?.barcodeToken ? `${normalizedBase}${qrData.barcodeToken}` : '';
  const eventDay = Boolean(qrData?.eventDay);
  const scanLinkMayFailOnPhone = !configuredScanBase && isLocalhostUrl(fallbackScanBase);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="rounded-2xl sm:rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">

          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500 px-4 sm:px-8 py-5 sm:py-8 text-white">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl sm:text-2xl">🎟️</span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Vendor check-in QR</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 sm:ml-9 font-medium">
              Unique pass for your stall. The organizer scans it on event day to confirm attendance.
            </p>
          </div>

          <div className="p-4 sm:p-8">

            {loading && (
              <div className="text-center py-14">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 font-semibold text-sm">Loading your pass…</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-700 font-bold text-base mb-1">Unable to load QR pass</p>
                <p className="text-red-500 text-sm font-medium">{error}</p>
                <button
                  type="button"
                  onClick={fetchBarcode}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && qrData && (
              <div className="space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: 'Vendor name', value: qrData.vendorName },
                    { label: 'Event name', value: qrData.eventName },
                    { label: 'Stall name', value: qrData.stallName },
                    { label: 'Stall number', value: qrData.stallNumber },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-widest text-slate-400 font-semibold mb-1">{label}</p>
                      <p className="text-base font-semibold text-slate-900">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {qrData.eventDate && (
                  <div className={`rounded-2xl px-4 sm:px-5 py-3 sm:py-4 border text-xs sm:text-sm font-semibold flex items-start sm:items-center gap-2 sm:gap-3 ${
                    eventDay
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <span className="text-xl">{eventDay ? '🟢' : '📅'}</span>
                    <span>
                      {eventDay
                        ? 'Today is the event day — organizers can scan this QR for attendance.'
                        : `Event day: ${formatDate(qrData.eventDate)} — scanning is limited to that date (demo: set ATTENDANCE_RELAX_EVENT_DAY=1 on server).`}
                    </span>
                  </div>
                )}

                {qrData.barcodeToken && (
                  <div className="rounded-3xl border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center relative overflow-hidden">
                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-500 mb-5">
                      Your unique check-in code
                    </p>

                    <div className="flex justify-center mb-5">
                      <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-lg border border-orange-100 inline-block max-w-full">
                        <QRCodeSVG
                          value={scanUrl}
                          size={190}
                          bgColor="#ffffff"
                          fgColor="#1e293b"
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>

                    <div className="mx-auto max-w-sm rounded-xl bg-white/80 border border-orange-100 px-4 py-3 mb-3">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Token</p>
                      <p className="break-all text-xs font-mono font-bold text-slate-700">
                        {qrData.barcodeToken}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 font-medium">
                      QR opens the organizer check-in page (admin login). Only an admin scan confirms attendance and updates admin notifications.
                    </p>

                    {scanLinkMayFailOnPhone && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">Phone access note</p>
                        <p className="text-xs text-amber-800 font-medium">
                          This QR currently uses `localhost`, so another phone cannot open it directly. Set
                          `VITE_SCAN_BASE_URL` to your PC LAN URL, e.g.
                          `http://192.168.x.x:3000/admin/attendance/scan`, then restart frontend.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={fetchBarcode}
                    className="w-full sm:w-auto rounded-2xl bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 font-bold shadow-lg transition-all hover:-translate-y-0.5 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh pass
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
