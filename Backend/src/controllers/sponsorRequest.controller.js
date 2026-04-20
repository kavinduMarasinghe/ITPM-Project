import SponsorRequest from "../models/SponsorRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing in .env");
  }

  const appPassword = String(process.env.EMAIL_PASS).replace(/\s+/g, "");

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: appPassword,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

const sendSponsorRequestEmail = async ({ to, subject, message, eventName, companyName, acceptLink, rejectLink }) => {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 20px; border-radius: 8px; color: white;">
        <h1 style="margin: 0;">Sponsorship Invitation</h1>
        <p style="margin: 5px 0 0 0;">EVENTAURA - ${eventName}</p>
      </div>

      <div style="padding: 30px; background: #f9fafb;">
        <p>Dear ${companyName} Team,</p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          ${message.split("\n").map(line => `<p style="margin: 10px 0;">${line}</p>`).join("")}
        </div>

        <p style="margin-top: 30px;">Please respond to this invitation:</p>

        <div style="display: flex; gap: 10px; margin: 20px 0;">
          <a href="${acceptLink}" style="
            padding: 12px 30px;
            background: #10b981;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">✓ Accept Sponsorship</a>

          <a href="${rejectLink}" style="
            padding: 12px 30px;
            background: #ef4444;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">✗ Decline Sponsorship</a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
          This is an automated email from EVENTAURA. Please do not reply directly to this email.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"EventAura Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// Send sponsor request
export const sendSponsorRequest = asyncHandler(async (req, res) => {
  const { companyName, email, eventName, eventId, packageName, subject, message } = req.body;

  if (!companyName || !email || !eventName || !packageName || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Validate company name - no special characters like @, #, ?, "
  const companyNameRegex = /^[a-zA-Z0-9\s\-\.]+$/;
  if (!companyNameRegex.test(companyName)) {
    return res.status(400).json({ 
      message: "Company name contains invalid characters. Only letters, numbers, spaces, hyphens (-), and dots (.) are allowed. Special characters like @, #, ?, \" are not permitted." 
    });
  }

  const normalizedMessage = String(message).trim();
  const normalizedSubject = String(subject).trim();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedCompany = String(companyName).trim().toLowerCase();
  const normalizedEvent = String(eventName).trim().toLowerCase();
  const normalizedPackage = String(packageName).trim().toLowerCase();

  const existingRequest = await SponsorRequest.findOne({
    companyName: new RegExp(`^${normalizedCompany}$`, "i"),
    email: normalizedEmail,
    eventName: new RegExp(`^${normalizedEvent}$`, "i"),
    packageName: new RegExp(`^${normalizedPackage}$`, "i"),
    subject: normalizedSubject,
    message: normalizedMessage,
  });

  const newRequest = existingRequest || new SponsorRequest({
    companyName: companyName.trim(),
    email: normalizedEmail,
    eventName: eventName.trim(),
    eventId,
    packageName: packageName.trim(),
    subject: normalizedSubject,
    message: normalizedMessage,
    createdBy: req.user?._id,
  });

  if (!existingRequest) {
    await newRequest.save();
  }

  // Generate accept/reject links
  const baseUrl = process.env.BACKEND_URL || "http://127.0.0.1:5001";
  const acceptLink = `${baseUrl}/api/sponsor-requests/${newRequest._id}/accept`;
  const rejectLink = `${baseUrl}/api/sponsor-requests/${newRequest._id}/reject`;

  try {
    await sendSponsorRequestEmail({
      to: email,
      subject,
      message,
      eventName,
      companyName,
      acceptLink,
      rejectLink,
    });

    res.status(201).json({
      message: "Sponsor request sent successfully",
      request: newRequest,
      emailRecipient: email,
    });
  } catch (error) {
    console.error("Send request error:", error.code || "UNKNOWN", error.message);
    res.status(500).json({
      message: `Request saved, but email failed: ${error.code || "ERROR"} - ${error.message}`,
      request: newRequest,
    });
  }
});

// Accept sponsor request
export const acceptSponsorRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await SponsorRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "accepted";
  request.respondedAt = new Date();
  await request.save();

  // Redirect to sponsor dashboard in the frontend
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5174";
  res.redirect(`${frontendUrl}/sponsor/dashboard/${id}`);
});

// Reject sponsor request
export const rejectSponsorRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await SponsorRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = "rejected";
  request.respondedAt = new Date();
  await request.save();

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sponsorship Declined</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .decline-icon {
          width: 80px;
          height: 80px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
          font-size: 40px;
        }
        h1 {
          color: #1f2937;
          margin: 0 0 10px 0;
        }
        p {
          color: #6b7280;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="decline-icon">✗</div>
        <h1>Sponsorship Declined</h1>
        <p>Your response has been recorded for <strong>${request.eventName}</strong>.</p>
        <p>We understand and appreciate your consideration.</p>
        <p style="margin-top: 30px; color: #8b5cf6;"><strong>EVENTAURA</strong></p>
      </div>
    </body>
    </html>
  `);
});

// Get all sponsor requests
export const getSponsorRequests = asyncHandler(async (req, res) => {
  const { eventId, status } = req.query;

  const query = {};
  if (eventId) query.eventId = eventId;
  if (status) query.status = status;

  const requests = await SponsorRequest.find(query).sort({ sentAt: -1 });

  const uniqueRequests = [];
  const seen = new Set();

  for (const request of requests) {
    const key = [
      String(request.companyName || "").trim().toLowerCase(),
      String(request.email || "").trim().toLowerCase(),
      String(request.eventName || "").trim().toLowerCase(),
      String(request.packageName || "").trim().toLowerCase(),
      String(request.subject || "").trim().toLowerCase(),
      String(request.message || "").trim().toLowerCase(),
    ].join("|");

    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRequests.push(request);
  }

  res.json(uniqueRequests);
});

// Get single sponsor request
export const getSponsorRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await SponsorRequest.findById(id);
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  res.json(request);
});
