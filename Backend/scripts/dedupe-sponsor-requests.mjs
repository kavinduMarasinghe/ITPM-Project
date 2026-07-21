import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SponsorRequest from '../src/models/SponsorRequest.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_system';
await mongoose.connect(uri);

const docs = await SponsorRequest.find({}).sort({ sentAt: -1, createdAt: -1 });
const seen = new Set();
const keep = [];
const removeIds = [];

for (const doc of docs) {
  const key = [
    String(doc.companyName || '').trim().toLowerCase(),
    String(doc.email || '').trim().toLowerCase(),
    String(doc.eventName || '').trim().toLowerCase(),
    String(doc.packageName || '').trim().toLowerCase(),
    String(doc.subject || '').trim().toLowerCase(),
    String(doc.message || '').trim().toLowerCase(),
  ].join('|');

  if (seen.has(key)) {
    removeIds.push(doc._id.toString());
  } else {
    seen.add(key);
    keep.push({
      id: doc._id.toString(),
      companyName: doc.companyName,
      email: doc.email,
      eventName: doc.eventName,
      packageName: doc.packageName,
      sentAt: doc.sentAt,
    });
  }
}

if (removeIds.length > 0) {
  await SponsorRequest.deleteMany({ _id: { $in: removeIds } });
}

console.log(JSON.stringify({ totalBefore: docs.length, kept: keep.length, removed: removeIds.length, keep }, null, 2));
await mongoose.disconnect();
