import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import { eventRevenueReport } from "../controllers/report.controller.js";

const router = express.Router();

router.get("/reports/events/:eventId/revenue", requireRole("organizer", "admin"), eventRevenueReport);

export default router;
