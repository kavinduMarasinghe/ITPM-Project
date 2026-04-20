#!/usr/bin/env node

/**
 * Email Setup Diagnostic Tool
 * Run this to test and configure email sending
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("\n🚀 EVENTAURA Email Setup Tool\n");
  console.log("This tool will help you configure email sending for sponsor requests.\n");

  // Read current .env
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  // Parse existing values
  const envVars = {};
  envContent.split("\n").forEach((line) => {
    if (line.includes("=") && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      envVars[key.trim()] = valueParts.join("=").trim();
    }
  });

  console.log("📧 Email Service Setup\n");

  // Get email service
  const service = await question(`Email Service (gmail/outlook/yahoo) [${envVars.EMAIL_SERVICE || "gmail"}]: `);
  envVars.EMAIL_SERVICE = service || envVars.EMAIL_SERVICE || "gmail";

  // Get email user
  const emailUser = await question(
    `Email Address (your_email@${envVars.EMAIL_SERVICE}.com) [${envVars.EMAIL_USER || ""}]: `
  );
  if (emailUser) {
    envVars.EMAIL_USER = emailUser;
  } else if (!envVars.EMAIL_USER || envVars.EMAIL_USER.includes("your_")) {
    console.log("❌ Email address is required!");
    rl.close();
    return;
  }

  // Get email password
  const emailPass = await question(`App Password or Password (16 chars) [${envVars.EMAIL_PASS ? "***" : ""}]: `);
  if (emailPass) {
    envVars.EMAIL_PASS = emailPass;
  } else if (!envVars.EMAIL_PASS || envVars.EMAIL_PASS.includes("your_")) {
    console.log("❌ Password is required!");
    rl.close();
    return;
  }

  envVars.BACKEND_URL = envVars.BACKEND_URL || "http://localhost:5001";

  // Test connection
  console.log("\n🧪 Testing email connection...\n");

  try {
    const transporter = nodemailer.createTransport({
      service: envVars.EMAIL_SERVICE,
      auth: {
        user: envVars.EMAIL_USER,
        pass: envVars.EMAIL_PASS,
      },
    });

    // Verify
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(error);
        } else {
          resolve(success);
        }
      });
    });

    console.log("✅ Email service connection successful!\n");

    // Ask to send test email
    const sendTest = await question("Send a test email? (y/n) [y]: ");
    if (sendTest !== "n") {
      const testEmail = await question("Test email address: ");
      if (testEmail) {
        console.log("\n📧 Sending test email...");
        const result = await transporter.sendMail({
          from: envVars.EMAIL_USER,
          to: testEmail,
          subject: "Test Email from EVENTAURA",
          html: `<h1>✅ Email Setup Successful!</h1><p>This confirms your email is configured correctly for EVENTAURA.</p>`,
        });
        console.log("✅ Test email sent! Message ID:", result.messageId);
      }
    }
  } catch (error) {
    console.error("❌ Email connection failed:", error.message);
    console.error("\nCommon issues:");
    console.error("1. Wrong credentials - double check email and password");
    console.error("2. Gmail needs App Password (not regular password) - Enable 2FA and generate from Account Security");
    console.error("3. Firewall blocking SMTP port");
    rl.close();
    return;
  }

  // Save to .env
  console.log("\n💾 Saving configuration to .env...\n");

  let newEnvContent = `MONGO_URI=mongodb://127.0.0.1:27017/event_system
PORT=5001

# Email Configuration (${envVars.EMAIL_SERVICE})
EMAIL_USER=${envVars.EMAIL_USER}
EMAIL_PASS=${envVars.EMAIL_PASS}
EMAIL_SERVICE=${envVars.EMAIL_SERVICE}
BACKEND_URL=${envVars.BACKEND_URL}
`;

  fs.writeFileSync(envPath, newEnvContent);
  console.log("✅ Configuration saved to .env");

  console.log("\n📋 Next Steps:");
  console.log("1. Start backend: npm run dev");
  console.log("2. Open frontend: npm run dev (in Frontend directory)");
  console.log("3. Add sponsor emails in Applications page");
  console.log("4. Send sponsor requests - emails will be delivered!");

  console.log("\n✨ Email setup complete!\n");

  rl.close();
}

main().catch((error) => {
  console.error("Setup error:", error);
  rl.close();
  process.exit(1);
});
