import express from "express";
import { requireRole } from "../middleware/requireRole.mjs";
import { eventRevenueReport } from "../controllers/report.controller.mjs";

const router = express.Router();

router.get("/reports/events/:eventId/revenue", requireRole("organizer", "admin"), eventRevenueReport);

export default router;
