const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

async function migrate() {
    try {
        console.log("Connecting to MongoDB...");
        const uri = env.MONGO_URI || env.MONGODB_URI || "mongodb://localhost:27017/stall-management";
        await mongoose.connect(uri);
        console.log("Connected.");

        const db = mongoose.connection.db;
        const collection = db.collection('stalls');

        console.log("Running native bulk migration...");

        // Migrate stallType
        await collection.updateMany({ stallType: "Food" }, { $set: { stallType: "Food Stall" } });
        await collection.updateMany({ stallType: "Sponsor" }, { $set: { stallType: "Sponsor Booth" } });
        await collection.updateMany({ stallType: "Game" }, { $set: { stallType: "Game Stall" } });
        await collection.updateMany({ stallType: "Retail" }, { $set: { stallType: "Retail Stall" } });

        // Migrate status (case sensitivity check)
        await collection.updateMany({ status: "available" }, { $set: { status: "Available" } });
        await collection.updateMany({ status: "reserved" }, { $set: { status: "Reserved" } });
        await collection.updateMany({ status: "booked" }, { $set: { status: "Booked" } });

        // Migrate size (ensure standard casing)
        await collection.updateMany({ size: "small" }, { $set: { size: "Small" } });
        await collection.updateMany({ size: "medium" }, { $set: { size: "Medium" } });
        await collection.updateMany({ size: "large" }, { $set: { size: "Large" } });

        console.log("Migration complete.");
        
        const Stall = require('./models/stallModel');
        const stalls = await Stall.find();
        console.log(`Verified with Mongoose: Successfully fetched ${stalls.length} stalls.`);
        stalls.forEach(s => {
            console.log(`- ${s.stallName}: [Type: ${s.stallType}] [Status: ${s.status}] [Size: ${s.size}]`);
        });

        process.exit(0);
    } catch (err) {
        console.error("CRITICAL ERROR DURING NATIVE MIGRATION:");
        console.error(err);
        process.exit(1);
    }
}

migrate();
