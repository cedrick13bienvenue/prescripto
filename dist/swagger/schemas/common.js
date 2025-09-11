"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Error: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: false
            },
            error: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Error message description'
                    },
                    statusCode: {
                        type: 'integer',
                        example: 400
                    }
                }
            }
        }
    },
    Success: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                example: true
            },
            message: {
                type: 'string',
                example: 'Operation completed successfully'
            },
            data: {
                type: 'object',
                description: 'Response data object'
            }
        }
    },
    Pagination: {
        type: 'object',
        properties: {
            page: {
                type: 'integer',
                example: 1
            },
            limit: {
                type: 'integer',
                example: 10
            },
            total: {
                type: 'integer',
                example: 100
            },
            totalPages: {
                type: 'integer',
                example: 10
            }
        }
    }
};
