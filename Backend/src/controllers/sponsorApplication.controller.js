import SponsorApplication from "../models/SponsorApplication.js";
import SponsorshipPackage from "../models/SponsorshipPackage.js";
import SponsorRequest from "../models/SponsorRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create application from sponsor request data (organizer saves from dashboard)
export const createApplicationFromRequest = asyncHandler(async (req, res) => {
  const { companyName, email, eventName, packageName, sponsorRequestId } = req.body;

  // Check if application already exists
  const existingApp = await SponsorApplication.findOne({ email, eventName, packageName });
  if (existingApp) {
    return res.status(400).json({ message: "Application already exists" });
  }

  const app = await SponsorApplication.create({
    companyName,
    email,
    eventName,
    packageName,
    status: "Pending",
    sponsorRequestId,
  });

  res.status(201).json(app);
});

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

// Convert SponsorRequest to SponsorApplication
export const convertRequestToApplication = asyncHandler(async (req, res) => {
  const { sponsorRequestId } = req.body;

  const sponsorRequest = await SponsorRequest.findById(sponsorRequestId);
  if (!sponsorRequest) {
    return res.status(404).json({ message: "Sponsor request not found" });
  }

  // Check if application already exists for this request
  const existingApp = await SponsorApplication.findOne({
    sponsorId: sponsorRequest.sponsorId,
    eventId: sponsorRequest.eventId,
    packageId: sponsorRequest.packageId,
  });

  if (existingApp) {
    return res.status(400).json({ message: "Application already exists for this request" });
  }

  const app = await SponsorApplication.create({
    eventId: sponsorRequest.eventId,
    sponsorId: sponsorRequest.sponsorId,
    packageId: sponsorRequest.packageId,
    status: "Pending",
    noteFromSponsor: "",
  });

  res.status(201).json(app);
});

// Get all applications with details
export const getAllApplications = asyncHandler(async (req, res) => {
  const apps = await SponsorApplication.find()
    .populate("sponsorId", "name email")
    .populate("packageId", "name price")
    .populate("eventId", "name")
    .sort({ createdAt: -1 });

  res.json(apps);
});

export const approveApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decisionNote = "" } = req.body;

  const app = await SponsorApplication.findById(id);
  if (!app) return res.status(404).json({ message: "Application not found" });

  if (app.status !== "Pending") {
    return res.status(400).json({ message: `Cannot approve from status ${app.status}` });
  }

  app.status = "Accepted";
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

  if (app.status !== "Pending") {
    return res.status(400).json({ message: `Cannot reject from status ${app.status}` });
  }

  app.status = "Rejected";
  app.decisionBy = req.user._id;
  app.decisionNote = decisionNote;
  app.decisionAt = new Date();
  await app.save();

  res.json(app);
});

// Delete an application from MongoDB
export const deleteApplicationMongo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await SponsorApplication.findByIdAndDelete(id);
  if (!app) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json({ message: "Application deleted successfully", id: app._id });
});

// Update application status in MongoDB
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Accepted", "Pending", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const app = await SponsorApplication.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!app) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json(app);
});

// Delete an application
export const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await SponsorApplication.findByIdAndDelete(id);
  if (!app) {
    return res.status(404).json({ message: "Application not found" });
  }

  res.json({ message: "Application deleted successfully", id: app._id });
});
