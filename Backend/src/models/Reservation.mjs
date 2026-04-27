import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  price: Number,
  status: {
    type: String,
    enum: ["HELD", "PAID", "CANCELLED", "EXPIRED"],
    default: "HELD",
  },
  expiresAt: Date,
  paidAt: Date,
});

export default mongoose.model("Reservation", ReservationSchema);
