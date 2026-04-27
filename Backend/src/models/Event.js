import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    title: { type: String, default: "" }, // some teams use title instead of name
  },
  { timestamps: true }
);

export default mongoose.model("Event", EventSchema);
