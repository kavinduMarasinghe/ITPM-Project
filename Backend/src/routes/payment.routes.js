import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import { getPaymentById } from "../controllers/payment.controller.js";
import {
  createPayment,
  completePayment,
  failPayment,
  listPayments,
  listMyPayments,
} from "../controllers/payment.controller.js";


const router = express.Router();

router.post("/payments/create", requireRole("sponsor", "vendor", "admin", "organizer"), createPayment);
router.post("/payments/:paymentId/complete", requireRole("sponsor", "vendor", "admin", "organizer"), completePayment);
router.post("/payments/:paymentId/fail", requireRole("sponsor", "vendor", "admin", "organizer"), failPayment);

router.get("/payments/:id", getPaymentById);
router.get("/payments", requireRole("organizer", "admin"), listPayments);
router.get("/my/payments", requireRole("sponsor", "vendor"), listMyPayments);

export default router;
