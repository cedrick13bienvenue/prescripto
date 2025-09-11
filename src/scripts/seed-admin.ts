import { execSync } from "child_process";
import * as path from "path";

console.log("👤 Seeding admin user...");

try {
  execSync("npx sequelize-cli db:seed --seed 01-admin-user.js", {
    stdio: "inherit",
    cwd: path.join(__dirname, "..", ".."),
  });
  console.log("✅ Admin user seeded successfully");
} catch (error: any) {
  console.error("❌ Admin seeding failed:", error.message);
  process.exit(1);
}
