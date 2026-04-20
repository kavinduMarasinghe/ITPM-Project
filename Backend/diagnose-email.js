#!/usr/bin/env node

/**
 * Email Diagnostic Tool
 * Checks email configuration and identifies issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

// Load .env
dotenv.config({ path: envPath });

console.log("\n🔍 EVENTAURA Email Diagnostic Tool\n");
console.log("=" .repeat(50));

// Check .env file
console.log("\n📄 Step 1: Checking .env configuration\n");

if (!fs.existsSync(envPath)) {
  console.error("❌ .env file not found at:", envPath);
  process.exit(1);
}

console.log("✅ .env file found");

// Check environment variables
const required = ["EMAIL_USER", "EMAIL_PASS", "EMAIL_SERVICE"];
const env = process.env;

let hasErrors = false;

required.forEach((key) => {
  const value = env[key];
  console.log(`\n${key}:`);
  
  if (!value) {
    console.log(`  ❌ Not set`);
    hasErrors = true;
  } else if (value.includes("your_") || value === "your_app_password_16_chars") {
    console.log(`  ❌ Still has placeholder: "${value}"`);
    hasErrors = true;
  } else {
    const masked = value.length > 10 ? value.substring(0, 3) + "***" + value.slice(-3) : "***";
    console.log(`  ✅ Set: ${masked}`);
  }
});

if (hasErrors) {
  console.log("\n" + "=".repeat(50));
  console.log("\n⚠️  Configuration Issues Found!\n");
  console.log("Run: node setup-email.js");
  console.log("\nOR manually edit Backend/.env:\n");
  console.log("EMAIL_USER=your_actual_email@gmail.com");
  console.log("EMAIL_PASS=your_16_char_app_password");
  console.log("EMAIL_SERVICE=gmail");
  process.exit(1);
}

// Test connection
console.log("\n" + "=".repeat(50));
console.log("\n🧪 Step 2: Testing email connection\n");

const transporter = nodemailer.createTransport({
  service: env.EMAIL_SERVICE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\nCommon issues:");
    console.log("• Gmail: Use App Password, not regular password");
    console.log("• Gmail: Enable 2-Factor Authentication first");
    console.log("• Wrong password or credentials");
    console.log("• Port 587 blocked by firewall\n");
    process.exit(1);
  } else {
    console.log("✅ Email service connected successfully!");
    
    console.log("\n" + "=".repeat(50));
    console.log("\n✨ Email Configuration Status: READY\n");
    console.log("Service:", env.EMAIL_SERVICE);
    console.log("From:", env.EMAIL_USER);
    console.log("\nYou can now:");
    console.log("1. Start backend: npm run dev");
    console.log("2. Add sponsor emails in Applications page");
    console.log("3. Send sponsor requests - emails will be delivered!\n");
    console.log("=" .repeat(50) + "\n");
  }
});


