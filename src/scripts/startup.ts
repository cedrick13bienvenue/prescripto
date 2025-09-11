import { execSync } from "child_process";
import * as path from "path";

console.log("🚀 Starting Prescripto application...");

// Check if we're in production
if (process.env.NODE_ENV === "production") {
  console.log("📊 Running database migrations...");
  try {
    // Run database migrations
    execSync("npx sequelize-cli db:migrate", {
      stdio: "inherit",
      cwd: path.join(__dirname, "..", ".."),
    });
    console.log("✅ Database migrations completed successfully");
  } catch (error: any) {
    console.error("❌ Database migration failed:", error.message);
    console.log("⚠️  Continuing startup without migrations...");
  }
}

// Start the main application
console.log("🎯 Starting server...");
import("../server");
