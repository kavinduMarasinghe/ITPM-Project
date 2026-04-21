import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Import models
import SponsorRequest from "../src/models/SponsorRequest.js";
import SponsorApplication from "../src/models/SponsorApplication.js";
import SponsorshipPackage from "../src/models/SponsorshipPackage.js";
import User from "../src/models/User.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
};

const migrateSponsorRequests = async () => {
  try {
    // Get all sponsor requests
    const requests = await SponsorRequest.find();
    console.log(`📋 Found ${requests.length} sponsor requests to migrate`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const req of requests) {
      try {
        // Find package by name
        const pkg = await SponsorshipPackage.findOne({ name: req.packageName });
        if (!pkg) {
          console.log(`⚠️  Warning: Package "${req.packageName}" not found for ${req.companyName}`);
          failed++;
          continue;
        }

        // Find or create sponsor user
        let sponsor = await User.findOne({ email: req.email });
        if (!sponsor) {
          sponsor = await User.create({
            name: req.companyName,
            email: req.email,
            role: "sponsor",
            password: "default123", // Temporary password
          });
          console.log(`👤 Created sponsor user for ${req.companyName}`);
        }

        // Check if application already exists
        const existingApp = await SponsorApplication.findOne({
          sponsorId: sponsor._id,
          eventId: req.eventId,
          packageId: pkg._id,
        });

        if (existingApp) {
          skipped++;
          console.log(`⏭️  Skipped: Application already exists for ${req.companyName}`);
          continue;
        }

        // Create new application from request
        const application = await SponsorApplication.create({
          eventId: req.eventId,
          sponsorId: sponsor._id,
          packageId: pkg._id,
          status: "Pending", // Default status
          noteFromSponsor: "",
        });

        created++;
        console.log(`✅ Created: Application for ${req.companyName}`);
      } catch (error) {
        console.error(`❌ Error processing ${req.companyName}:`, error.message);
        failed++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Created: ${created} applications`);
    console.log(`   Skipped: ${skipped} (already exist)`);
    console.log(`   Failed: ${failed} (errors)`);
    console.log(`   Total: ${requests.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
};

const main = async () => {
  await connectDB();
  await migrateSponsorRequests();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
};

main();
