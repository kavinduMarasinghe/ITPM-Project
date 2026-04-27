import express from "express";
import { requireRole } from "../middleware/requireRole.js";
import {
  sendSponsorRequest,
  acceptSponsorRequest,
  rejectSponsorRequest,
  getSponsorRequests,
  getSponsorRequest,
  deleteSponsorRequest,
} from "../controllers/sponsorRequest.controller.js";

const router = express.Router();

// Send sponsor request (organizer/admin only)
router.post("/sponsor-requests", requireRole("organizer", "admin"), sendSponsorRequest);

// Accept/Reject (public - no auth needed for email links)
router.get("/sponsor-requests/:id/accept", acceptSponsorRequest);
router.get("/sponsor-requests/:id/reject", rejectSponsorRequest);

// Get requests (organizer/admin)
router.get("/sponsor-requests", requireRole("organizer", "admin"), getSponsorRequests);

// Get single request (sponsors can view their own request)
router.get("/sponsor-requests/:id", getSponsorRequest);

// Delete sponsor request (organizer/admin only)
router.delete("/sponsor-requests/:id", requireRole("organizer", "admin"), deleteSponsorRequest);

export default router;
