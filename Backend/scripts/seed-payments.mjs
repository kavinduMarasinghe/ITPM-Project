import mongoose from "mongoose";
import dotenv from "dotenv";
import Payment from "../src/models/Payment.js";

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

const seedPayments = async () => {
  try {
    // Clear existing payments
    await Payment.deleteMany({});
    console.log("🗑️  Cleared existing payments");

    const eventId = new mongoose.Types.ObjectId();
    
    // Sponsor payments
    const sponsorPayerId1 = new mongoose.Types.ObjectId();
    const sponsorPayerId2 = new mongoose.Types.ObjectId();
    const sponsorPayerId3 = new mongoose.Types.ObjectId();
    
    const sponsorAppId1 = new mongoose.Types.ObjectId();
    const sponsorAppId2 = new mongoose.Types.ObjectId();
    const sponsorAppId3 = new mongoose.Types.ObjectId();

    const payments = [
      // Gold Package - Already Paid
      {
        eventId,
        payerId: sponsorPayerId1,
        payerName: "TechCorp Sdn Bhd",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: sponsorAppId1,
        amount: 5000,
        currency: "LKR",
        status: "COMPLETED",
        method: "SIMULATED",
        transactionRef: "TXN-2025-001",
        invoiceNo: "INV-2025-00001",
        paidAt: new Date("2025-07-12T10:32:00"),
        paymentDetails: {
          description: "Gold Sponsorship Package - LKR 5,000",
          referenceNumber: "REF-2025-001"
        },
        createdAt: new Date("2025-07-12T10:32:00"),
        updatedAt: new Date("2025-07-12T10:32:00")
      },
      // Silver Package - Pending Payment
      {
        eventId,
        payerId: sponsorPayerId2,
        payerName: "Nexus Media Group",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: sponsorAppId2,
        amount: 2500,
        currency: "LKR",
        status: "PENDING",
        method: "SIMULATED",
        transactionRef: "TXN-2025-002",
        paymentDetails: {
          description: "Silver Sponsorship Package - LKR 2,500",
          referenceNumber: "REF-2025-002"
        },
        createdAt: new Date("2025-07-10T09:00:00"),
        updatedAt: new Date("2025-07-10T09:00:00")
      },
      // Bronze Package - Pending Payment
      {
        eventId,
        payerId: sponsorPayerId3,
        payerName: "DataSoft Solutions",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: sponsorAppId3,
        amount: 1000,
        currency: "LKR",
        status: "PENDING",
        method: "SIMULATED",
        transactionRef: "TXN-2025-003",
        paymentDetails: {
          description: "Bronze Sponsorship Package - LKR 1,000",
          referenceNumber: "REF-2025-003"
        },
        createdAt: new Date("2025-07-08T14:20:00"),
        updatedAt: new Date("2025-07-08T14:20:00")
      },
    ];

    const result = await Payment.insertMany(payments);
    console.log(`✅ Seeded ${result.length} payments`);

    // Display summary
    console.log("\n📊 Payment Summary:");
    console.log(`   Total Records: ${result.length}`);
    console.log(`   Completed: ${payments.filter(p => p.status === "COMPLETED").length}`);
    console.log(`   Pending: ${payments.filter(p => p.status === "PENDING").length}`);

  } catch (error) {
    console.error("❌ Error seeding payments:", error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedPayments();
  await mongoose.connection.close();
  console.log("\n✅ Seeding complete and connection closed");
};

runSeed();
