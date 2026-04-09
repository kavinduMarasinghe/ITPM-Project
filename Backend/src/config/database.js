const path = require("path");

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const { DEFAULT_MONGODB_DB_NAME } = require("./constants");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
  quiet: true,
});

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Support BOTH variable names
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  const dbName = process.env.MONGODB_DB_NAME || DEFAULT_MONGODB_DB_NAME;

  if (!mongoUri) {
    throw new Error(
      "MongoDB URI is not set. Add MONGODB_URI or MONGO_URI to Backend/.env before starting the server."
    );
  }

  await mongoose.connect(mongoUri, {
    dbName,
    serverSelectionTimeoutMS: 15000,
  });

  return mongoose.connection;
}

module.exports = {
  connectDatabase,
};