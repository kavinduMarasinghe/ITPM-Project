import mongoose from "mongoose";

const SponsorshipPackageSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true, trim: true }, // Gold/Silver/Bronze...
    price: { type: Number, required: true, min: 0 },
    benefits: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

SponsorshipPackageSchema.index({ eventId: 1, name: 1 }, { unique: true });

export default mongoose.model("SponsorshipPackage", SponsorshipPackageSchema);
