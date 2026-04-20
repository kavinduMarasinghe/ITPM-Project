import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

import sponsorshipPackageRoutes from "./routes/sponsorshipPackage.routes.js";
import sponsorApplicationRoutes from "./routes/sponsorApplication.routes.js";
import sponsorRequestRoutes from "./routes/sponsorRequest.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reportRoutes from "./routes/report.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// TODO: replace with your real auth middleware that sets req.user
import { auth } from "./middleware/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// Test email endpoint
app.post("/api/test-email", async (req, res) => {
  const { to, subject, body } = req.body;

  if (!to) {
    return res.status(400).json({ message: "Email recipient required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject || "Test Email from EVENTAURA",
      html: body || `<h1>Test Email</h1><p>This is a test email from EVENTAURA backend. If you received this, email is working correctly!</p>`,
    });

    res.status(200).json({
      message: "Test email sent successfully",
      details: result,
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      message: "Failed to send test email",
      error: error.message,
    });
  }
});

app.use(auth);

app.use("/api", sponsorshipPackageRoutes);
app.use("/api", sponsorApplicationRoutes);
app.use("/api", sponsorRequestRoutes);
app.use("/api", paymentRoutes);
app.use("/api", reportRoutes);
app.use("/api", invoiceRoutes);

app.use(errorHandler);

export default app;
