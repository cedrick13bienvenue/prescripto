import { execSync } from "child_process";
import * as path from "path";

console.log("🚀 Starting Prescripto application...");

// Check if we're in production
if (process.env.NODE_ENV === "production") {
  console.log("📊 Setting up database...");
  try {
    // First try to create the database
    console.log("🗄️ Creating database if it doesn't exist...");
    try {
      execSync("npx sequelize-cli db:create", {
        stdio: "inherit",
        cwd: path.join(__dirname, "..", ".."),
      });
      console.log("✅ Database created successfully");
    } catch (createError: any) {
      if (createError.message.includes("already exists")) {
        console.log("ℹ️  Database already exists, continuing...");
      } else {
        console.log("⚠️  Database creation failed, continuing with migrations...");
      }
    }

    // Then run migrations
    console.log("📊 Running database migrations...");
    execSync("npx sequelize-cli db:migrate", {
      stdio: "inherit",
      cwd: path.join(__dirname, "..", ".."),
    });
    console.log("✅ Database migrations completed successfully");

    // Seed admin user if it doesn't exist
    console.log("👤 Checking for admin user...");
    try {
      execSync("npx sequelize-cli db:seed --seed 01-admin-user.js", {
        stdio: "inherit",
        cwd: path.join(__dirname, "..", ".."),
      });
      console.log("✅ Admin user seeded successfully");
    } catch (seedError: any) {
      if (seedError.message.includes("already exists") || seedError.message.includes("duplicate")) {
        console.log("ℹ️  Admin user already exists, continuing...");
      } else {
        console.log("⚠️  Admin seeding failed, continuing startup...");
      }
    }
  } catch (error: any) {
    console.error("❌ Database setup failed:", error.message);
    console.log("⚠️  Continuing startup without database setup...");
  }
}

// Start the main application
console.log("🎯 Starting server...");
import("../server");
