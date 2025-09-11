"use strict";
// Common types and enums used across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionStatus = exports.VisitType = exports.UserRole = void 0;
exports.calculatePagination = calculatePagination;
exports.createPaginationResponse = createPaginationResponse;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["DOCTOR"] = "doctor";
    UserRole["PATIENT"] = "patient";
    UserRole["PHARMACIST"] = "pharmacist";
})(UserRole || (exports.UserRole = UserRole = {}));
var VisitType;
(function (VisitType) {
    VisitType["CONSULTATION"] = "consultation";
    VisitType["EMERGENCY"] = "emergency";
    VisitType["FOLLOWUP"] = "followup";
})(VisitType || (exports.VisitType = VisitType = {}));
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["FILLED"] = "filled";
    PrescriptionStatus["CANCELLED"] = "cancelled";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
function calculatePagination(page, limit, maxLimit = 100) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), maxLimit);
    const offset = (validPage - 1) * validLimit;
    return {
        offset,
        limit: validLimit,
        page: validPage
    };
}
function createPaginationResponse(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
}
