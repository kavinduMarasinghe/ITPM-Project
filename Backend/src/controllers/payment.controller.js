import Payment from "../models/Payment.js";
import SponsorApplication from "../models/SponsorApplication.js";
import SponsorshipPackage from "../models/SponsorshipPackage.js";
import Counter from "../models/Counter.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// TODO: Change this import to match Member 3 reservation model path/name
import Reservation from "../models/Reservation.js";

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

    const payment = await Payment.create({
      eventId: reservation.eventId,
      payerId: reservation.vendorId,
      purpose: "STALL",
      refType: "Reservation",
      refId: reservation._id,
      amount: reservation.price,
      transactionRef: makeTxnRef(),
      status: "PENDING",
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

  const payment = await Payment.create({
    eventId: app.eventId,
    payerId: app.sponsorId,
    purpose: "SPONSORSHIP",
    refType: "SponsorApplication",
    refId: app._id,
    amount: pkg.price,
    transactionRef: makeTxnRef(),
    status: "PENDING",
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
    const app = await SponsorApplication.findById(payment.refId);
    if (app) {
      app.status = "PAID";
      await app.save();
    }
  }

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
