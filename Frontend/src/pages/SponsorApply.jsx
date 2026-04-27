import { useEffect, useMemo, useState } from "react";
import { api, setDevRole } from "../api/client";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function Alert({ type = "info", children }) {
  const map = {
    info: "border-white/10 bg-white/5 text-white/80",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
  };
  return (
    <div className={`rounded-xl border p-3 text-sm ${map[type]}`}>{children}</div>
  );
}

export default function SponsorApply() {
  const eventId = "6995e6a180d2d1bd49640896";

  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [note, setNote] = useState("We would like to sponsor this event.");
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDevRole("sponsor");
    api
      .get(`/api/events/${eventId}/sponsor-packages?onlyActive=true`)
      .then((res) => setPackages(res.data))
      .catch((e) =>
        setStatus({
          type: "error",
          message: e?.response?.data?.message || "Failed to load packages",
        })
      );
  }, []);

  const selected = useMemo(
    () => packages.find((p) => p._id === selectedPackageId),
    [packages, selectedPackageId]
  );

  const submit = async () => {
    if (!selectedPackageId) {
      setStatus({ type: "error", message: "Please select a package before submitting." });
      return;
    }

    if (!note.trim()) {
      setStatus({ type: "error", message: "Please add a message or note before submitting." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Submitting..." });

    try {
      const res = await api.post(`/api/events/${eventId}/sponsorship-applications`, {
        packageId: selectedPackageId,
        noteFromSponsor: note.trim(),
      });

      localStorage.setItem("lastApplicationId", res.data._id);
      setStatus({
        type: "success",
        message: `Application submitted! ID: ${res.data._id}`,
      });
    } catch (e) {
      setStatus({
        type: "error",
        message: e?.response?.data?.message || e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Main card */}
      <div className="md:col-span-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Sponsor Application</h2>
              <p className="mt-1 text-sm text-white/60">
                Choose a sponsorship package and submit your request.
              </p>
            </div>
            <Badge>Role: Sponsor</Badge>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-white/70">Choose Package</label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-white/25"
              >
                <option value="">-- Select --</option>
                {packages.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (LKR {p.price})
                  </option>
                ))}
              </select>
            </div>

            {/* package preview */}
            <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
              <div className="text-xs text-white/60">Package Preview</div>
              {!selected ? (
                <div className="mt-2 text-sm text-white/70">
                  Select a package to view details.
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">{selected.name}</div>
                    <div className="text-sm text-white/80">
                      LKR <span className="font-bold">{selected.price}</span>
                    </div>
                  </div>
                  <ul className="mt-3 list-disc list-inside text-sm text-white/70 space-y-1">
                    {(selected.benefits || []).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-white/70">Message / Note</label>
              <textarea
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-white/25"
              />
            </div>

            <button
              onClick={submit}
              disabled={!selectedPackageId || loading}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>

            {status.message ? <Alert type={status.type}>{status.message}</Alert> : null}
          </div>
        </div>
      </div>

      {/* Side cards */}
      <div className="md:col-span-2 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-bold">Demo Flow</h3>
          <ol className="mt-3 space-y-2 text-sm text-white/70 list-decimal list-inside">
            <li>Select package</li>
            <li>Submit application</li>
            <li>Organizer approves</li>
            <li>Create payment</li>
            <li>Complete payment</li>
            <li>Open receipt PDF</li>
          </ol>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-bold">Next</h3>
          <p className="mt-2 text-sm text-white/70">
            After submit, go to Organizer Dashboard to approve and complete payment.
          </p>
          <a
            href="/organizer/dashboard"
            className="mt-4 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white/90 hover:bg-white/10"
          >
            Go to Organizer Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
