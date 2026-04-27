import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
};

const migrateRequests = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get all sponsor requests
    const requests = await db.collection('sponsorrequests').find({}).toArray();
    console.log(`📋 Found ${requests.length} sponsor requests to migrate`);

    let created = 0;
    let skipped = 0;

    for (const req of requests) {
      try {
        // Check if application already exists
        const existing = await db.collection('sponsorapplications').findOne({
          email: req.email,
          eventName: req.eventName,
          packageName: req.packageName
        });

        if (existing) {
          skipped++;
          console.log(`⏭️  Skipped: Application already exists for ${req.companyName}`);
          continue;
        }

        // Create application from request
        const app = {
          companyName: req.companyName,
          email: req.email,
          eventName: req.eventName,
          packageName: req.packageName,
          sponsorRequestId: req._id.toString(),
          status: "Pending",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('sponsorapplications').insertOne(app);
        created++;
        console.log(`✅ Created: Application for ${req.companyName}`);
      } catch (error) {
        console.error(`❌ Error processing ${req.companyName}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Created: ${created} applications`);
    console.log(`   Skipped: ${skipped} (already exist)`);
    console.log(`   Total: ${requests.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  }
};

const main = async () => {
  await connectDB();
  await migrateRequests();
  await mongoose.connection.close();
  console.log("✅ Database connection closed");
};

main();
