"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    '/auth/register': {
        post: {
            tags: ['Authentication'],
            summary: 'Register a new user',
            description: 'Create a new user account with the specified role',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserRegistration'
                        }
                    }
                }
            },
            responses: {
                201: {
                    description: 'User registered successfully',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AuthResponse'
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request - validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    '/auth/login': {
        post: {
            tags: ['Authentication'],
            summary: 'User login',
            description: 'Authenticate user and return JWT token',
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/UserLogin'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Login successful',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/AuthResponse'
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - invalid credentials',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    '/auth/profile': {
        get: {
            tags: ['Authentication'],
            summary: 'Get user profile',
            description: 'Retrieve the authenticated user profile',
            security: [
                {
                    bearerAuth: []
                }
            ],
            responses: {
                200: {
                    description: 'Profile retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserProfile'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - token required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        },
        put: {
            tags: ['Authentication'],
            summary: 'Update user profile',
            description: 'Update the authenticated user profile information',
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ProfileUpdate'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Profile updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Profile updated successfully'
                                    },
                                    data: {
                                        $ref: '#/components/schemas/UserProfile'
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request - validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - token required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    '/auth/change-password': {
        put: {
            tags: ['Authentication'],
            summary: 'Change user password',
            description: 'Change the authenticated user password',
            security: [
                {
                    bearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/PasswordChange'
                        }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Password changed successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Password updated successfully'
                                    }
                                }
                            }
                        }
                    }
                },
                400: {
                    description: 'Bad request - validation error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - token required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    '/auth/users/{userId}/deactivate': {
        put: {
            tags: ['Authentication'],
            summary: 'Deactivate user (Admin only)',
            description: 'Deactivate a user account (Admin role required)',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'uuid'
                    },
                    description: 'User ID to deactivate'
                }
            ],
            responses: {
                200: {
                    description: 'User deactivated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'User deactivated successfully'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - token required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - Admin role required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    },
    '/auth/users/{userId}/reactivate': {
        put: {
            tags: ['Authentication'],
            summary: 'Reactivate user (Admin only)',
            description: 'Reactivate a deactivated user account (Admin role required)',
            security: [
                {
                    bearerAuth: []
                }
            ],
            parameters: [
                {
                    name: 'userId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'uuid'
                    },
                    description: 'User ID to reactivate'
                }
            ],
            responses: {
                200: {
                    description: 'User reactivated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: true
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'User reactivated successfully'
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    description: 'Unauthorized - token required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                },
                403: {
                    description: 'Forbidden - Admin role required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            }
                        }
                    }
                }
            }
        }
    }
};
