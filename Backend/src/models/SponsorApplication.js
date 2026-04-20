import mongoose from "mongoose";

const SponsorApplicationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "SponsorshipPackage", required: true },

    status: {
      type: String,
      enum: ["SUBMITTED", "APPROVED", "REJECTED", "PAID", "CANCELLED"],
      default: "SUBMITTED",
      index: true,
    },

    noteFromSponsor: { type: String, default: "" },

    decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decisionNote: { type: String, default: "" },
    decisionAt: { type: Date },
  },
  { timestamps: true }
);

SponsorApplicationSchema.index({ eventId: 1, sponsorId: 1 }, { unique: false });

export default mongoose.model("SponsorApplication", SponsorApplicationSchema);
