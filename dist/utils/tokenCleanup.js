"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenCleanup = void 0;
const authService_1 = require("../services/authService");
/**
 * Cleanup script to remove expired tokens from the blacklist
 * This should be run periodically (e.g., via cron job) to prevent
 * the token_blacklist table from growing indefinitely
 */
class TokenCleanup {
    /**
     * Clean up expired tokens from the blacklist
     */
    static async cleanupExpiredTokens() {
        try {
            console.log('Starting token cleanup...');
            await authService_1.AuthService.cleanupExpiredTokens();
            console.log('Token cleanup completed successfully');
        }
        catch (error) {
            console.error('Error during token cleanup:', error);
            throw error;
        }
    }
    /**
     * Run cleanup with error handling
     */
    static async run() {
        try {
            await this.cleanupExpiredTokens();
            process.exit(0);
        }
        catch (error) {
            console.error('Token cleanup failed:', error);
            process.exit(1);
        }
    }
}
exports.TokenCleanup = TokenCleanup;
// If this file is run directly, execute cleanup
if (require.main === module) {
    TokenCleanup.run();
}
