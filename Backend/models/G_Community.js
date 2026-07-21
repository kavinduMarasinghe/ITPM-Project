const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["sports", "technology", "cultural", "community", "music", "academic", "other"],
      required: true,
    },
    members: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);