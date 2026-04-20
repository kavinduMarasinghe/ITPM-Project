import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import { getInvoicePdf, getReceiptPdf, getInvoiceByNumber } from "../controllers/invoice.controller.js";

const router = express.Router();

router.get("/payments/:paymentId/invoice", requireRole("organizer", "admin", "sponsor", "vendor"), getInvoicePdf);
router.get("/payments/:paymentId/receipt", requireRole("organizer", "admin", "sponsor", "vendor"), getReceiptPdf);
router.get("/invoices/:paymentId/pdf", requireRole("organizer", "admin", "sponsor", "vendor"), getInvoicePdf);
router.get("/invoices", getInvoiceByNumber);

export default router;
