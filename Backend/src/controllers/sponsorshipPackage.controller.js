import SponsorshipPackage from "../models/SponsorshipPackage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createPackage = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { name, price, benefits = [], isActive = true } = req.body;

  const pkg = await SponsorshipPackage.create({
    eventId,
    name,
    price,
    benefits,
    isActive,
    createdBy: req.user._id,
  });

  res.status(201).json(pkg);
});

export const listPackagesByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const onlyActive = req.query.onlyActive === "true";

  const q = { eventId };
  if (onlyActive) q.isActive = true;

  const pkgs = await SponsorshipPackage.find(q).sort({ price: -1 });
  res.json(pkgs);
});

export const updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ["name", "price", "benefits", "isActive"];

  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

  const pkg = await SponsorshipPackage.findByIdAndUpdate(id, patch, { new: true });
  if (!pkg) return res.status(404).json({ message: "Package not found" });

  res.json(pkg);
});

export const updatePackageByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const allowed = ["name", "price", "benefits", "isActive"];

  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

  // Find package by name and update
  const pkg = await SponsorshipPackage.findOneAndUpdate(
    { name: name },
    patch,
    { new: true }
  );
  if (!pkg) return res.status(404).json({ message: "Package not found" });

  res.json(pkg);
});

export const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pkg = await SponsorshipPackage.findByIdAndDelete(id);
  if (!pkg) return res.status(404).json({ message: "Package not found" });
  res.json({ message: "Deleted" });
});
