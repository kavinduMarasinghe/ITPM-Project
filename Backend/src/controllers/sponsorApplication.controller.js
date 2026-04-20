import SponsorApplication from "../models/SponsorApplication.js";
import SponsorshipPackage from "../models/SponsorshipPackage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const submitApplication = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { packageId, noteFromSponsor = "" } = req.body;

  const pkg = await SponsorshipPackage.findOne({ _id: packageId, eventId, isActive: true });
  if (!pkg) return res.status(400).json({ message: "Invalid/Inactive package for this event" });

  const app = await SponsorApplication.create({
    eventId,
    sponsorId: req.user._id,
    packageId,
    noteFromSponsor,
  });

  res.status(201).json(app);
});

export const listApplicationsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const apps = await SponsorApplication.find({ eventId })
    .populate("sponsorId", "name email role")
    .populate("packageId", "name price")
    .sort({ createdAt: -1 });

  res.json(apps);
});

export const listMyApplications = asyncHandler(async (req, res) => {
  const apps = await SponsorApplication.find({ sponsorId: req.user._id })
    .populate("packageId", "name price eventId")
    .sort({ createdAt: -1 });

  res.json(apps);
});

export const approveApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decisionNote = "" } = req.body;

  const app = await SponsorApplication.findById(id);
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (app.status !== "SUBMITTED") {
    return res.status(400).json({ message: `Cannot approve from status ${app.status}` });
  }

  app.status = "APPROVED";
  app.decisionBy = req.user._id;
  app.decisionNote = decisionNote;
  app.decisionAt = new Date();
  await app.save();

  res.json(app);
});

export const rejectApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decisionNote = "" } = req.body;

  const app = await SponsorApplication.findById(id);
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (app.status !== "SUBMITTED") {
    return res.status(400).json({ message: `Cannot reject from status ${app.status}` });
  }

  app.status = "REJECTED";
  app.decisionBy = req.user._id;
  app.decisionNote = decisionNote;
  app.decisionAt = new Date();
  await app.save();

  res.json(app);
});
