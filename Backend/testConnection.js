require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
console.log("🔍 Attempting to connect with URI:", uri ? uri.replace(/:([^@]+)@/, ":****@") : "❌ MONGODB_URI is undefined!");

if (!uri) {
  console.error("❌ MONGODB_URI is not set in .env file. Check your Backend/.env file exists.");
  process.exit(1);
}

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    console.log("   DB Name:", mongoose.connection.name);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection Failed:", err.message);
    if (err.message.includes("IP")) {
      console.log("👉 Fix: Whitelist your IP in MongoDB Atlas > Network Access");
    } else if (err.message.includes("Authentication")) {
      console.log("👉 Fix: Check your username/password in MONGO_URI");
    } else if (err.message.includes("ENOTFOUND")) {
      console.log("👉 Fix: Check your cluster hostname in MONGO_URI");
    } else if (err.message.includes("ReplicaSetNoPrimary") || err.message.includes("Could not connect")) {
      console.log("👉 Most likely cause: Your Atlas cluster is PAUSED.");
      console.log("   Go to cloud.mongodb.com → Database → Click 'Resume' on your cluster.");
    }
    process.exit(1);
  });
