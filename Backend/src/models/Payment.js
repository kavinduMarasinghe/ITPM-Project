import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    payerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    purpose: { type: String, enum: ["STALL", "SPONSORSHIP"], required: true, index: true },
    refType: { type: String, enum: ["Reservation", "SponsorApplication"], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "LKR" },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    method: { type: String, default: "SIMULATED" },
    transactionRef: { type: String, required: true, index: true },

    invoiceNo: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

PaymentSchema.index(
  { refId: 1, purpose: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "COMPLETED" } }
);

export default mongoose.model("Payment", PaymentSchema);
