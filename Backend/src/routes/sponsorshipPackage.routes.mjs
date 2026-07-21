import express from "express";
import { requireRole } from "../middleware/requireRole.mjs";
import {
  createPackage,
  listPackagesByEvent,
  updatePackage,
  updatePackageByName,
  deletePackage,
} from "../controllers/sponsorshipPackage.controller.mjs";

const router = express.Router();

router.get("/events/:eventId/sponsor-packages", listPackagesByEvent);
router.post("/events/:eventId/sponsor-packages", requireRole("organizer", "admin"), createPackage);
router.patch("/sponsor-packages/:id", requireRole("organizer", "admin"), updatePackage);
router.patch("/sponsor-packages/by-name/:name", requireRole("organizer", "admin"), updatePackageByName);
router.delete("/sponsor-packages/:id", requireRole("organizer", "admin"), deletePackage);

export default router;
