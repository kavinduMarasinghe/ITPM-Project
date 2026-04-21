import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import {
  submitApplication,
  listApplicationsByEvent,
  listMyApplications,
  approveApplication,
  rejectApplication,
  convertRequestToApplication,
  getAllApplications,
  deleteApplication,
  createApplicationFromRequest,
  updateApplicationStatus,
  deleteApplicationMongo,
} from "../controllers/sponsorApplication.controller.js";

const router = express.Router();

// Simple endpoints for dashboard applications
router.post("/sponsorship-applications/from-request", requireRole("organizer", "admin"), createApplicationFromRequest);
router.get("/sponsorship-applications", requireRole("organizer", "admin"), getAllApplications);
router.patch("/sponsorship-applications/:id/status", requireRole("organizer", "admin"), updateApplicationStatus);
router.delete("/sponsorship-applications/:id", requireRole("organizer", "admin"), deleteApplicationMongo);

// Complex endpoints for full application flow
router.post("/events/:eventId/sponsorship-applications", requireRole("sponsor"), submitApplication);
router.get("/events/:eventId/sponsorship-applications", requireRole("organizer", "admin"), listApplicationsByEvent);
router.get("/my/sponsorship-applications", requireRole("sponsor"), listMyApplications);
router.post("/sponsorship-applications/convert-request", requireRole("organizer", "admin"), convertRequestToApplication);

router.patch("/sponsorship-applications/:id/approve", requireRole("organizer", "admin"), approveApplication);
router.patch("/sponsorship-applications/:id/reject", requireRole("organizer", "admin"), rejectApplication);

export default router;
