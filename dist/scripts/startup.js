"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
console.log("🚀 Starting Prescripto application...");
// Check if we're in production
if (process.env.NODE_ENV === "production") {
    console.log("📊 Setting up database...");
    try {
        // First try to create the database
        console.log("🗄️ Creating database if it doesn't exist...");
        try {
            (0, child_process_1.execSync)("npx sequelize-cli db:create", {
                stdio: "inherit",
                cwd: path.join(__dirname, "..", ".."),
            });
            console.log("✅ Database created successfully");
        }
        catch (createError) {
            if (createError.message.includes("already exists")) {
                console.log("ℹ️  Database already exists, continuing...");
            }
            else {
                console.log("⚠️  Database creation failed, continuing with migrations...");
            }
        }
        // Then run migrations
        console.log("📊 Running database migrations...");
        (0, child_process_1.execSync)("npx sequelize-cli db:migrate", {
            stdio: "inherit",
            cwd: path.join(__dirname, "..", ".."),
        });
        console.log("✅ Database migrations completed successfully");
        // Seed admin user if it doesn't exist
        console.log("👤 Checking for admin user...");
        try {
            (0, child_process_1.execSync)("npx sequelize-cli db:seed --seed 01-admin-user.js", {
                stdio: "inherit",
                cwd: path.join(__dirname, "..", ".."),
            });
            console.log("✅ Admin user seeded successfully");
        }
        catch (seedError) {
            if (seedError.message.includes("already exists") || seedError.message.includes("duplicate")) {
                console.log("ℹ️  Admin user already exists, continuing...");
            }
            else {
                console.log("⚠️  Admin seeding failed, continuing startup...");
            }
        }
    }
    catch (error) {
        console.error("❌ Database setup failed:", error.message);
        console.log("⚠️  Continuing startup without database setup...");
    }
}
// Start the main application
console.log("🎯 Starting server...");
Promise.resolve().then(() => __importStar(require("../server")));
