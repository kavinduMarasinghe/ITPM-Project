import { useEffect, useState } from "react";
import { api, setDevRole } from "../api/client";

export default function OrganizerApproveAndPay() {
  useEffect(() => {
    setDevRole("admin");
  }, []);

  const [applicationId, setApplicationId] = useState(localStorage.getItem("lastApplicationId") || "");
  const [paymentId, setPaymentId] = useState(localStorage.getItem("lastPaymentId") || "");
  const [log, setLog] = useState("");

  const approve = async () => {
    setLog("Approving...");
    try {
      const res = await api.patch(`/api/sponsorship-applications/${applicationId}/approve`, {
        decisionNote: "Approved",
      });
      setLog(`✅ Approved. Status: ${res.data.status}`);
    } catch (e) {
      setLog(`❌ Approve failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const createPayment = async () => {
    setLog("Creating payment...");
    try {
      const res = await api.post(`/api/payments/create`, {
        purpose: "SPONSORSHIP",
        refId: applicationId,
      });
      setPaymentId(res.data._id);
      localStorage.setItem("lastPaymentId", res.data._id);
      setLog(`✅ Payment created. Payment ID: ${res.data._id} (status: ${res.data.status})`);
    } catch (e) {
      setLog(`❌ Create payment failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const completePayment = async () => {
    setLog("Completing payment...");
    try {
      await api.post(`/api/payments/${paymentId}/complete`);
      setLog("✅ Payment completed");
    } catch (e) {
      setLog(`❌ Complete failed: ${e?.response?.data?.message || e.message}`);
    }
  };

  const openReceipt = () => {
    window.open(`${import.meta.env.VITE_API_URL}/api/payments/${paymentId}/receipt`, "_blank");
  };

  return (
    <div style={{ padding: 24, maxWidth: 700 }}>
      <h2>Organizer Approve + Payment (Demo)</h2>

      <label>Application ID:</label>
      <input
        value={applicationId}
        onChange={(e) => setApplicationId(e.target.value)}
        style={{ display: "block", padding: 8, margin: "10px 0", width: "100%" }}
        placeholder="paste applicationId"
      />

      <button disabled={!applicationId} onClick={approve} style={{ padding: "10px 16px", marginRight: 10 }}>
        Approve
      </button>

      <button disabled={!applicationId} onClick={createPayment} style={{ padding: "10px 16px" }}>
        Create Payment
      </button>

      <hr style={{ margin: "16px 0" }} />

      <label>Payment ID:</label>
      <input
        value={paymentId}
        onChange={(e) => setPaymentId(e.target.value)}
        style={{ display: "block", padding: 8, margin: "10px 0", width: "100%" }}
        placeholder="paymentId will appear here"
      />

      <button disabled={!paymentId} onClick={completePayment} style={{ padding: "10px 16px", marginRight: 10 }}>
        Complete Payment
      </button>

      <button disabled={!paymentId} onClick={openReceipt} style={{ padding: "10px 16px" }}>
        Open Receipt PDF
      </button>

      <p style={{ marginTop: 12 }}>{log}</p>
    </div>
  );
}
