import mongoose from "mongoose";
import dotenv from "dotenv";
import SponsorshipPackage from "../src/models/SponsorshipPackage.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

const seedPackages = async () => {
  try {
    // You can replace this with your actual event ID from the database
    // For now, we'll use a placeholder eventId
    const eventId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const packages = [
      {
        eventId,
        name: "Gold",
        price: 200000,
        benefits: [
          "Main stage banner placement",
          "Logo on all event materials & social media",
          "VIP booth in the Premium Zone",
          "MC mention during the event",
          "Exclusive networking sessions"
        ],
        isActive: true,
        createdBy: userId
      },
      {
        eventId,
        name: "Silver",
        price: 100000,
        benefits: [
          "Side banner placement on main concourse",
          "Logo on the official event poster",
          "Standard booth in the exhibition area",
          "Two social media shoutouts",
          "Recognition in event materials"
        ],
        isActive: true,
        createdBy: userId
      },
      {
        eventId,
        name: "Bronze",
        price: 50000,
        benefits: [
          "Logo on the event website",
          "Basic booth placement",
          "One social media mention",
          "Listing in event materials",
          "Digital recognition certificate"
        ],
        isActive: true,
        createdBy: userId
      }
    ];

    // Check if packages already exist
    const existingPackages = await SponsorshipPackage.find({ eventId });
    if (existingPackages.length > 0) {
      console.log("⚠️  Packages already exist for this event");
      console.log("Existing packages:", existingPackages.map(p => p.name));
      
      // Delete and recreate
      await SponsorshipPackage.deleteMany({ eventId });
      console.log("✅ Deleted existing packages");
    }

    // Create packages
    const created = await SponsorshipPackage.insertMany(packages);
    console.log("✅ Sponsorship packages created successfully!");
    console.log("📦 Packages created:");
    created.forEach(pkg => {
      console.log(`   - ${pkg.name}: LKR ${pkg.price.toLocaleString()}`);
      console.log(`     Benefits: ${pkg.benefits.length} items`);
    });
    console.log(`\n📊 Total packages: ${created.length}`);
    console.log(`🆔 Event ID: ${eventId}`);
  } catch (error) {
    console.error("❌ Error seeding packages:", error);
  } finally {
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  }
};

// Run the seed
connectDB().then(() => seedPackages());
