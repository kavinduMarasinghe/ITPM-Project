import Payment from "../models/Payment.mjs";
import SponsorApplication from "../models/SponsorApplication.mjs";
import SponsorshipPackage from "../models/SponsorshipPackage.mjs";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import mongoose from "mongoose";

export const eventRevenueReport = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { from, to } = req.query;

  const match = {
    eventId: new mongoose.Types.ObjectId(eventId),
    status: "COMPLETED",
  };

  if (from || to) {
    match.paidAt = {};
    if (from) match.paidAt.$gte = new Date(from);
    if (to) match.paidAt.$lte = new Date(to);
  }

  const totals = await Payment.aggregate([
    { $match: match },
    { $group: { _id: "$purpose", total: { $sum: "$amount" } } },
  ]);

  const stallRevenue = totals.find(t => t._id === "STALL")?.total || 0;
  const sponsorRevenue = totals.find(t => t._id === "SPONSORSHIP")?.total || 0;

  const byDay = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        total: { $sum: "$amount" },
      },
    },
    { $project: { _id: 0, date: "$_id", total: 1 } },
    { $sort: { date: 1 } },
  ]);

  const sponsorPayments = await Payment.find({ ...match, purpose: "SPONSORSHIP" }).select("refId amount");
  const appIds = sponsorPayments.map(p => p.refId);

  const apps = await SponsorApplication.find({ _id: { $in: appIds } }).select("_id packageId");
  const pkgIds = [...new Set(apps.map(a => String(a.packageId)))];
  const pkgs = await SponsorshipPackage.find({ _id: { $in: pkgIds } }).select("_id name");

  const pkgNameById = Object.fromEntries(pkgs.map(p => [String(p._id), p.name]));
  const appPkgByAppId = Object.fromEntries(apps.map(a => [String(a._id), String(a.packageId)]));

  const sponsorByPackageMap = {};
  for (const p of sponsorPayments) {
    const pkgId = appPkgByAppId[String(p.refId)];
    const pkgName = pkgNameById[pkgId] || "Unknown";
    sponsorByPackageMap[pkgName] = (sponsorByPackageMap[pkgName] || 0) + p.amount;
  }
  const sponsorByPackage = Object.entries(sponsorByPackageMap).map(([pkg, total]) => ({ package: pkg, total }));

  res.json({
    stallRevenue,
    sponsorRevenue,
    totalRevenue: stallRevenue + sponsorRevenue,
    byDay,
    sponsorByPackage,
  });
});
