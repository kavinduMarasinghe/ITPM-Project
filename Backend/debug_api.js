const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Simple env loader
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function check() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = env.MONGO_URI || env.MONGODB_URI || "mongodb://localhost:27017/stall-management";
        await mongoose.connect(uri);
        console.log("Connected.");

        const Stall = require('./models/stallModel');
        const StallBooking = require('./models/stallBookingModel');

        console.log("Running releaseExpiredStalls logic...");
        const now = new Date();
        const expiredStalls = await Stall.find({
            status: "Reserved",
            reservedUntil: { $lt: now }
        });
        console.log(`Found ${expiredStalls.length} expired stalls.`);

        for (let stall of expiredStalls) {
            console.log(`Releasing stall: ${stall.stallName}`);
            stall.status = "Available";
            stall.reservedUntil = null;
            await stall.save();

            await StallBooking.updateMany(
                { stallId: stall._id, status: "Pending" },
                { $set: { status: "Rejected", notes: "System auto-cancelled: Reservation Expired." } }
            );
        }

        console.log("Fetching all stalls...");
        const stalls = await Stall.find();
        console.log(`Successfully fetched ${stalls.length} stalls.`);
        process.exit(0);
    } catch (err) {
        console.error("CRITICAL ERROR FOUND:");
        console.error(err);
        process.exit(1);
    }
}

check();
