import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useParams } from "react-router-dom";
import api from "../../api";
import toast from "react-hot-toast";

const extractToken = (raw) => {
  const value = (raw || "").trim();
  if (!value) return "";

  if (/^[a-f0-9]{24}$/i.test(value) || /^[a-f0-9]{32}$/i.test(value)) return value;

  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || value;
  } catch (_) {
    const parts = value.split("/").filter(Boolean);
    return parts[parts.length - 1] || value;
  }
};

const ScanAttendance = () => {
  const { token } = useParams();
  const [barcodeToken, setBarcodeToken] = useState(extractToken(token || ""));
  const [scannedBy, setScannedBy] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [readerKey, setReaderKey] = useState(0);
  const autoSubmittedRef = useRef(false);
  const lastSubmittedTokenRef = useRef("");

  useEffect(() => {
    if (token) setBarcodeToken(extractToken(token));
  }, [token]);

  useEffect(() => {
    autoSubmittedRef.current = false;
  }, [token]);

  useEffect(() => {
    if (!cameraOn) return;

    const id = "organizer-qr-reader";
    const scanner = new Html5QrcodeScanner(
      id,
      { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
      false
    );
    scanner.render(
      (decodedText) => {
        const text = extractToken(decodedText);
        if (text) {
          setBarcodeToken(text);
          setCameraOn(false);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [cameraOn, readerKey]);

  const submitScan = async (tokenValue) => {
    const normalized = extractToken(tokenValue);
    if (!normalized) {
      setError("Please enter, paste, or scan a QR token.");
      setResult(null);
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await api.post("/attendance/scan", {
        barcodeToken: normalized,
        scannedBy,
      });

      setResult(res.data);
      if (res.data?.adminEmailSent) {
        toast.success("Gmail: admin inbox notified about this check-in.");
      } else if (res.data?.adminEmailNote) {
        toast(res.data.adminEmailNote, { duration: 5000, icon: "ℹ️" });
      }
      setBarcodeToken("");
      lastSubmittedTokenRef.current = normalized;
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to confirm attendance.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    await submitScan(barcodeToken);
  };

  useEffect(() => {
    if (!token || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    const autoConfirm = async () => {
      const fromUrl = extractToken(token);
      await submitScan(fromUrl);
      lastSubmittedTokenRef.current = fromUrl;
    };

    autoConfirm();
  }, [token, scannedBy]);

  useEffect(() => {
    if (!barcodeToken || loading) return;
    if (token) return;
    if (barcodeToken === lastSubmittedTokenRef.current) return;

    const autoConfirmFromCamera = async () => {
      await submitScan(barcodeToken);
    };

    autoConfirmFromCamera();
  }, [barcodeToken, token, loading]);

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500 px-4 sm:px-8 py-5 sm:py-8 text-white">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Scan vendor attendance</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-200">
              Admin only: scan the vendor&apos;s stall QR (or paste the token). Confirms check-in on the event day. Notifications and logs update on the admin side only — vendors do not receive scan alerts.
            </p>
          </div>

          <div className="p-4 sm:p-8">
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (cameraOn) setCameraOn(false);
                  else {
                    setReaderKey((k) => k + 1);
                    setCameraOn(true);
                  }
                }}
                className="w-full sm:w-auto rounded-2xl border-2 border-orange-400 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-800 hover:bg-orange-100 transition"
              >
                {cameraOn ? "Stop camera" : "Open QR camera"}
              </button>
            </div>

            {cameraOn && (
              <div key={readerKey} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-3 overflow-hidden">
                <div id="organizer-qr-reader" className="w-full min-h-[240px] sm:min-h-[280px]" />
              </div>
            )}

            <form onSubmit={handleScan} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  QR token
                </label>
                <input
                  type="text"
                  value={barcodeToken}
                  onChange={(e) => setBarcodeToken(extractToken(e.target.value))}
                  placeholder="Scan, paste, or type token from vendor pass"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Scanned by
                </label>
                <input
                  type="text"
                  value={scannedBy}
                  onChange={(e) => setScannedBy(e.target.value)}
                  placeholder="Admin or organizer name"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 text-white py-3 font-bold shadow-lg hover:bg-orange-600 transition disabled:opacity-60"
              >
                {loading ? "Confirming attendance…" : "Confirm attendance"}
              </button>
            </form>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {result && result.booking && (
              <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 p-6">
                <p className="text-sm font-bold uppercase tracking-widest text-green-600">
                  Attendance confirmed
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-2xl bg-white border border-green-100 p-4">
                    <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                      Vendor name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {result.booking.vendorName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-green-100 p-4">
                    <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                      Stall number
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {result.booking.stallNumber}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-green-100 p-4">
                    <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                      Stall name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {result.booking.stallName}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white border border-green-100 p-4">
                    <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                      Event name
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {result.booking.eventName}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  Attendance time:{" "}
                  <span className="font-semibold text-slate-900">
                    {new Date(result.booking.attendanceConfirmedAt).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanAttendance;
