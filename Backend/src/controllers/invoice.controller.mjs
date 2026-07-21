import Payment from "../models/Payment.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import { buildPaymentPdf } from "../utils/invoicePdf.mjs";

// TODO: adjust imports to your actual Event/User model paths
import Event from "../models/Event.mjs";
import User from "../models/User.mjs";

export const getInvoicePdf = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  const event = await Event.findById(payment.eventId).select("name title");
  const payer = await User.findById(payment.payerId).select("name email");

  const items = [
    {
      description: payment.purpose === "STALL" ? "Stall Reservation Payment" : "Sponsorship Payment",
      qty: 1,
      unitPrice: payment.amount,
      total: payment.amount,
    },
  ];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${payment.invoiceNo || "invoice"}.pdf"`);

  const doc = buildPaymentPdf({ payment, event, payer, items, type: "INVOICE" });
  doc.pipe(res);
  doc.end();
});

export const getReceiptPdf = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(404).json({ message: "Payment not found" });
  if (payment.status !== "COMPLETED") {
    return res.status(400).json({ message: "Receipt available only for COMPLETED payments" });
  }

  const event = await Event.findById(payment.eventId).select("name title");
  const payer = await User.findById(payment.payerId).select("name email");

  const items = [
    {
      description: payment.purpose === "STALL" ? "Stall Reservation Payment" : "Sponsorship Payment",
      qty: 1,
      unitPrice: payment.amount,
      total: payment.amount,
    },
  ];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${payment.invoiceNo || "receipt"}.pdf"`);

  const doc = buildPaymentPdf({ payment, event, payer, items, type: "RECEIPT" });
  doc.pipe(res);
  doc.end();
});

export const getInvoiceByNumber = asyncHandler(async (req, res) => {
  const { invoiceNo } = req.query;

  if (!invoiceNo) {
    return res.status(400).json({ message: "Invoice number required" });
  }

  const payment = await Payment.findOne({ invoiceNo: invoiceNo });
  if (!payment) {
    return res.status(404).json({ message: "Invoice not found" });
  }

  res.json(payment);
});

