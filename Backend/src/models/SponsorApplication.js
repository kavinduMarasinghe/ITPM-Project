import mongoose from "mongoose";

const SponsorApplicationSchema = new mongoose.Schema(
  {
    // Simple fields for dashboard applications
    companyName: { type: String },
    email: { type: String },
    eventName: { type: String },
    packageName: { type: String },
    amount: { type: Number, default: null },
    sponsorRequestId: { type: String },

    // Reference fields (optional, for future use)
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "SponsorshipPackage" },

    status: {
      type: String,
      enum: ["Accepted", "Pending", "Rejected"],
      default: "Pending",
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
