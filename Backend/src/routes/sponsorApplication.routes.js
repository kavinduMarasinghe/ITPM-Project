import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import {
  submitApplication,
  listApplicationsByEvent,
  listMyApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/sponsorApplication.controller.js";

const router = express.Router();

router.post("/events/:eventId/sponsorship-applications", requireRole("sponsor"), submitApplication);
router.get("/events/:eventId/sponsorship-applications", requireRole("organizer", "admin"), listApplicationsByEvent);
router.get("/my/sponsorship-applications", requireRole("sponsor"), listMyApplications);

router.patch("/sponsorship-applications/:id/approve", requireRole("organizer", "admin"), approveApplication);
router.patch("/sponsorship-applications/:id/reject", requireRole("organizer", "admin"), rejectApplication);

export default router;
