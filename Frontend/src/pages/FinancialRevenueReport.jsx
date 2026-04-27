import { useState } from "react";
import { apiFetch } from "../api/http";

export default function OrganizerRevenueReport({ eventId, token }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setErr("");
    const q = new URLSearchParams();
    if (from) q.set("from", from);
    if (to) q.set("to", to);

    const r = await apiFetch(`/api/reports/events/${eventId}/revenue?${q.toString()}`, { token });
    setData(r);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Revenue Report</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div>
        <label>From:</label>{" "}
        <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="YYYY-MM-DD" />
        {" "}
        <label>To:</label>{" "}
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="YYYY-MM-DD" />
        {" "}
        <button onClick={load}>Load</button>
      </div>

      {data && (
        <>
          <hr />
          <p>Stall Revenue: {data.stallRevenue}</p>
          <p>Sponsor Revenue: {data.sponsorRevenue}</p>
          <p>Total: {data.totalRevenue}</p>

          <h3>Sponsor by Package</h3>
          <ul>
            {data.sponsorByPackage.map((x, i) => (
              <li key={i}>{x.package}: {x.total}</li>
            ))}
          </ul>

          <h3>By Day</h3>
          <ul>
            {data.byDay.map((x, i) => (
              <li key={i}>{x.date}: {x.total}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
