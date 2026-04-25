const nodemailer = require("nodemailer");

let transporter;

/** Default inbox for attendance alerts (overridable via ADMIN_NOTIFY_EMAIL) */
const DEFAULT_ADMIN_NOTIFY = "biyunitharuka123@gmail.com";

function buildTransporter() {
  if (transporter) return transporter;

  // Gmail: create an App Password at https://myaccount.google.com/apppasswords (2FA on account required)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: String(process.env.GMAIL_APP_PASSWORD).replace(/\s/g, ""),
      },
    });
    return transporter;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || "",
      },
    });
    return transporter;
  }

  return null;
}

/**
 * Real-time email when admin scans a vendor QR (attendance).
 * Set GMAIL_USER + GMAIL_APP_PASSWORD in Backend/.env
 */
async function sendAttendanceScanEmail({ booking, scannedBy, scannedAt }) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || DEFAULT_ADMIN_NOTIFY;
  const t = buildTransporter();
  if (!t) {
    console.warn(
      "Attendance email skipped: set GMAIL_USER and GMAIL_APP_PASSWORD in .env (Gmail) or SMTP_* variables."
    );
    return { sent: false, reason: "transporter_not_configured" };
  }

  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
  if (!from) {
    return { sent: false, reason: "missing_from_address" };
  }

  const timeStr = new Date(scannedAt).toLocaleString();
  const subject = `✅ Stall check-in: ${booking.stallNumber} — ${booking.vendorName}`;

  const text = [
    `A vendor QR was scanned and attendance was marked.`,
    ``,
    `Vendor: ${booking.vendorName}`,
    booking.vendorEmail ? `Vendor email: ${booking.vendorEmail}` : null,
    `Stall: ${booking.stallName} (No. ${booking.stallNumber})`,
    `Event: ${booking.eventName}`,
    `Scanned by: ${scannedBy || "Admin"}`,
    `Time: ${timeStr}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
  <div style="font-family: system-ui, sans-serif; max-width: 520px; line-height: 1.5;">
    <h2 style="color:#0f172a;">Stall check-in (QR scan)</h2>
    <p style="color:#334155;">Attendance was <strong>confirmed</strong> when the organizer scanned this vendor&apos;s QR.</p>
    <table style="width:100%; border-collapse: collapse; font-size: 14px; color: #0f172a;">
      <tr><td style="padding:6px 0; color:#64748b;">Vendor</td><td><strong>${escapeHtml(booking.vendorName)}</strong></td></tr>
      ${booking.vendorEmail ? `<tr><td style="padding:6px 0; color:#64748b;">Vendor email</td><td>${escapeHtml(booking.vendorEmail)}</td></tr>` : ""}
      <tr><td style="padding:6px 0; color:#64748b;">Stall</td><td>${escapeHtml(booking.stallName)} (No. <strong>${escapeHtml(String(booking.stallNumber))}</strong>)</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Event</td><td>${escapeHtml(booking.eventName || "")}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Scanned by</td><td>${escapeHtml(scannedBy || "Admin")}</td></tr>
      <tr><td style="padding:6px 0; color:#64748b;">Time</td><td><strong>${escapeHtml(timeStr)}</strong></td></tr>
    </table>
  </div>`;

  try {
    await t.sendMail({ from, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("Gmail/ SMTP send failed:", err.message || err);
    return { sent: false, error: err.message || String(err) };
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { sendAttendanceScanEmail };
