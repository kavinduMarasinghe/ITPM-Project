import Payment from "../models/Payment.mjs";
import SponsorApplication from "../models/SponsorApplication.mjs";
import SponsorRequest from "../models/SponsorRequest.mjs";
import SponsorshipPackage from "../models/SponsorshipPackage.mjs";
import Counter from "../models/Counter.mjs";
import User from "../models/User.mjs";
import Event from "../models/Event.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";

async function getOrCreateFallbackEventId(eventName) {
  if (eventName) {
    const byName = await Event.findOne({ name: eventName });
    if (byName) return byName._id;
  }
  const any = await Event.findOne().sort({ createdAt: 1 });
  if (any) return any._id;
  const placeholder = await Event.create({ name: eventName || "EventAura" });
  return placeholder._id;
}

async function getOrCreateSponsorUser({ email, name }) {
  const normalizedEmail = (email || `sponsor-${Date.now()}@placeholder.local`).toLowerCase();
  const byEmail = await User.findOne({ email: normalizedEmail });
  if (byEmail) return byEmail;

  // Legacy User schema requires name/email/username/password and limits role enum,
  // so populate every required field for the placeholder.
  const usernameBase = normalizedEmail.split("@")[0].replace(/[^a-z0-9]/g, "") || "sponsor";
  const username = `${usernameBase}-${Date.now().toString(36)}`;

  return User.create({
    name: name || "Sponsor",
    email: normalizedEmail,
    username,
    password: "placeholder",
    role: "vendor",
  });
}

// TODO: Change this import to match Member 3 reservation model path/name
import Reservation from "../models/Reservation.mjs";

const makeTxnRef = () => `TXN-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

async function nextInvoiceNo() {
  const year = new Date().getFullYear();
  const key = `INV-${year}`;
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(doc.seq).padStart(5, "0");
  return `INV-${year}-${padded}`;
}

export const createPayment = asyncHandler(async (req, res) => {
  const { purpose, refId } = req.body;

  if (!["STALL", "SPONSORSHIP"].includes(purpose)) {
    return res.status(400).json({ message: "Invalid purpose" });
  }

  if (purpose === "STALL") {
    const reservation = await Reservation.findById(refId);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });

    // Basic rules: tweak to match Member 3 statuses
    if (reservation.status === "CANCELLED" || reservation.status === "EXPIRED") {
      return res.status(400).json({ message: "Reservation not payable" });
    }
    if (reservation.expiresAt && new Date(reservation.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Reservation expired" });
    }

    const vendor = await User.findById(reservation.vendorId);
    const payerName = vendor?.companyName || vendor?.name || "Unknown Vendor";

    const payment = await Payment.create({
      eventId: reservation.eventId,
      payerId: reservation.vendorId,
      payerName: payerName,
      purpose: "STALL",
      refType: "Reservation",
      refId: reservation._id,
      amount: reservation.price,
      transactionRef: makeTxnRef(),
      status: "PENDING",
      paymentDetails: {
        description: `Stall Fee`,
        referenceNumber: makeTxnRef(),
      },
    });

    return res.status(201).json(payment);
  }

  // SPONSORSHIP
  const app = await SponsorApplication.findById(refId);
  if (!app) return res.status(404).json({ message: "Sponsor application not found" });

  if (app.status !== "APPROVED") {
    return res.status(400).json({ message: "Application must be APPROVED before paying" });
  }

  const pkg = await SponsorshipPackage.findById(app.packageId);
  if (!pkg) return res.status(400).json({ message: "Package not found" });

  const sponsor = await User.findById(app.sponsorId);
  const payerName = sponsor?.companyName || sponsor?.name || "Unknown Sponsor";

  const payment = await Payment.create({
    eventId: app.eventId,
    payerId: app.sponsorId,
    payerName: payerName,
    purpose: "SPONSORSHIP",
    refType: "SponsorApplication",
    refId: app._id,
    amount: pkg.price,
    transactionRef: makeTxnRef(),
    status: "PENDING",
    paymentDetails: {
      description: `${pkg.name} Sponsorship`,
      referenceNumber: makeTxnRef(),
    },
  });

  res.status(201).json(payment);
});

export const completePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  if (payment.status !== "PENDING") {
    return res.status(400).json({ message: `Cannot complete from status ${payment.status}` });
  }

  payment.status = "COMPLETED";
  payment.paidAt = new Date();
  payment.invoiceNo = await nextInvoiceNo();
  await payment.save();

  if (payment.purpose === "STALL") {
    const reservation = await Reservation.findById(payment.refId);
    if (reservation) {
      // Adjust to match Member 3
      reservation.status = "PAID";
      reservation.paidAt = payment.paidAt;
      await reservation.save();
    }
  } else {
    await SponsorApplication.findById(payment.refId);
  }

  res.json(payment);
});

export const completePaymentBySponsorRequest = asyncHandler(async (req, res) => {
  const { sponsorRequestId } = req.params;

  const app = await SponsorApplication.findOne({ sponsorRequestId });
  if (!app) {
    return res.status(404).json({ message: "Sponsor application not found for this request" });
  }

  const payment = await Payment.findOne({
    refType: "SponsorApplication",
    refId: app._id,
  }).sort({ createdAt: -1 });

  if (!payment) {
    return res.status(404).json({ message: "Payment not found for this sponsor request" });
  }

  if (payment.status === "COMPLETED") {
    return res.json(payment);
  }

  if (payment.status !== "PENDING") {
    return res.status(400).json({ message: `Cannot complete from status ${payment.status}` });
  }

  if (!payment.eventId) {
    const sponsorRequest = await SponsorRequest.findById(sponsorRequestId);
    let fallbackEventId = sponsorRequest?.eventId;

    if (!fallbackEventId && app.packageName) {
      const pkg = await SponsorshipPackage.findOne({
        name: app.packageName,
        isActive: true,
      }).sort({ updatedAt: -1 });
      fallbackEventId = pkg?.eventId;
    }

    if (!fallbackEventId) {
      fallbackEventId = await getOrCreateFallbackEventId(
        sponsorRequest?.eventName || app.eventName
      );
    }

    payment.eventId = fallbackEventId;
  }

  if (!payment.payerId || !payment.payerName) {
    const sponsorUser = await getOrCreateSponsorUser({
      email: app.email,
      name: app.companyName,
    });
    payment.payerId = payment.payerId || sponsorUser._id;
    payment.payerName = payment.payerName || app.companyName || sponsorUser.name || "Sponsor";
  }

  payment.status = "COMPLETED";
  payment.paidAt = new Date();
  if (!payment.invoiceNo) {
    payment.invoiceNo = await nextInvoiceNo();
  }
  await payment.save();

  res.json(payment);
});


export const failPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  if (payment.status !== "PENDING") {
    return res.status(400).json({ message: `Cannot fail from status ${payment.status}` });
  }

  payment.status = "FAILED";
  await payment.save();

  res.json(payment);
});

export const listPayments = asyncHandler(async (req, res) => {
  const { eventId, purpose, status } = req.query;

  const q = {};
  if (eventId) q.eventId = eventId;
  if (purpose) q.purpose = purpose;
  if (status) q.status = status;

  const payments = await Payment.find(q)
    .populate("payerId", "name email role")
    .populate("eventId", "name title")
    .sort({ createdAt: -1 });

  res.json(payments);
});

export const listMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ payerId: req.user._id }).sort({ createdAt: -1 });
  res.json(payments);
});

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  
  console.log("=== DELETE PAYMENT (HARD DELETE) ===");
  console.log("Payment ID:", paymentId);
  console.log("User:", req.user);

  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    console.log("Payment NOT FOUND in database");
    return res.status(404).json({ message: "Payment not found" });
  }

  console.log("Payment FOUND, permanently deleting");

  // Hard delete - permanently remove from database
  await Payment.findByIdAndDelete(paymentId);

  console.log("Payment PERMANENTLY DELETED from database");
  console.log("=== DELETE PAYMENT COMPLETE ===");
  res.json({ 
    message: "Payment permanently deleted successfully", 
    paymentId
  });
});

export const hardDeletePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  // Only admins can hard delete
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can permanently delete payments" });
  }

  await Payment.findByIdAndDelete(paymentId);

  res.json({ message: "Payment permanently deleted" });
});
