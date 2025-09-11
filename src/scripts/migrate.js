const { execSync } = require("child_process");
const path = require("path");

console.log("📊 Running database migrations...");

try {
  execSync("npx sequelize-cli db:migrate", {
    stdio: "inherit",
    cwd: path.join(__dirname, "..", ".."),
  });
  console.log("✅ Database migrations completed successfully");
} catch (error) {
  console.error("❌ Database migration failed:", error.message);
  process.exit(1);
}
