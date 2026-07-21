import { useEffect, useState } from "react";
import { apiFetch } from "../api/http";

export default function SponsorSponsorshipApply({ eventId, token }) {
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [note, setNote] = useState("");
  const [app, setApp] = useState(null);
  const [payment, setPayment] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    apiFetch(`/api/events/${eventId}/sponsor-packages?onlyActive=true`)
      .then(setPackages)
      .catch((e) => setStatus({ type: "error", message: e.message || "Failed to load packages" }));
  }, [eventId]);

  const submit = async () => {
    setErr("");
    const created = await apiFetch(`/api/events/${eventId}/sponsorship-applications`, {
      method: "POST",
      token,
      body: { packageId, noteFromSponsor: note },
    });
    setApp(created);
  };

  const createPayment = async () => {
    setErr("");
    const p = await apiFetch(`/api/payments/create`, {
      method: "POST",
      token,
      body: { purpose: "SPONSORSHIP", refId: app._id },
    });
    setPayment(p);
  };

  const completePayment = async () => {
    setErr("");
    const done = await apiFetch(`/api/payments/${payment._id}/complete`, { method: "POST", token });
    setPayment(done);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Sponsorship Apply</h2>
      {status.message && (
        <div
          style={{
            marginBottom: 8,
            padding: 8,
            borderRadius: 8,
            border: "1px solid",
            borderColor: status.type === "error" ? "#f87171" : "#34d399",
            background: status.type === "error" ? "#fdf2f2" : "#ecfdf5",
            color: status.type === "error" ? "#991b1b" : "#065f46",
          }}
        >
          {status.message}
        </div>
      )}

      <div>
        <label>Package:</label>{" "}
        <select value={packageId} onChange={(e) => setPackageId(e.target.value)}>
          <option value="">Select</option>
          {packages.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - {p.price} LKR
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Note:</label><br/>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} cols={50} />
      </div>

      <button style={{ marginTop: 8 }} disabled={!packageId} onClick={submit}>
        Submit Application
      </button>

      {app && (
        <>
          <hr />
          <p>Application Status: {app.status}</p>
          <p>Application ID: {app._id}</p>

          <p style={{ fontSize: 12 }}>
            Payment allowed only after Organizer approves. (Backend enforces this.)
          </p>

          <button onClick={createPayment}>Create Payment (after approval)</button>

          {payment && (
            <>
              <p>Payment Status: {payment.status}</p>
              <button onClick={completePayment}>Simulate Complete</button>

              {payment.status === "COMPLETED" && (
                <div>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/api/payments/${payment._id}/receipt`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Receipt (PDF)
                  </a>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
