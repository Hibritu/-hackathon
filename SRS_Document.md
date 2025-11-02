# Software Requirements Specification (SRS)
## FishLink - Fresh Fish Trace Management System (FF-TMS)

**Document Version:** 1.0  
**Date:** December 2024  
**Project:** FishLink / FishTrace  
**Prepared By:** Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [User Roles and Permissions](#6-user-roles-and-permissions)
7. [External Interface Requirements](#7-external-interface-requirements)
8. [System Architecture](#8-system-architecture)
9. [Database Requirements](#9-database-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Performance Requirements](#11-performance-requirements)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a comprehensive description of the FishLink (Fresh Fish Trace Management System) software system. This document is intended for developers, project managers, stakeholders, and quality assurance teams.

### 1.2 Scope
FishLink is a web-based traceability management system designed to track fresh fish from catch to delivery. The system enables:
- Real-time fish catch registration and verification
- QR code-based traceability
- Order management and processing
- Delivery tracking
- Payment integration
- Role-based access control for multiple user types

### 1.3 Definitions, Acronyms, and Abbreviations
- **FF-TMS**: Fresh Fish Trace Management System
- **JWT**: JSON Web Token
- **OTP**: One-Time Password
- **QR Code**: Quick Response Code
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **CORS**: Cross-Origin Resource Sharing
- **AES**: Advanced Encryption Standard
- **ETB**: Ethiopian Birr (Currency)

### 1.4 References
- PostgreSQL Database Documentation
- React 18 Documentation
- Express.js Documentation
- JWT Authentication Standards
- QR Code Standards

### 1.5 Overview
This document is organized into 12 sections covering all aspects of the system from functional requirements to technical specifications. Each section provides detailed information about different aspects of the FishLink system.

---

## 2. Overall Description

### 2.1 Product Perspective
FishLink is an independent web application consisting of:
- **Frontend**: React-based single-page application (SPA)
- **Backend**: Node.js/Express RESTful API
- **Database**: PostgreSQL relational database

The system interfaces with:
- Email service (for OTP delivery)
- Payment gateway (Chapa)
- QR code generation libraries

### 2.2 Product Functions
The system provides the following main functions:

1. **User Management**
   - User registration with email verification
   - Multi-factor authentication (OTP)
   - Role-based access control
   - Profile management

2. **Catch Management**
   - Fish catch registration
   - QR code generation for traceability
   - Catch verification by agents
   - Catch search and filtering

3. **Order Processing**
   - Order creation by buyers
   - Payment status tracking
   - Order history management

4. **Delivery Tracking**
   - Delivery assignment
   - Status updates (PENDING, PICKED, IN_TRANSIT, DELIVERED, FAILED)
   - Real-time tracking

5. **Verification System**
   - QR code scanning and verification
   - Traceability information display
   - Catch authenticity validation

6. **Payment Integration**
   - Chapa payment gateway integration
   - Payment status management

### 2.3 User Classes and Characteristics

**Primary Users:**
- **Fishers**: Register fish catches, view verification status
- **Agents**: Verify catches, manage fisher registration
- **Buyers**: Browse verified catches, place orders
- **Admins**: Full system oversight and management
- **Delivery Personnel**: Update delivery status (if implemented)

**Secondary Users:**
- **System Administrators**: Manage system configuration
- **Support Staff**: Handle customer inquiries

### 2.4 Operating Environment

**Development Environment:**
- Node.js v18 or higher
- PostgreSQL 12 or higher
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- npm or yarn package manager

**Production Environment:**
- Cloud hosting (Heroku, AWS, Azure, etc.)
- PostgreSQL database (managed or self-hosted)
- Email service provider (Nodemailer compatible)
- HTTPS-enabled web server

### 2.5 Design and Implementation Constraints
- Must use RESTful API architecture
- JWT-based authentication required
- PostgreSQL database required
- Responsive design for mobile and desktop
- Support for modern browsers (last 2 versions)

### 2.6 Assumptions and Dependencies
**Assumptions:**
- Users have valid email addresses
- Users have internet connectivity
- Email service is configured and operational
- PostgreSQL database is accessible
- Payment gateway credentials are available

**Dependencies:**
- Node.js runtime environment
- PostgreSQL database server
- Email service (SMTP)
- Chapa payment gateway API
- External libraries (see package.json)

---

## 3. System Features

### 3.1 Authentication and Authorization

**Feature ID:** FR-001

**Description:**
Secure user authentication with email verification and role-based access control.

**Functional Requirements:**
- FR-001.1: Users can register with email, name, password, and role
- FR-001.2: System sends OTP to user's email upon registration
- FR-001.3: Users must verify OTP before account activation
- FR-001.4: Users can login with email and password
- FR-001.5: Users can login with phone number and password
- FR-001.6: System generates JWT token upon successful authentication
- FR-001.7: Users can request OTP resend
- FR-001.8: System enforces role-based access control
- FR-001.9: Passwords are hashed using bcrypt

**Priority:** High

### 3.2 Fish Catch Registration

**Feature ID:** FR-002

**Description:**
Fishers can register their fish catches with detailed information.

**Functional Requirements:**
- FR-002.1: Fishers can create catch records with fish name, weight, price, freshness, and lake
- FR-002.2: System automatically generates encrypted QR code upon catch creation
- FR-002.3: System assigns unique catch ID
- FR-002.4: Fishers can view their catch history
- FR-002.5: Fishers can update catch information (before verification)
- FR-002.6: Fishers can delete unverified catches
- FR-002.7: System stores catch creation timestamp

**Priority:** High

### 3.3 Catch Verification

**Feature ID:** FR-003

**Description:**
Agents and Admins can verify fish catches for quality assurance.

**Functional Requirements:**
- FR-003.1: Agents/Admins can view all catches (verified and unverified)
- FR-003.2: Agents/Admins can verify or reject catches
- FR-003.3: Only verified catches are visible to buyers
- FR-003.4: System tracks verification status
- FR-003.5: Verification can be reversed by authorized users

**Priority:** High

### 3.4 QR Code Traceability

**Feature ID:** FR-004

**Description:**
QR code generation and verification for fish traceability.

**Functional Requirements:**
- FR-004.1: System generates unique encrypted QR code for each catch
- FR-004.2: QR code contains encrypted catch ID
- FR-004.3: Public users can scan QR codes to verify authenticity
- FR-004.4: System displays catch details upon QR verification
- FR-004.5: QR code verification does not require authentication
- FR-004.6: System validates QR code encryption integrity

**Priority:** High

### 3.5 Catch Browsing and Search

**Feature ID:** FR-005

**Description:**
Buyers can browse and search verified fish catches.

**Functional Requirements:**
- FR-005.1: Buyers can view all verified catches
- FR-005.2: Buyers can filter catches by lake
- FR-005.3: Buyers can filter catches by fish name
- FR-005.4: Buyers can filter catches by freshness
- FR-005.5: System displays fisher information with each catch
- FR-005.6: Catches are sorted by creation date (newest first)

**Priority:** Medium

### 3.6 Order Management

**Feature ID:** FR-006

**Description:**
Buyers can place orders for verified fish catches.

**Functional Requirements:**
- FR-006.1: Buyers can create orders for verified catches only
- FR-006.2: System validates catch availability and verification status
- FR-006.3: Buyers can view their order history
- FR-006.4: System tracks payment status (PENDING, COMPLETED, FAILED)
- FR-006.5: Admins can update payment status
- FR-006.6: System associates order with buyer and catch

**Priority:** High

### 3.7 Delivery Management

**Feature ID:** FR-007

**Description:**
System manages delivery tracking for orders.

**Functional Requirements:**
- FR-007.1: Admins can create delivery records for orders
- FR-007.2: Admins can assign delivery personnel
- FR-007.3: System tracks delivery status (PENDING, PICKED, IN_TRANSIT, DELIVERED, FAILED)
- FR-007.4: Delivery personnel can update delivery status
- FR-007.5: System records pickup and delivery timestamps
- FR-007.6: Buyers and Fishers can view delivery status
- FR-007.7: Admins can view all deliveries

**Priority:** Medium

### 3.8 Payment Integration

**Feature ID:** FR-008

**Description:**
Integration with Chapa payment gateway for order payments.

**Functional Requirements:**
- FR-008.1: System can initiate payment through Chapa API
- FR-008.2: System generates unique transaction references
- FR-008.3: System handles payment callbacks
- FR-008.4: System updates order payment status based on payment result
- FR-008.5: Payment requires valid order and buyer information

**Priority:** Medium

### 3.9 User Profile Management

**Feature ID:** FR-009

**Description:**
Users can view and update their profile information.

**Functional Requirements:**
- FR-009.1: Users can view their profile information
- FR-009.2: Users can update name and phone number
- FR-009.3: Email cannot be changed
- FR-009.4: System displays user role
- FR-009.5: Agents can register new fishers

**Priority:** Low

### 3.10 Dashboard Views

**Feature ID:** FR-010

**Description:**
Role-specific dashboards for different user types.

**Functional Requirements:**
- FR-010.1: Admin Dashboard displays system overview and statistics
- FR-010.2: Agent Dashboard displays catches pending verification
- FR-010.3: Buyer Dashboard displays available catches and orders
- FR-010.4: Fisher Dashboard displays catch registration and status
- FR-010.5: Each dashboard shows relevant metrics and actions

**Priority:** Medium

---

## 4. Functional Requirements

### 4.1 User Registration

**Requirement ID:** REQ-001

**Description:**
System must allow new users to register with email, name, password, and role.

**Inputs:**
- Name (required, max 150 characters)
- Email (required, valid email format, unique)
- Phone (optional, max 30 characters)
- Password (required, minimum length enforced by frontend)
- Role (required, one of: ADMIN, AGENT, FISHER, BUYER)

**Processing:**
1. Validate input fields
2. Check if email already exists
3. Hash password using bcrypt
4. Create user record with email_verified = false
5. Generate OTP
6. Send OTP via email
7. Store OTP in temporary storage

**Outputs:**
- Success: User record created, OTP sent
- Error: Appropriate error message

**Business Rules:**
- Default role is BUYER if not specified
- Email must be unique
- Account is inactive until email verification

### 4.2 Email Verification

**Requirement ID:** REQ-002

**Description:**
System must verify user email using OTP.

**Inputs:**
- Email (required)
- OTP (required, 6-digit code)

**Processing:**
1. Validate email and OTP format
2. Check if OTP exists and is valid (not expired)
3. Verify OTP matches stored value
4. Update user email_verified to true
5. Generate JWT token
6. Return user information and token

**Outputs:**
- Success: Email verified, JWT token returned
- Error: Invalid or expired OTP message

**Business Rules:**
- OTP expires after 10 minutes
- OTP can only be used once
- Successful verification auto-logs user in

### 4.3 User Login

**Requirement ID:** REQ-003

**Description:**
System must authenticate users and provide access tokens.

**Inputs:**
- Email or Phone (required)
- Password (required)

**Processing:**
1. Validate input fields
2. Find user by email or phone
3. Verify email is verified
4. Compare password with stored hash
5. Generate JWT token (expires in 7 days)
6. Return user information and token

**Outputs:**
- Success: User information and JWT token
- Error: Invalid credentials or unverified email

**Business Rules:**
- Only verified emails can login
- Invalid credentials return generic error message
- Token includes user ID and role

### 4.4 Catch Registration

**Requirement ID:** REQ-004

**Description:**
Fishers must be able to register fish catches.

**Inputs:**
- Fish Name (required, max 150 characters)
- Weight (required, numeric, positive)
- Price (required, numeric, positive)
- Freshness (required, string)
- Lake (required, max 100 characters)

**Processing:**
1. Authenticate user (must be FISHER)
2. Validate input fields
3. Create catch record with verified = false
4. Encrypt catch ID using AES-256
5. Generate QR code from encrypted data
6. Update catch with encrypted QR data
7. Return catch information with QR code

**Outputs:**
- Success: Catch record with QR code data
- Error: Validation or authentication error

**Business Rules:**
- Only FISHER role can create catches
- Catch is unverified by default
- QR code contains encrypted catch ID only

### 4.5 Catch Verification

**Requirement ID:** REQ-005

**Description:**
Agents/Admins must be able to verify catches.

**Inputs:**
- Catch ID (required)
- Verified status (required, boolean)

**Processing:**
1. Authenticate user (must be AGENT or ADMIN)
2. Validate catch exists
3. Update catch verified status
4. Return updated catch information

**Outputs:**
- Success: Updated catch record
- Error: Catch not found or unauthorized

**Business Rules:**
- Only AGENT or ADMIN can verify catches
- Verification status can be changed
- Verified catches are visible to buyers

### 4.6 QR Code Verification

**Requirement ID:** REQ-006

**Description:**
System must allow public QR code verification.

**Inputs:**
- Encrypted QR data (required, string)

**Processing:**
1. Validate encrypted data exists
2. Decrypt data using AES-256
3. Extract catch ID from decrypted data
4. Query catch and fisher information
5. Return catch details

**Outputs:**
- Success: Catch verification details
- Error: Invalid QR code or catch not found

**Business Rules:**
- No authentication required
- Invalid encryption returns error
- Displays complete traceability information

### 4.7 Order Creation

**Requirement ID:** REQ-007

**Description:**
Buyers must be able to create orders for verified catches.

**Inputs:**
- Catch ID (required)
- Payment Status (optional, default: PENDING)

**Processing:**
1. Authenticate user (must be BUYER)
2. Validate catch exists
3. Validate catch is verified
4. Create order record
5. Return order information with catch details

**Outputs:**
- Success: Order record created
- Error: Catch not found, not verified, or unauthorized

**Business Rules:**
- Only verified catches can be ordered
- Only BUYER role can create orders
- Default payment status is PENDING

### 4.8 Delivery Status Update

**Requirement ID:** REQ-008

**Description:**
System must allow delivery status updates.

**Inputs:**
- Delivery ID (required)
- Status (required, enum: PENDING, PICKED, IN_TRANSIT, DELIVERED, FAILED)
- Notes (optional)

**Processing:**
1. Authenticate user (must be ADMIN or assigned delivery person)
2. Validate delivery exists
3. Validate status is valid enum value
4. Update delivery status
5. Auto-set timestamps based on status
6. Return updated delivery information

**Outputs:**
- Success: Updated delivery record
- Error: Invalid delivery, status, or unauthorized

**Business Rules:**
- Only ADMIN or assigned delivery person can update
- PICKED/IN_TRANSIT sets picked_at timestamp
- DELIVERED sets delivered_at timestamp

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

**Requirement ID:** NFR-001

**Response Time:**
- API response time should be < 500ms for 90% of requests
- Database queries should complete within 200ms
- Page load time should be < 2 seconds

**Throughput:**
- System should support 100 concurrent users
- API should handle 1000 requests per minute

**Scalability:**
- System should scale horizontally
- Database should support up to 10,000 catches
- Should handle up to 1,000 active users

### 5.2 Security Requirements

**Requirement ID:** NFR-002

**Authentication:**
- All passwords must be hashed using bcrypt (10 rounds)
- JWT tokens must expire after 7 days
- Tokens must include user ID and role

**Authorization:**
- Role-based access control enforced at API level
- Protected routes require valid JWT token
- Users can only access/modify their own data (where applicable)

**Data Protection:**
- QR codes must be encrypted using AES-256
- Sensitive data must not be logged
- API must use HTTPS in production
- SQL injection prevention (parameterized queries)

**Input Validation:**
- All user inputs must be validated
- Email format validation
- Numeric fields must be validated
- String length limits enforced

### 5.3 Usability Requirements

**Requirement ID:** NFR-003

- Interface must be responsive (mobile and desktop)
- Dark mode support
- Error messages must be clear and actionable
- Loading states must be displayed for async operations
- Toast notifications for user feedback

### 5.4 Reliability Requirements

**Requirement ID:** NFR-004

- System uptime: 99% availability
- Database transactions must be atomic
- Error handling for all API endpoints
- Graceful degradation if external services fail

### 5.5 Maintainability Requirements

**Requirement ID:** NFR-005

- Code must follow ES6+ standards
- React components must be functional
- API endpoints must be documented (Swagger)
- Database schema must be version controlled
- Error logging must be implemented

### 5.6 Portability Requirements

**Requirement ID:** NFR-006

- System must run on Windows, Linux, macOS
- Database: PostgreSQL 12+
- Node.js: v18+
- Modern browsers (last 2 versions)

---

## 6. User Roles and Permissions

### 6.1 Role Definitions

**ADMIN:**
- Full system access
- View all catches (verified and unverified)
- Verify/reject catches
- Update payment status
- View all orders
- Create and manage deliveries
- Assign delivery personnel
- View system statistics

**AGENT:**
- View all catches (verified and unverified)
- Verify/reject catches
- Register new fishers
- View all orders
- View all deliveries

**FISHER:**
- Create catch records
- View own catches
- Update own catches (unverified only)
- Delete own catches (unverified only)
- View QR codes for own catches
- View delivery status for related orders

**BUYER:**
- View verified catches only
- Search and filter catches
- Create orders
- View own orders
- View delivery status for own orders

**DELIVERY (Future Role):**
- View assigned deliveries
- Update delivery status
- View delivery details

### 6.2 Permission Matrix

| Feature | ADMIN | AGENT | FISHER | BUYER |
|---------|-------|-------|--------|-------|
| Register User | ✅ | ✅ | ❌ | ❌ |
| Verify Catch | ✅ | ✅ | ❌ | ❌ |
| Create Catch | ❌ | ❌ | ✅ | ❌ |
| View All Catches | ✅ | ✅ | ❌ | ❌ |
| View Verified Catches | ✅ | ✅ | ✅ | ✅ |
| Create Order | ❌ | ❌ | ❌ | ✅ |
| Update Payment | ✅ | ❌ | ❌ | ❌ |
| Manage Delivery | ✅ | ❌ | ❌ | ❌ |
| View QR Code | ✅ | ✅ | ✅ | ✅ |
| Verify QR Code | ✅ | ✅ | ✅ | ✅ |

---

## 7. External Interface Requirements

### 7.1 User Interfaces

**Web Application:**
- React-based single-page application
- Responsive design (mobile-first)
- Dark mode support
- Accessible via modern web browsers

**Pages:**
- Landing Page
- Registration Page
- Login Page
- OTP Verification Page
- QR Verification Page
- Admin Dashboard
- Agent Dashboard
- Buyer Dashboard
- Fisher Dashboard

### 7.2 Hardware Interfaces

**Server Requirements:**
- Minimum: 2 CPU cores, 4GB RAM
- Recommended: 4 CPU cores, 8GB RAM
- Storage: 20GB minimum

**Client Requirements:**
- Modern web browser
- Internet connection
- JavaScript enabled

### 7.3 Software Interfaces

**Backend API:**
- RESTful API
- JSON data format
- Swagger documentation at `/api/docs`

**Database:**
- PostgreSQL 12+
- Connection via pg library

**External Services:**
- Email Service (SMTP via Nodemailer)
- Payment Gateway (Chapa API)
- QR Code Generation Library

### 7.4 Communication Interfaces

**Protocols:**
- HTTP/HTTPS for web traffic
- REST for API communication
- SMTP for email delivery
- WebSocket (future enhancement)

**Data Formats:**
- JSON for API requests/responses
- HTML/CSS/JavaScript for frontend
- SQL for database queries

---

## 8. System Architecture

### 8.1 Architecture Overview

FishLink follows a **three-tier architecture**:

1. **Presentation Tier** (Frontend)
   - React 18 SPA
   - Tailwind CSS for styling
   - React Router for navigation
   - Axios for HTTP requests

2. **Application Tier** (Backend)
   - Node.js/Express.js
   - RESTful API
   - JWT authentication
   - Role-based authorization

3. **Data Tier** (Database)
   - PostgreSQL
   - Relational database
   - Indexed queries
   - ACID transactions

### 8.2 Component Diagram

```
┌─────────────────┐
│   Frontend      │
│   (React SPA)   │
└────────┬────────┘
         │ HTTP/HTTPS
         │ JSON
┌────────▼────────┐
│   Backend API   │
│  (Express.js)   │
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

### 8.3 Technology Stack

**Frontend:**
- React 18.2.0
- Vite 5.0.8
- React Router DOM 6.20.0
- Tailwind CSS 3.3.6
- Axios 1.6.2
- React Hot Toast 2.4.1
- qrcode.react 3.1.0

**Backend:**
- Node.js 18+
- Express.js 4.19.2
- PostgreSQL (via pg 8.11.5)
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3
- crypto-js 4.2.0
- Nodemailer 6.9.13
- Swagger (swagger-jsdoc, swagger-ui-express)

---

## 9. Database Requirements

### 9.1 Database Schema

**Tables:**

1. **users**
   - id (SERIAL PRIMARY KEY)
   - name (VARCHAR 150)
   - phone (VARCHAR 30)
   - email (VARCHAR 255 UNIQUE)
   - password (VARCHAR 255)
   - role (VARCHAR 30)
   - email_verified (BOOLEAN)
   - created_at (TIMESTAMP)

2. **catches**
   - id (SERIAL PRIMARY KEY)
   - fish_name (VARCHAR 150)
   - weight (NUMERIC 10,2)
   - price (NUMERIC 12,2)
   - freshness (VARCHAR 50)
   - lake (VARCHAR 100)
   - fisher_id (INTEGER REFERENCES users)
   - qr_encrypted (TEXT)
   - verified (BOOLEAN)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. **orders**
   - id (SERIAL PRIMARY KEY)
   - buyer_id (INTEGER REFERENCES users)
   - catch_id (INTEGER REFERENCES catches)
   - payment_status (VARCHAR 30)
   - date (DATE)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. **deliveries**
   - id (SERIAL PRIMARY KEY)
   - order_id (INTEGER REFERENCES orders)
   - delivery_person_id (INTEGER REFERENCES users)
   - status (VARCHAR 30)
   - notes (TEXT)
   - picked_at (TIMESTAMP)
   - delivered_at (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

5. **representatives** (Optional)
   - id (SERIAL PRIMARY KEY)
   - user_id (INTEGER REFERENCES users)
   - cooperative_name (VARCHAR 150)
   - region (VARCHAR 100)
   - created_at (TIMESTAMP)

### 9.2 Database Constraints

- Foreign key constraints on related tables
- Unique constraint on user email
- Check constraints for enum values
- NOT NULL constraints on required fields
- Default values for timestamps and status fields

### 9.3 Indexes

- Index on users.phone
- Index on users.role
- Index on catches.verified
- Index on catches.fisher_id
- Index on catches.lake
- Index on orders.buyer_id
- Index on orders.catch_id
- Index on orders.payment_status

### 9.4 Data Integrity

- Cascade delete for related records
- Timestamps updated automatically via triggers
- Transactions ensure atomic operations
- Referential integrity enforced

---

## 10. Security Requirements

### 10.1 Authentication Security

- Passwords hashed using bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- Token expiration: 7 days
- Email verification required before login
- Password reset functionality (future)

### 10.2 Authorization Security

- Role-based access control (RBAC)
- Middleware authentication on protected routes
- User can only modify own data (where applicable)
- Agent/Admin can verify catches
- Only buyers can create orders

### 10.3 Data Encryption

- QR codes encrypted using AES-256
- Secret key stored in environment variables
- Passwords never stored in plain text
- JWT tokens contain no sensitive information

### 10.4 Input Validation

- All inputs validated on backend
- SQL injection prevention (parameterized queries)
- XSS prevention (React built-in escaping)
- Email format validation
- Numeric field validation

### 10.5 API Security

- CORS enabled for frontend domain
- HTTPS required in production
- Rate limiting (future enhancement)
- Request size limits
- Error messages don't expose sensitive data

### 10.6 Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: AES encryption key (32+ characters)
- `JWT_SECRET`: JWT signing key (32+ characters)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `CHAPA_SECRET_KEY`: Payment gateway key (optional)
- Email configuration (SMTP settings)

---

## 11. Performance Requirements

### 11.1 Response Times

- API endpoint response: < 500ms (90th percentile)
- Database query execution: < 200ms
- Page load time: < 2 seconds
- QR code generation: < 100ms

### 11.2 Throughput

- Support 100 concurrent users
- Handle 1000 API requests per minute
- Process 100 catch registrations per minute
- Support 50 concurrent orders

### 11.3 Scalability

- Horizontal scaling support
- Database connection pooling
- Stateless API design
- CDN for static assets (future)

### 11.4 Resource Usage

- Memory: < 512MB per API instance
- CPU: < 50% under normal load
- Database: < 10GB storage (initial)
- Network: Optimized JSON payloads

---

## 12. Future Enhancements

### 12.1 Planned Features

1. **Mobile Application**
   - React Native app
   - Offline support
   - Push notifications

2. **Advanced Analytics**
   - Catch statistics dashboard
   - Sales reports
   - Revenue tracking
   - User activity metrics

3. **Notification System**
   - Email notifications for order updates
   - SMS notifications (optional)
   - In-app notifications

4. **Inventory Management**
   - Stock tracking
   - Automatic depletion on order
   - Low stock alerts

5. **Multi-language Support**
   - English (current)
   - Amharic (future)
   - Afan Oromo (future)

6. **Payment Enhancements**
   - Multiple payment gateways
   - Wallet integration
   - Subscription model

7. **Image Upload**
   - Catch photo upload
   - Fisher profile pictures
   - Product galleries

8. **Review and Rating System**
   - Buyer reviews for catches
   - Fisher ratings
   - Quality scores

9. **Geolocation Features**
   - Map integration
   - Lake location tracking
   - Delivery route optimization

10. **Advanced Search**
    - Full-text search
    - Price range filtering
    - Date-based filtering
    - Sorting options

### 12.2 Technical Improvements

- WebSocket for real-time updates
- Redis for caching
- Elasticsearch for search
- Docker containerization
- CI/CD pipeline
- Automated testing suite
- Performance monitoring
- Logging and analytics

---

## Appendices

### Appendix A: API Endpoints Summary

**Authentication:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/verify-otp` - Verify email with OTP
- POST `/api/auth/login-email` - Login with email
- POST `/api/auth/login` - Login with phone
- POST `/api/auth/send-otp` - Resend OTP

**Catches:**
- POST `/api/catch` - Create catch (FISHER)
- GET `/api/catch` - Get verified catches
- GET `/api/catch/my-catches` - Get my catches (FISHER)
- GET `/api/catch/all` - Get all catches (AGENT/ADMIN)
- PUT `/api/catch/:id` - Update catch (FISHER)
- DELETE `/api/catch/:id` - Delete catch (FISHER)
- PATCH `/api/catch/:id/verify` - Verify catch (AGENT/ADMIN)

**Verification:**
- POST `/api/verify` - Verify QR code (Public)

**Orders:**
- POST `/api/order` - Create order (BUYER)
- GET `/api/order/my-orders` - Get my orders (BUYER)
- GET `/api/order/all` - Get all orders (ADMIN/AGENT)
- PATCH `/api/order/:id/payment` - Update payment (ADMIN)

**Delivery:**
- POST `/api/delivery` - Create delivery (ADMIN)
- GET `/api/delivery/order/:orderId` - Get delivery by order
- GET `/api/delivery/all` - Get all deliveries (ADMIN)
- GET `/api/delivery/my-deliveries` - Get my deliveries
- PATCH `/api/delivery/:id/status` - Update status
- PATCH `/api/delivery/:id/assign` - Assign delivery person (ADMIN)

**Users:**
- GET `/api/user/me` - Get my profile
- PUT `/api/user/me` - Update profile
- POST `/api/user/register-fisher` - Register fisher (AGENT)

**Payment:**
- POST `/api/chapa/pay` - Initiate payment

**System:**
- GET `/` - API information
- GET `/api/health` - Health check
- GET `/api/docs` - API documentation (Swagger)

### Appendix B: Data Models

**User Model:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251912345678",
  "role": "FISHER",
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**Catch Model:**
```json
{
  "id": 1,
  "fishName": "Tilapia",
  "weight": 2.5,
  "price": 150,
  "freshness": "Fresh",
  "lake": "Lake Tana",
  "fisherId": 1,
  "qrEncrypted": "U2FsdGVkX1...",
  "verified": true,
  "fisher": {
    "id": 1,
    "name": "John Doe",
    "phone": "+251912345678"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Order Model:**
```json
{
  "id": 1,
  "buyerId": 2,
  "catchId": 1,
  "paymentStatus": "PENDING",
  "date": "2024-01-15",
  "catch": { ... },
  "buyer": { ... },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## Document Approval

**Prepared By:** Development Team  
**Reviewed By:** [To be filled]  
**Approved By:** [To be filled]  
**Date:** December 2024

---

**End of Document**

