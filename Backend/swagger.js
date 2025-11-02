import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'FishLink API',
    version: '1.0.0',
    description: 'Fresh Fish Trace Management System (FF-TMS) Backend API - Role-based access control with ADMIN, AGENT, FISHER, and BUYER roles',
    contact: {
      name: 'FishLink Team'
    }
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local development server' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login or verify-otp'
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'AGENT', 'FISHER', 'BUYER'] },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Catch: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          fishName: { type: 'string' },
          weight: { type: 'number' },
          price: { type: 'number' },
          freshness: { type: 'string' },
          lake: { type: 'string' },
          fisherId: { type: 'integer' },
          qrEncrypted: { type: 'string' },
          verified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          fisher: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              phone: { type: 'string' }
            }
          }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          buyerId: { type: 'integer' },
          catchId: { type: 'integer' },
          paymentStatus: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED'] },
          date: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Delivery: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          orderId: { type: 'integer' },
          deliveryPersonId: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'] },
          notes: { type: 'string' },
          pickedAt: { type: 'string', format: 'date-time' },
          deliveredAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};

// Explicit path definitions
const paths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Check if the API is running',
      responses: {
        200: {
          description: 'API is running',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  message: { type: 'string', example: 'FishLink API is running' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register new user (email + password)',
      description: 'Create a new user account. Email verification OTP will be sent.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'StrongPass123' },
                phone: { type: 'string', example: '0911222333' },
                role: { type: 'string', enum: ['BUYER', 'FISHER'], default: 'BUYER', example: 'BUYER' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully, OTP sent to email',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        400: { description: 'Validation error or user already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/api/auth/send-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Resend OTP to email',
      description: 'Send verification OTP to an existing unverified user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                name: { type: 'string', example: 'John Doe' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'OTP sent successfully' },
        400: { description: 'Email already verified or invalid', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: 'No account found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/api/auth/verify-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Verify OTP and activate account',
      description: 'Verify email with OTP code. Returns JWT token for immediate login.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'otp'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                otp: { type: 'string', example: '123456' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Email verified successfully, returns JWT',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                  token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                }
              }
            }
          }
        },
        400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/api/auth/login-email': {
    post: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      description: 'Authenticate user with email and password. Email must be verified.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'john@example.com' },
                password: { type: 'string', format: 'password', example: 'StrongPass123' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful, returns JWT',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  user: { $ref: '#/components/schemas/User' },
                  token: { type: 'string' }
                }
              }
            }
          }
        },
        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: 'Email not verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
      }
    }
  },
  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login with phone and password',
      description: 'Authenticate user with phone and password. Email must be verified.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone', 'password'],
              properties: {
                phone: { type: 'string', example: '0911222333' },
                password: { type: 'string', format: 'password' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Login successful, returns JWT' },
        401: { description: 'Invalid credentials' },
        403: { description: 'Email not verified' }
      }
    }
  },
  '/api/catch': {
    get: {
      tags: ['Catch'],
      summary: 'List verified catches (any authenticated user)',
      description: 'Get all verified catches with optional filters',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'query', name: 'lake', schema: { type: 'string' }, description: 'Filter by lake name' },
        { in: 'query', name: 'fishName', schema: { type: 'string' }, description: 'Filter by fish name' },
        { in: 'query', name: 'freshness', schema: { type: 'string' }, description: 'Filter by freshness' }
      ],
      responses: {
        200: {
          description: 'List of verified catches',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  catches: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Catch' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' }
      }
    },
    post: {
      tags: ['Catch'],
      summary: 'Create new catch (FISHER only)',
      description: 'Register a new fish catch. Generates QR code for traceability.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['fishName', 'weight', 'price', 'freshness', 'lake'],
              properties: {
                fishName: { type: 'string', example: 'Nile Tilapia' },
                weight: { type: 'number', example: 5.2 },
                price: { type: 'number', example: 1200 },
                freshness: { type: 'string', example: 'Fresh' },
                lake: { type: 'string', example: 'Tana' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Catch created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  catch: { $ref: '#/components/schemas/Catch' },
                  qrCode: { type: 'string', description: 'QR code as data URL' },
                  encryptedData: { type: 'string' }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - FISHER role required' }
      }
    }
  },
  '/api/catch/my-catches': {
    get: {
      tags: ['Catch'],
      summary: 'Get fisher\'s own catches (FISHER only)',
      description: 'List all catches created by the authenticated fisher',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of catches',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  catches: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Catch' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - FISHER role required' }
      }
    }
  },
  '/api/catch/{id}': {
    put: {
      tags: ['Catch'],
      summary: 'Update catch (owner FISHER only)',
      description: 'Update catch details. Only the fisher who created it can update.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' }, description: 'Catch ID' }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                fishName: { type: 'string' },
                weight: { type: 'number' },
                price: { type: 'number' },
                freshness: { type: 'string' },
                lake: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Catch updated successfully' },
        403: { description: 'Forbidden - can only edit own catches' },
        404: { description: 'Catch not found' }
      }
    },
    delete: {
      tags: ['Catch'],
      summary: 'Delete catch (owner FISHER only)',
      description: 'Delete a catch. Only the fisher who created it can delete.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      responses: {
        200: { description: 'Catch deleted successfully' },
        403: { description: 'Forbidden - can only delete own catches' },
        404: { description: 'Catch not found' }
      }
    }
  },
  '/api/catch/{id}/verify': {
    patch: {
      tags: ['Catch'],
      summary: 'Verify/unverify catch (ADMIN only)',
      description: 'Approve or reject a catch. Only ADMIN can verify catches.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['verified'],
              properties: {
                verified: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Verification status updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' },
        404: { description: 'Catch not found' }
      }
    }
  },
  '/api/catch/all': {
    get: {
      tags: ['Catch'],
      summary: 'List all catches including unverified (ADMIN only)',
      description: 'Get all catches (verified and unverified). ADMIN only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of all catches',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  catches: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Catch' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' }
      }
    }
  },
  '/api/order': {
    post: {
      tags: ['Order'],
      summary: 'Create order (BUYER only)',
      description: 'Place an order for a verified catch',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['catchId'],
              properties: {
                catchId: { type: 'integer', example: 1 },
                paymentStatus: { type: 'string', enum: ['PENDING', 'COMPLETED'], default: 'PENDING' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Order created successfully' },
        400: { description: 'Catch not verified or not found' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - BUYER role required' }
      }
    }
  },
  '/api/order/{id}/payment': {
    patch: {
      tags: ['Order'],
      summary: 'Update payment status (ADMIN only)',
      description: 'Update order payment status. Only ADMIN can update payment status.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                paymentStatus: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED'], example: 'COMPLETED' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Payment status updated' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' },
        404: { description: 'Order not found' }
      }
    }
  },
  '/api/order/my-orders': {
    get: {
      tags: ['Order'],
      summary: 'List buyer\'s orders (BUYER only)',
      description: 'Get all orders placed by the authenticated buyer',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of orders',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orders: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - BUYER role required' }
      }
    }
  },
  '/api/order/all': {
    get: {
      tags: ['Order'],
      summary: 'List all orders (ADMIN only)',
      description: 'Get all orders in the system. ADMIN only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of all orders',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orders: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Order' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' }
      }
    }
  },
  '/api/user/{id}': {
    get: {
      tags: ['User'],
      summary: 'Get user profile (self or ADMIN)',
      description: 'Get user details. Users can view their own profile, ADMIN can view any.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      responses: {
        200: {
          description: 'User profile with catches/orders based on role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        },
        403: { description: 'Access denied' },
        404: { description: 'User not found' }
      }
    }
  },
  '/api/user/register-fisher': {
    post: {
      tags: ['User'],
      summary: 'Register new fisher (AGENT only)',
      description: 'Create a fisher account. AGENT only. For illiterate fishers.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'phone', 'password'],
              properties: {
                name: { type: 'string', example: 'Fisher One' },
                phone: { type: 'string', example: '0911000000' },
                password: { type: 'string', format: 'password', example: 'FishPass123' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Fisher registered successfully' },
        400: { description: 'User already exists' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - AGENT role required' }
      }
    }
  },
  '/api/verify': {
    post: {
      tags: ['Verify'],
      summary: 'Verify QR code (public)',
      description: 'Decrypt QR code and fetch catch details for traceability',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['encrypted'],
              properties: {
                encrypted: { type: 'string', description: 'Encrypted QR data from catch' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Verification successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  verified: { type: 'boolean' },
                  catch: { $ref: '#/components/schemas/Catch' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        400: { description: 'Invalid QR code or decryption failed' },
        404: { description: 'Catch not found' }
      }
    }
  },
  '/api/delivery': {
    post: {
      tags: ['Delivery'],
      summary: 'Create delivery for order (ADMIN only)',
      description: 'Create a delivery record for a completed order',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId'],
              properties: {
                orderId: { type: 'integer', example: 1 },
                deliveryPersonId: { type: 'integer', example: 5 },
                notes: { type: 'string', example: 'Handle with care' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Delivery created successfully' },
        400: { description: 'Order not found or delivery already exists' },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' }
      }
    }
  },
  '/api/delivery/{id}/status': {
    patch: {
      tags: ['Delivery'],
      summary: 'Update delivery status (ADMIN or assigned delivery person)',
      description: 'Update delivery status. Auto-sets picked_at and delivered_at timestamps.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['PENDING', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'], example: 'IN_TRANSIT' },
                notes: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Delivery status updated' },
        403: { description: 'Access denied' },
        404: { description: 'Delivery not found' }
      }
    }
  },
  '/api/delivery/{id}/assign': {
    patch: {
      tags: ['Delivery'],
      summary: 'Assign delivery person (ADMIN only)',
      description: 'Assign a delivery person to a delivery',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['deliveryPersonId'],
              properties: {
                deliveryPersonId: { type: 'integer', example: 5 }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Delivery person assigned' },
        403: { description: 'Forbidden - ADMIN role required' },
        404: { description: 'Delivery or person not found' }
      }
    }
  },
  '/api/delivery/order/{orderId}': {
    get: {
      tags: ['Delivery'],
      summary: 'Get delivery by order ID (buyer, fisher, delivery person, or ADMIN)',
      description: 'Get delivery details for a specific order',
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: 'path', name: 'orderId', required: true, schema: { type: 'integer' } }
      ],
      responses: {
        200: {
          description: 'Delivery details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  delivery: { $ref: '#/components/schemas/Delivery' }
                }
              }
            }
          }
        },
        403: { description: 'Access denied' },
        404: { description: 'Delivery not found' }
      }
    }
  },
  '/api/delivery/all': {
    get: {
      tags: ['Delivery'],
      summary: 'List all deliveries (ADMIN only)',
      description: 'Get all deliveries in the system',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of all deliveries',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  deliveries: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Delivery' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' },
        403: { description: 'Forbidden - ADMIN role required' }
      }
    }
  },
  '/api/delivery/my-deliveries': {
    get: {
      tags: ['Delivery'],
      summary: 'Get deliveries assigned to current user (delivery person)',
      description: 'List all deliveries assigned to the authenticated delivery person',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of assigned deliveries',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  deliveries: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Delivery' }
                  }
                }
              }
            }
          }
        },
        401: { description: 'Unauthorized' }
      }
    }
  },
  '/api/chapa/pay': {
    post: {
      tags: ['Payment'],
      summary: 'Initialize Chapa payment',
      description: 'Initialize a payment transaction with Chapa payment gateway',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount', 'currency', 'email', 'first_name', 'last_name'],
              properties: {
                amount: { type: 'number', example: 1200 },
                currency: { type: 'string', example: 'ETB' },
                email: { type: 'string', format: 'email', example: 'buyer@test.com' },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                phone_number: { type: 'string', example: '0911222333' },
                callback_url: { type: 'string', example: 'https://yourapp.com/api/chapa/callback' },
                return_url: { type: 'string', example: 'https://yourapp.com/payment/success' }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Payment initialized successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      checkout_url: { type: 'string', description: 'URL to redirect user for payment' }
                    }
                  }
                }
              }
            }
          }
        },
        500: { description: 'Payment initiation failed' }
      }
    }
  }
};

const options = {
  definition: { ...swaggerDefinition, paths },
  apis: ['./routes/*.js'] // Can add JSDoc annotations later if needed
};

const swaggerSpec = swaggerJsdoc(options);

export default function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
    explorer: true,
    customSiteTitle: 'FishLink API Docs',
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  console.log('📚 Swagger docs available at /api/docs');
}
