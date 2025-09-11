"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileUpload = exports.validateRateLimit = exports.sanitizeInput = exports.validateUUID = exports.validateDate = exports.validatePassword = exports.validateEmail = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const schemas_1 = require("../validation/schemas");
// Generic validation middleware
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
        const { error, value } = schema.validate(data, schemas_1.validationOptions);
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    statusCode: 400,
                    details: errorDetails
                }
            });
            return;
        }
        // Replace the original data with validated and sanitized data
        if (source === 'body') {
            req.body = value;
        }
        else if (source === 'query') {
            req.query = value;
        }
        else if (source === 'params') {
            req.params = value;
        }
        next();
    };
};
exports.validate = validate;
// Specific validation middlewares for common use cases
const validateBody = (schema) => (0, exports.validate)(schema, 'body');
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validate)(schema, 'query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validate)(schema, 'params');
exports.validateParams = validateParams;
// Custom validation for specific fields
const validateEmail = (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Email is required',
                statusCode: 400
            }
        });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Please provide a valid email address',
                statusCode: 400
            }
        });
        return;
    }
    next();
};
exports.validateEmail = validateEmail;
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    if (!password) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Password is required',
                statusCode: 400
            }
        });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Password must be at least 8 characters long',
                statusCode: 400
            }
        });
        return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                statusCode: 400
            }
        });
        return;
    }
    next();
};
exports.validatePassword = validatePassword;
const validateDate = (field) => {
    return (req, res, next) => {
        const dateValue = req.body[field];
        if (!dateValue) {
            res.status(400).json({
                success: false,
                error: {
                    message: `${field} is required`,
                    statusCode: 400
                }
            });
            return;
        }
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            res.status(400).json({
                success: false,
                error: {
                    message: `Please provide a valid date for ${field}`,
                    statusCode: 400
                }
            });
            return;
        }
        if (date > new Date()) {
            res.status(400).json({
                success: false,
                error: {
                    message: `${field} cannot be in the future`,
                    statusCode: 400
                }
            });
            return;
        }
        next();
    };
};
exports.validateDate = validateDate;
const validateUUID = (field) => {
    return (req, res, next) => {
        const uuidValue = req.params[field] || req.body[field];
        if (!uuidValue) {
            res.status(400).json({
                success: false,
                error: {
                    message: `${field} is required`,
                    statusCode: 400
                }
            });
            return;
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuidValue)) {
            res.status(400).json({
                success: false,
                error: {
                    message: `Please provide a valid ${field}`,
                    statusCode: 400
                }
            });
            return;
        }
        next();
    };
};
exports.validateUUID = validateUUID;
// Sanitization middleware
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.trim();
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    next();
};
exports.sanitizeInput = sanitizeInput;
// Rate limiting validation
const validateRateLimit = (req, res, next) => {
    // This would integrate with rate limiting middleware
    // For now, just pass through
    next();
};
exports.validateRateLimit = validateRateLimit;
// File upload validation (for future use)
const validateFileUpload = (allowedTypes, maxSize) => {
    return (req, res, next) => {
        const file = req.file;
        if (!file) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'File is required',
                    statusCode: 400
                }
            });
            return;
        }
        if (!allowedTypes.includes(file.mimetype)) {
            res.status(400).json({
                success: false,
                error: {
                    message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
                    statusCode: 400
                }
            });
            return;
        }
        if (file.size > maxSize) {
            res.status(400).json({
                success: false,
                error: {
                    message: `File size too large. Maximum size: ${maxSize} bytes`,
                    statusCode: 400
                }
            });
            return;
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
