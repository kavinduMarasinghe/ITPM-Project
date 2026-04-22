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
    const payerId1 = new mongoose.Types.ObjectId();
    const payerId2 = new mongoose.Types.ObjectId();
    const payerId3 = new mongoose.Types.ObjectId();
    const payerId4 = new mongoose.Types.ObjectId();
    const payerId5 = new mongoose.Types.ObjectId();

    const refId1 = new mongoose.Types.ObjectId();
    const refId2 = new mongoose.Types.ObjectId();
    const refId3 = new mongoose.Types.ObjectId();
    const refId4 = new mongoose.Types.ObjectId();
    const refId5 = new mongoose.Types.ObjectId();

    const payments = [
      {
        eventId,
        payerId: payerId1,
        payerName: "TechCorp Sdn Bhd",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: refId1,
        amount: 5000,
        currency: "LKR",
        status: "COMPLETED",
        method: "SIMULATED",
        transactionRef: "TXN-2825-001",
        invoiceNo: "INV-2025-00001",
        paidAt: new Date("2025-07-12T10:32:00"),
        paymentDetails: {
          description: "Gold Sponsorship Package",
          referenceNumber: "REF-2025-001"
        },
        createdAt: new Date("2025-07-12T10:32:00"),
        updatedAt: new Date("2025-07-12T10:32:00")
      },
      {
        eventId,
        payerId: payerId2,
        payerName: "Vendor - Stall A-03",
        purpose: "STALL",
        refType: "Reservation",
        refId: refId2,
        amount: 800,
        currency: "LKR",
        status: "COMPLETED",
        method: "SIMULATED",
        transactionRef: "TXN-2825-002",
        invoiceNo: "INV-2025-00002",
        paidAt: new Date("2025-07-11T15:15:00"),
        paymentDetails: {
          description: "Stall Fee",
          referenceNumber: "REF-2025-002"
        },
        createdAt: new Date("2025-07-11T15:15:00"),
        updatedAt: new Date("2025-07-11T15:15:00")
      },
      {
        eventId,
        payerId: payerId3,
        payerName: "Nexus Media Group",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: refId3,
        amount: 2500,
        currency: "LKR",
        status: "PENDING",
        method: "SIMULATED",
        transactionRef: "TXN-2825-003",
        paymentDetails: {
          description: "Silver Sponsorship Package",
          referenceNumber: "REF-2025-003"
        },
        createdAt: new Date("2025-07-10T09:00:00"),
        updatedAt: new Date("2025-07-10T09:00:00")
      },
      {
        eventId,
        payerId: payerId4,
        payerName: "Vendor - Stall B-07",
        purpose: "STALL",
        refType: "Reservation",
        refId: refId4,
        amount: 450,
        currency: "LKR",
        status: "FAILED",
        method: "SIMULATED",
        transactionRef: "TXN-2825-004",
        paymentDetails: {
          description: "Stall Fee",
          referenceNumber: "REF-2025-004"
        },
        createdAt: new Date("2025-07-09T16:45:00"),
        updatedAt: new Date("2025-07-09T16:45:00")
      },
      {
        eventId,
        payerId: payerId5,
        payerName: "DataSoft Solutions",
        purpose: "SPONSORSHIP",
        refType: "SponsorApplication",
        refId: refId5,
        amount: 5000,
        currency: "LKR",
        status: "PENDING",
        method: "SIMULATED",
        transactionRef: "TXN-2825-005",
        paymentDetails: {
          description: "Gold Sponsorship Package",
          referenceNumber: "REF-2025-005"
        },
        createdAt: new Date("2025-07-08T12:30:00"),
        updatedAt: new Date("2025-07-08T12:30:00")
      }
    ];

    const result = await Payment.insertMany(payments);
    console.log(`✅ Seeded ${result.length} payments`);

    // Display summary
    console.log("\n📊 Payment Summary:");
    console.log(`   Total Records: ${result.length}`);
    console.log(`   Completed: ${payments.filter(p => p.status === "COMPLETED").length}`);
    console.log(`   Pending: ${payments.filter(p => p.status === "PENDING").length}`);
    console.log(`   Failed: ${payments.filter(p => p.status === "FAILED").length}`);

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
