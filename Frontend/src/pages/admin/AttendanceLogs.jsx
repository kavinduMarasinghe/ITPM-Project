import React, { useEffect, useState } from "react";
import api from "../../api";

const getScanUrl = (token) => {
  if (!token) return "";
  return `${window.location.origin}/admin/attendance/scan/${token}`;
};

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/logs");
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setLogs(list);
      setFilteredLogs(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter((item) =>
      [
        item.vendorName,
        item.vendorEmail,
        item.stallName,
        item.stallNumber,
        item.eventName,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(keyword))
    );

    setFilteredLogs(filtered);
  }, [search, logs]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500 px-8 py-8 text-white">
            <h1 className="text-3xl font-semibold tracking-tight">Attendance Logs</h1>
            <p className="mt-2 text-sm text-slate-200">
              View scanned vendor attendance records for event day check-in.
            </p>
          </div>

          <div className="p-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Vendor Attendance Records
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Search by vendor name, email, stall, or event name.
                </p>
              </div>

              <input
                type="text"
                placeholder="Search attendance logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-80 rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 shadow-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {loading && (
              <div className="py-12 text-center">
                <p className="text-slate-600 font-medium">Loading attendance logs...</p>
              </div>
            )}

            {error && !loading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            )}

            {!loading && !error && filteredLogs.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600 font-medium">
                  No attendance logs found.
                </p>
              </div>
            )}

            {!loading && !error && filteredLogs.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Vendor
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Email
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Stall
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Event
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Payment
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Attendance
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        Checked In At
                      </th>
                      <th className="px-5 py-4 text-left text-sm font-semibold uppercase tracking-wider text-slate-600">
                        QR Token
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredLogs.map((item) => (
                      <tr key={item._id} className="hover:bg-orange-50/40 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{item.vendorName}</p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.vendorEmail || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {item.stallName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.stallNumber}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.eventName}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                              item.advancePaid
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {item.advancePaid ? "Advance Paid" : "Not Paid"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                              item.attendanceConfirmed
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {item.attendanceConfirmed ? "Present" : "Pending"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.attendanceConfirmedAt
                            ? new Date(item.attendanceConfirmedAt).toLocaleString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.barcodeToken ? (
                            <a
                              href={getScanUrl(item.barcodeToken)}
                              className="font-mono text-xs text-orange-700 underline underline-offset-2"
                              title="Open admin scan URL for this token"
                            >
                              {item.barcodeToken.slice(0, 8)}...{item.barcodeToken.slice(-6)}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-100 p-5">
                  <p className="text-sm uppercase tracking-widest text-slate-500 font-bold">
                    Total Records
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {logs.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-5 border border-green-100">
                  <p className="text-sm uppercase tracking-widest text-green-700 font-bold">
                    Checked In
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-green-700">
                    {logs.filter((item) => item.attendanceConfirmed).length}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-5 border border-amber-100">
                  <p className="text-sm uppercase tracking-widest text-amber-700 font-bold">
                    Pending
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-amber-700">
                    {logs.filter((item) => !item.attendanceConfirmed).length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLogs;