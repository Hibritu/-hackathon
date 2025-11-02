# Software Requirements Specification (SRS)
## FishLink - Fresh Fish Traceability & Marketplace Platform

**Version:** 1.0  
**Date:** December 2024  
**Document Status:** Final

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Architecture](#5-system-architecture)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Database Schema](#7-database-schema)
8. [API Specifications](#8-api-specifications)
9. [User Stories and Use Cases](#9-user-stories-and-use-cases)
10. [Security Requirements](#10-security-requirements)
11. [Deployment and Environment](#11-deployment-and-environment)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for **FishLink**, a comprehensive fish traceability and marketplace platform designed to connect fishermen, agents, buyers, and customers. The system ensures transparency, traceability, and fair trade in the fish supply chain using encrypted QR codes and modern web technologies.

### 1.2 Scope
FishLink is a full-stack web application that provides:
- Secure user registration and authentication with email verification
- Fish catch registration with encrypted QR code generation
- AI-powered fish freshness detection
- Agent-based fish verification and approval
- Order management and payment processing
- Delivery tracking system
- Public QR code verification for end consumers
- Role-based access control for multiple user types

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **QR Code**: Quick Response Code - encrypted barcode for fish traceability
- **AES-256**: Advanced Encryption Standard with 256-bit key
- **JWT**: JSON Web Token for authentication
- **OTP**: One-Time Password for email verification
- **ETB**: Ethiopian Birr (currency)
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **RBAC**: Role-Based Access Control

### 1.4 References
- Node.js Documentation
- Express.js Documentation
- React Documentation
- PostgreSQL Documentation
- Chapa Payment Gateway API
- Roboflow AI Model API

### 1.5 Overview
This document is organized into sections covering system overview, features, interfaces, architecture, database design, API specifications, and security requirements.

---

## 2. Overall Description

### 2.1 Product Perspective
FishLink is an independent web-based platform that interfaces with:
- **PostgreSQL Database**: Primary data storage
- **Chapa Payment Gateway**: Payment processing service
- **Roboflow AI Service**: Fish freshness detection using machine learning
- **Email Service (Nodemailer)**: OTP delivery for email verification

### 2.2 Product Functions
The system provides the following core functions:

1. **User Management**
   - Registration with email/phone
   - Email verification via OTP
   - Login (email or phone-based)
   - Profile management
   - Role-based access control

2. **Fish Catch Management**
   - Register new catches with details (fish name, weight, price, freshness, lake, national ID)
   - Generate encrypted QR codes for each catch
   - Edit and delete own catches (fisher)
   - Verify/approve catches (agent/admin)
   - Filter and search catches

3. **AI Freshness Detection**
   - Upload fish image for freshness analysis
   - Get AI-powered freshness assessment using Roboflow API
   - Display confidence scores and predictions

4. **Order Management**
   - Create orders for verified catches
   - Track order status and payment status
   - Filter orders by status
   - View order history

5. **Payment Processing**
   - Integrate with Chapa payment gateway
   - Process payments in ETB (Ethiopian Birr)
   - Handle payment callbacks and verification
   - Auto-create deliveries upon payment completion

6. **Delivery Tracking**
   - Create delivery records for orders
   - Assign delivery personnel
   - Track delivery status (PENDING, PICKED, IN_TRANSIT, DELIVERED, FAILED)
   - Update delivery timestamps automatically

7. **QR Code Verification**
   - Public endpoint to verify fish QR codes
   - Decrypt QR code data
   - Display fish traceability information
   - Show verification status

### 2.3 User Classes and Characteristics

1. **FISHER**
   - Registers fish catches
   - Views and manages own catches
   - Generates QR codes for catches
   - Can edit/delete own catches

2. **BUYER**
   - Views verified fish listings
   - Places orders for fish
   - Makes payments via Chapa
   - Tracks own orders and deliveries

3. **AGENT**
   - Registers new fishers
   - Verifies and approves fish catches
   - Views all catches (verified and unverified)
   - Manages catches

4. **ADMIN**
   - Full system access
   - Verifies/unverifies catches
   - Manages all orders and payments
   - Creates and assigns deliveries
   - Monitors platform statistics
   - Manages users

5. **DELIVERY_PERSON** (Implicit role)
   - Assigned to deliveries
   - Updates delivery status
   - Views assigned deliveries

6. **PUBLIC USER**
   - Accesses public QR verification page
   - Scans QR codes to verify fish origin
   - No authentication required for verification

### 2.4 Operating Environment

**Backend:**
- Node.js runtime environment
- PostgreSQL database server
- Express.js web framework
- Linux/Windows/macOS compatible

**Frontend:**
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- Internet connection required

### 2.5 Design and Implementation Constraints
- Must use PostgreSQL database
- Must support JWT-based authentication
- Must encrypt QR codes using AES-256
- Must integrate with Chapa payment gateway
- Must support mobile-responsive design
- API must follow RESTful principles

### 2.6 Assumptions and Dependencies
- Users have valid email addresses and/or phone numbers
- Internet connectivity is available
- PostgreSQL database is accessible
- Chapa payment gateway credentials are configured
- Roboflow API key is available for freshness detection
- Email service (SMTP) is configured for OTP delivery

---

## 3. System Features

### 3.1 User Authentication and Authorization

#### 3.1.1 User Registration
- **Priority**: High
- **Description**: Users can register with name, email, phone (optional), password, and role
- **Input**: name, email, password, phone (optional), role
- **Processing**: 
  - Validate email format
  - Check for existing users (email or phone)
  - Hash password using bcrypt
  - Create user record with email_verified = false
  - Generate OTP and send via email
- **Output**: User created, OTP sent to email

#### 3.1.2 Email Verification
- **Priority**: High
- **Description**: Users verify email using OTP received via email
- **Input**: email, otp
- **Processing**:
  - Verify OTP matches stored OTP
  - Check OTP expiration (time-based)
  - Mark email as verified
  - Generate JWT token
- **Output**: Email verified, JWT token returned for immediate login

#### 3.1.3 User Login
- **Priority**: High
- **Description**: Users can login using email+password or phone+password
- **Input**: email/phone, password
- **Processing**:
  - Validate credentials
  - Check email verification status
  - Verify password using bcrypt
  - Generate JWT token (expires in 7 days)
- **Output**: JWT token and user information

#### 3.1.4 Resend OTP
- **Priority**: Medium
- **Description**: Users can request new OTP if email verification fails
- **Input**: email, name (optional)
- **Processing**: Generate new OTP and send via email
- **Output**: New OTP sent

### 3.2 Fish Catch Management

#### 3.2.1 Register Catch (Fisher)
- **Priority**: High
- **Description**: Fishers register new fish catches with details
- **Input**: fishName (optional), weight, price, freshness, lake, nationalId (optional)
- **Processing**:
  - Validate required fields
  - Create catch record with verified = false
  - Encrypt catch ID using AES-256
  - Generate QR code from encrypted data
  - Store encrypted QR data in database
- **Output**: Catch created, QR code image (data URL), encrypted data

#### 3.2.2 View All Verified Catches (Buyer)
- **Priority**: High
- **Description**: Buyers can view all verified fish listings
- **Input**: Optional query parameters (lake, fishName, freshness, nationalId)
- **Processing**: Query database for verified catches with optional filters
- **Output**: List of verified catches with fisher information

#### 3.2.3 View Own Catches (Fisher)
- **Priority**: High
- **Description**: Fishers view their own catches (verified and unverified)
- **Input**: None (uses authenticated user ID)
- **Processing**: Query catches where fisher_id = current user
- **Output**: List of user's catches

#### 3.2.4 Update Catch (Fisher)
- **Priority**: Medium
- **Description**: Fishers can update their own catch details
- **Input**: Catch ID, updated fields (fishName, weight, price, freshness, lake)
- **Processing**:
  - Verify catch ownership
  - Update specified fields
  - Preserve QR code (not regenerated)
- **Output**: Updated catch information

#### 3.2.5 Delete Catch (Fisher)
- **Priority**: Medium
- **Description**: Fishers can delete their own catches
- **Input**: Catch ID
- **Processing**: Verify ownership, delete catch record
- **Output**: Confirmation message

#### 3.2.6 Verify Catch (Agent/Admin)
- **Priority**: High
- **Description**: Agents/Admins verify catches to make them visible to buyers
- **Input**: Catch ID, verified (boolean)
- **Processing**: Update catch.verified field
- **Output**: Updated catch with verification status

#### 3.2.7 View All Catches (Agent/Admin)
- **Priority**: High
- **Description**: Agents/Admins view all catches regardless of verification status
- **Input**: None
- **Processing**: Query all catches with fisher information
- **Output**: List of all catches

### 3.3 AI Freshness Detection

#### 3.3.1 Detect Freshness from Image Upload
- **Priority**: Medium
- **Description**: Upload fish image for AI-powered freshness detection
- **Input**: Image file (JPEG, PNG, GIF, max 10MB)
- **Processing**:
  - Validate file type and size
  - Convert image to base64
  - Send to Roboflow API
  - Process predictions and extract freshness class
- **Output**: Freshness result (Fresh/Stale/Rotten), confidence score, all predictions

#### 3.3.2 Detect Freshness from URL
- **Priority**: Low
- **Description**: Analyze fish freshness from image URL
- **Input**: imageUrl
- **Processing**: Send image URL to Roboflow API
- **Output**: Freshness result with confidence scores

### 3.4 Order Management

#### 3.4.1 Create Order (Buyer)
- **Priority**: High
- **Description**: Buyers create orders for verified catches
- **Input**: catchId
- **Processing**:
  - Verify catch exists and is verified
  - Create order with payment_status = 'PENDING'
  - Return order details
- **Output**: Order created with PENDING payment status

#### 3.4.2 View Own Orders (Buyer)
- **Priority**: High
- **Description**: Buyers view their order history
- **Input**: Optional status filter (PENDING, COMPLETED, FAILED)
- **Processing**: Query orders for current user
- **Output**: List of buyer's orders with catch and fisher details

#### 3.4.3 View All Orders (Admin)
- **Priority**: Medium
- **Description**: Admins view all orders in the system
- **Input**: Optional status filter
- **Processing**: Query all orders with buyer and catch information
- **Output**: List of all orders

#### 3.4.4 Update Payment Status (Admin)
- **Priority**: High
- **Description**: Admins manually update order payment status
- **Input**: Order ID, paymentStatus
- **Processing**: Update order.payment_status
- **Output**: Updated order

### 3.5 Payment Processing

#### 3.5.1 Create Order and Initiate Payment
- **Priority**: High
- **Description**: Create order and initialize Chapa payment in one transaction
- **Input**: catchId
- **Processing**:
  - Create order
  - Initialize Chapa payment with order details
  - Generate transaction reference (tx-{orderId}-{timestamp})
  - Return checkout URL
- **Output**: Order created, payment checkout URL

#### 3.5.2 Payment Callback Handler
- **Priority**: High
- **Description**: Handle Chapa payment callback after payment completion
- **Input**: tx_ref, status
- **Processing**:
  - Extract order ID from transaction reference
  - Update order payment_status to COMPLETED or FAILED
  - Auto-create delivery for completed orders
- **Output**: Payment status updated, delivery created if successful

#### 3.5.3 Manual Payment Verification
- **Priority**: Medium
- **Description**: Manually verify payment status via Chapa API
- **Input**: tx_ref
- **Processing**: Query Chapa API for transaction status, update order accordingly
- **Output**: Payment verification result

### 3.6 Delivery Management

#### 3.6.1 Create Delivery (Admin)
- **Priority**: High
- **Description**: Admins create delivery records for orders
- **Input**: orderId, deliveryPersonId (optional), notes (optional)
- **Processing**:
  - Verify order exists
  - Check for existing delivery
  - Create delivery with status = 'PENDING'
- **Output**: Delivery created

#### 3.6.2 Update Delivery Status
- **Priority**: High
- **Description**: Update delivery status (Admin or assigned delivery person)
- **Input**: Delivery ID, status, notes (optional)
- **Processing**:
  - Verify authorization (admin or assigned delivery person)
  - Update status
  - Auto-set timestamps:
    - picked_at when status is PICKED or IN_TRANSIT
    - delivered_at when status is DELIVERED
- **Output**: Updated delivery

#### 3.6.3 Assign Delivery Person (Admin)
- **Priority**: Medium
- **Description**: Assign delivery personnel to deliveries
- **Input**: Delivery ID, deliveryPersonId
- **Processing**: Update delivery.delivery_person_id
- **Output**: Delivery person assigned

#### 3.6.4 View Delivery by Order (Authorized Users)
- **Priority**: Medium
- **Description**: View delivery information for an order
- **Input**: orderId
- **Processing**: Query delivery, verify authorization (buyer, fisher, delivery person, or admin)
- **Output**: Delivery details with assigned person information

#### 3.6.5 View All Deliveries (Admin)
- **Priority**: Medium
- **Description**: Admins view all deliveries in the system
- **Input**: None
- **Processing**: Query all deliveries
- **Output**: List of all deliveries

#### 3.6.6 View My Deliveries (Delivery Person)
- **Priority**: Medium
- **Description**: Delivery personnel view assigned deliveries
- **Input**: None (uses authenticated user ID)
- **Processing**: Query deliveries where delivery_person_id = current user
- **Output**: List of assigned deliveries

### 3.7 QR Code Verification

#### 3.7.1 Verify QR Code (Public)
- **Priority**: High
- **Description**: Public endpoint to verify fish QR codes (no authentication required)
- **Input**: encrypted (QR code encrypted data)
- **Processing**:
  - Decrypt QR code data using AES-256
  - Extract catch ID
  - Query catch details from database
  - Return traceability information
- **Output**: Catch details, fisher information, verification status

### 3.8 User Management

#### 3.8.1 View User Profile
- **Priority**: Medium
- **Description**: Users view their own profile or admins view any profile
- **Input**: User ID
- **Processing**:
  - Verify authorization
  - Query user information
  - Include catches if user is FISHER
  - Include orders if user is BUYER
- **Output**: User profile with associated data

#### 3.8.2 Register Fisher (Agent)
- **Priority**: Medium
- **Description**: Agents register new fishers in the system
- **Input**: name, phone, password
- **Processing**:
  - Check for existing user
  - Hash password
  - Create user with role = 'FISHER'
- **Output**: Fisher registered

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Web Application
- **Technology**: React.js with Tailwind CSS
- **Design**: Modern, responsive, mobile-first
- **Theme**: Blue and turquoise color scheme (water/fishing inspired)
- **Features**:
  - Dark mode support
  - Multi-language support (via LanguageContext)
  - Toast notifications for user feedback
  - Responsive navigation bar and footer
  - Role-based dashboard views

#### 4.1.2 Key Pages
1. **Home Page**: Landing page with system overview
2. **Login/Register**: Authentication pages
3. **Verify OTP**: Email verification page
4. **Dashboard**: Role-based dashboard (Buyer/Fisher/Agent/Admin)
5. **Catches**: Browse verified fish listings
6. **My Catches**: Fisher's catch management
7. **Orders**: Order management and history
8. **Deliveries**: Delivery tracking
9. **Verify QR**: Public QR code verification page
10. **Freshness Detector**: AI-powered freshness analysis page
11. **Admin Dashboard**: Administrative controls
12. **Agent Dashboard**: Agent-specific controls

### 4.2 Hardware Interfaces
- Standard web browser on desktop or mobile device
- Camera access for QR code scanning (optional)
- Image upload capability for freshness detection

### 4.3 Software Interfaces

#### 4.3.1 Database
- **Type**: PostgreSQL
- **Connection**: Connection pooling via `pg` library
- **Schema**: Defined in `db/schema.sql`

#### 4.3.2 Payment Gateway
- **Service**: Chapa Payment Gateway
- **API Endpoint**: `https://api.chapa.co/v1/transaction/`
- **Methods**: 
  - POST `/initialize` - Initialize payment
  - POST `/callback` - Payment callback
  - GET `/verify/{tx_ref}` - Verify payment

#### 4.3.3 AI Service
- **Service**: Roboflow
- **API Endpoint**: `https://detect.roboflow.com/fish-freshness-vyn9g/1`
- **Method**: POST (with base64 image or image URL)
- **Model**: Fish Freshness Detection Model (v1)

#### 4.3.4 Email Service
- **Provider**: Nodemailer (configurable SMTP)
- **Purpose**: Send OTP emails for verification

### 4.4 Communication Interfaces
- **Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **API**: RESTful architecture
- **Authentication**: Bearer Token (JWT) in Authorization header

---

## 5. System Architecture

### 5.1 Architecture Overview
FishLink follows a **three-tier architecture**:

1. **Presentation Tier**: React.js frontend (Vite)
2. **Application Tier**: Node.js/Express.js backend
3. **Data Tier**: PostgreSQL database

### 5.2 Backend Architecture

```
Backend/
├── server.js              # Main Express server
├── routes/                # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── catch.js          # Catch management routes
│   ├── order.js          # Order management routes
│   ├── order-payment.js  # Order + payment integration
│   ├── delivery.js       # Delivery management routes
│   ├── user.js           # User management routes
│   ├── verify.js         # QR verification routes
│   ├── chapa.js          # Payment gateway routes
│   └── fish-freshness.js # AI freshness detection
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── db/
│   ├── connection.js     # Database connection pool
│   └── schema.sql        # Database schema
├── utils/
│   ├── email.js          # Email/OTP utilities
│   └── otpStore.js       # OTP storage and verification
└── swagger.js            # API documentation setup
```

### 5.3 Frontend Architecture

```
Frontend/
├── src/
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # Entry point
│   ├── components/
│   │   └── Layout.jsx    # Main layout wrapper
│   ├── pages/            # Page components
│   ├── context/          # React context providers
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── LanguageContext.jsx
│   ├── services/
│   │   └── api.js        # Axios API client
│   └── translations/
│       └── index.js      # Translation strings
```

### 5.4 Security Architecture
- **Authentication**: JWT tokens (7-day expiration)
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 for QR codes
- **Password Security**: bcrypt hashing (10 rounds)
- **HTTPS**: Required in production

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements
- API response time: < 500ms for standard queries
- Page load time: < 3 seconds on standard internet connection
- Database queries: Optimized with indexes on frequently queried columns
- Concurrent users: Support at least 100 concurrent users

### 6.2 Security Requirements
- All passwords must be hashed using bcrypt
- JWT tokens must expire after 7 days
- QR codes must be encrypted using AES-256
- API endpoints must be protected with authentication middleware
- Role-based access control enforced on all protected routes
- HTTPS required in production
- SQL injection prevention via parameterized queries

### 6.3 Reliability Requirements
- System uptime: 99.5% availability
- Error handling: Graceful error messages for users
- Data validation: Input validation on all user inputs
- Transaction integrity: Database transactions for critical operations

### 6.4 Usability Requirements
- Responsive design for mobile and desktop
- Intuitive user interface
- Clear error messages
- Loading indicators for async operations
- Toast notifications for user feedback
- Dark mode support
- Multi-language support framework

### 6.5 Scalability Requirements
- Database connection pooling
- Stateless API design (JWT-based)
- Modular code structure for easy extension
- Support for horizontal scaling

### 6.6 Portability Requirements
- Cross-platform compatibility (Windows, Linux, macOS)
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design

---

## 7. Database Schema

### 7.1 Users Table
```sql
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(150) NOT NULL,
  phone           VARCHAR(30),
  email           VARCHAR(255) UNIQUE,
  password        VARCHAR(255),
  role            VARCHAR(30) NOT NULL DEFAULT 'BUYER',
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key
- `name`: User's full name
- `phone`: Phone number (optional, unique if provided)
- `email`: Email address (unique, primary identifier)
- `password`: Hashed password (bcrypt)
- `role`: User role (FISHER, BUYER, AGENT, ADMIN)
- `email_verified`: Email verification status
- `created_at`: Account creation timestamp

### 7.2 Catches Table
```sql
CREATE TABLE catches (
  id           SERIAL PRIMARY KEY,
  fish_name    VARCHAR(150) NULL,
  weight       NUMERIC(10,2) NOT NULL,
  price        NUMERIC(12,2) NOT NULL,
  freshness    VARCHAR(50) NOT NULL,
  lake         VARCHAR(100) NOT NULL,
  fisher_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qr_encrypted TEXT,
  verified     BOOLEAN NOT NULL DEFAULT FALSE,
  national_id  VARCHAR(50),
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_catches_verified` on `verified`
- `idx_catches_fisher` on `fisher_id`
- `idx_catches_lake` on `lake`

**Fields:**
- `id`: Primary key
- `fish_name`: Type of fish (optional)
- `weight`: Fish weight in kg
- `price`: Price in ETB
- `freshness`: Freshness level (Fresh/Stale/Rotten)
- `lake`: Source lake name
- `fisher_id`: Foreign key to users (fisher)
- `qr_encrypted`: AES-256 encrypted QR code data
- `verified`: Verification status (Agent/Admin approval)
- `national_id`: National ID for traceability (optional)
- `created_at`, `updated_at`: Timestamps

### 7.3 Orders Table
```sql
CREATE TABLE orders (
  id            SERIAL PRIMARY KEY,
  buyer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  catch_id     INTEGER NOT NULL REFERENCES catches(id) ON DELETE CASCADE,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  date         DATE DEFAULT CURRENT_DATE,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Payment Status Values:**
- `PENDING`: Payment not completed
- `COMPLETED`: Payment successful
- `FAILED`: Payment failed

**Fields:**
- `id`: Primary key
- `buyer_id`: Foreign key to users (buyer)
- `catch_id`: Foreign key to catches
- `payment_status`: Current payment status
- `date`: Order date
- `created_at`, `updated_at`: Timestamps

### 7.4 Deliveries Table
```sql
CREATE TABLE deliveries (
  id                  SERIAL PRIMARY KEY,
  order_id            INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  delivery_person_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  notes               TEXT,
  picked_at           TIMESTAMP WITH TIME ZONE,
  delivered_at        TIMESTAMP WITH TIME ZONE,
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

**Status Values:**
- `PENDING`: Delivery created, not picked up
- `PICKED`: Item picked up from source
- `IN_TRANSIT`: Currently in transit
- `DELIVERED`: Successfully delivered
- `FAILED`: Delivery failed

**Fields:**
- `id`: Primary key
- `order_id`: Foreign key to orders (unique, one delivery per order)
- `delivery_person_id`: Foreign key to users (delivery person, nullable)
- `status`: Current delivery status
- `notes`: Additional delivery notes
- `picked_at`: Timestamp when item was picked up
- `delivered_at`: Timestamp when item was delivered
- `created_at`, `updated_at`: Timestamps

---

## 8. API Specifications

### 8.1 Authentication Endpoints

#### POST `/api/auth/register`
Register new user and send OTP.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251900000000",
  "password": "password123",
  "role": "BUYER"
}
```

**Response:** 201 Created
```json
{
  "message": "User registered successfully. Verification OTP sent to email.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251900000000",
    "role": "BUYER",
    "emailVerified": false
  }
}
```

#### POST `/api/auth/verify-otp`
Verify email OTP and activate account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:** 200 OK
```json
{
  "message": "Email verified successfully",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login with phone and password.

**Request Body:**
```json
{
  "phone": "+251900000000",
  "password": "password123"
}
```

#### POST `/api/auth/login-email`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** 200 OK
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/send-otp`
Resend OTP to email.

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe"
}
```

### 8.2 Catch Endpoints

#### POST `/api/catch` (Authenticated: FISHER)
Create new catch.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fishName": "Tilapia",
  "weight": 2.5,
  "price": 150.00,
  "freshness": "Fresh",
  "lake": "Lake Tana",
  "nationalId": "ID123456"
}
```

**Response:** 201 Created
```json
{
  "message": "Catch registered successfully",
  "catch": { ... },
  "qrCode": "data:image/png;base64,...",
  "encryptedData": "encrypted_string"
}
```

#### GET `/api/catch`
Get all verified catches (public, with optional filters).

**Query Parameters:**
- `lake`: Filter by lake name
- `fishName`: Filter by fish name
- `freshness`: Filter by freshness
- `nationalId`: Filter by national ID

**Response:** 200 OK
```json
{
  "catches": [ ... ]
}
```

#### GET `/api/catch/my-catches` (Authenticated: FISHER)
Get fisher's own catches.

#### PUT `/api/catch/:id` (Authenticated: FISHER)
Update catch (owner only).

#### DELETE `/api/catch/:id` (Authenticated: FISHER)
Delete catch (owner only).

#### PATCH `/api/catch/:id/verify` (Authenticated: AGENT/ADMIN)
Verify/unverify catch.

**Request Body:**
```json
{
  "verified": true
}
```

#### GET `/api/catch/all` (Authenticated: AGENT/ADMIN)
Get all catches regardless of verification status.

### 8.3 Order Endpoints

#### POST `/api/order` (Authenticated: BUYER)
Create new order.

**Request Body:**
```json
{
  "catchId": 1
}
```

**Response:** 201 Created
```json
{
  "message": "Order created successfully",
  "order": { ... }
}
```

#### GET `/api/order/my-orders` (Authenticated: BUYER)
Get buyer's orders.

**Query Parameters:**
- `status`: Filter by payment status (PENDING, COMPLETED, FAILED)

#### GET `/api/order/all` (Authenticated: ADMIN)
Get all orders.

#### PATCH `/api/order/:id/payment` (Authenticated: ADMIN)
Update payment status.

**Request Body:**
```json
{
  "paymentStatus": "COMPLETED"
}
```

### 8.4 Payment Endpoints

#### POST `/api/order-payment/create-and-pay` (Authenticated: BUYER)
Create order and initialize Chapa payment.

**Request Body:**
```json
{
  "catchId": 1
}
```

**Response:** 201 Created
```json
{
  "message": "Order created and payment initialized",
  "order": { ... },
  "payment": {
    "tx_ref": "tx-1-1234567890",
    "checkout_url": "https://checkout.chapa.co/...",
    "status": "success"
  }
}
```

#### POST `/api/chapa/callback`
Chapa payment callback (no auth required, webhook).

**Request Body:**
```json
{
  "tx_ref": "tx-1-1234567890",
  "status": "success"
}
```

#### GET `/api/chapa/verify/:tx_ref`
Manually verify payment.

### 8.5 Delivery Endpoints

#### POST `/api/delivery` (Authenticated: ADMIN)
Create delivery for order.

**Request Body:**
```json
{
  "orderId": 1,
  "deliveryPersonId": 5,
  "notes": "Handle with care"
}
```

#### PATCH `/api/delivery/:id/status` (Authenticated: ADMIN or Delivery Person)
Update delivery status.

**Request Body:**
```json
{
  "status": "PICKED",
  "notes": "Picked up from lake"
}
```

#### PATCH `/api/delivery/:id/assign` (Authenticated: ADMIN)
Assign delivery person.

**Request Body:**
```json
{
  "deliveryPersonId": 5
}
```

#### GET `/api/delivery/order/:orderId` (Authenticated: Buyer/Fisher/Delivery Person/Admin)
Get delivery by order ID.

#### GET `/api/delivery/all` (Authenticated: ADMIN)
Get all deliveries.

#### GET `/api/delivery/my-deliveries` (Authenticated: Delivery Person)
Get assigned deliveries.

### 8.6 Verification Endpoints

#### POST `/api/verify` (Public, no auth)
Verify QR code.

**Request Body:**
```json
{
  "encrypted": "encrypted_qr_data"
}
```

**Response:** 200 OK
```json
{
  "verified": true,
  "catch": {
    "id": 1,
    "fishName": "Tilapia",
    "weight": 2.5,
    "price": 150.00,
    "freshness": "Fresh",
    "lake": "Lake Tana",
    "verified": true,
    "fisher": { ... },
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Fish traceability verified successfully"
}
```

### 8.7 Fish Freshness Endpoints

#### POST `/api/fish-freshness/detect` (Public)
Detect freshness from uploaded image.

**Request:** Multipart form data with `image` file

**Response:** 200 OK
```json
{
  "freshness": "Fresh",
  "confidence": 0.95,
  "confidencePercent": "95.00",
  "message": "The fish is likely Fresh (95.00% confident).",
  "allPredictions": [ ... ],
  "analyzedAt": "2024-01-01T00:00:00Z"
}
```

#### POST `/api/fish-freshness/detect-url`
Detect freshness from image URL.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/fish.jpg"
}
```

### 8.8 User Endpoints

#### GET `/api/user/:id` (Authenticated)
Get user profile.

#### POST `/api/user/register-fisher` (Authenticated: AGENT)
Register new fisher.

**Request Body:**
```json
{
  "name": "Fisher Name",
  "phone": "+251900000000",
  "password": "password123"
}
```

### 8.9 Health Check

#### GET `/api/health` (Public)
System health check.

**Response:** 200 OK
```json
{
  "status": "ok",
  "message": "FishLink API is running"
}
```

---

## 9. User Stories and Use Cases

### 9.1 User Stories

**As a FISHER:**
- I want to register my fish catches so that they can be sold on the platform
- I want to generate QR codes for my catches so that buyers can verify authenticity
- I want to view and manage my catches so that I can update or delete them
- I want to see which of my catches are verified so that I know they're available for sale

**As a BUYER:**
- I want to browse verified fish listings so that I can find fresh fish to buy
- I want to filter catches by lake, fish type, and freshness so that I can find what I need
- I want to place orders and make payments securely so that I can purchase fish
- I want to track my orders and deliveries so that I know when to expect my purchase

**As an AGENT:**
- I want to register new fishers so that they can use the platform
- I want to verify fish catches so that only genuine catches are sold
- I want to view all catches (verified and unverified) so that I can manage them
- I want to see catch details including fisher information for verification

**As an ADMIN:**
- I want to manage all users, catches, orders, and deliveries so that I can oversee the platform
- I want to update payment statuses so that orders can be processed correctly
- I want to create and assign deliveries so that orders can be fulfilled
- I want to view platform statistics so that I can monitor system health

**As a DELIVERY PERSON:**
- I want to view my assigned deliveries so that I know what to deliver
- I want to update delivery status so that buyers can track their orders
- I want to see buyer and order information so that I can complete deliveries

**As a PUBLIC USER:**
- I want to scan QR codes on fish products so that I can verify their origin and authenticity
- I want to see fish traceability information so that I can make informed purchasing decisions

### 9.2 Use Case: Complete Order Flow

**Actors:** Buyer, Fisher, Agent, Admin, Payment Gateway, Delivery Person

**Main Success Scenario:**
1. Fisher registers catch → Catch created with QR code, status: unverified
2. Agent verifies catch → Catch status: verified, visible to buyers
3. Buyer browses catches → Views verified catch
4. Buyer creates order → Order created, status: PENDING
5. Buyer initiates payment → Chapa payment initialized, checkout URL provided
6. Buyer completes payment → Chapa callback received, order status: COMPLETED
7. System auto-creates delivery → Delivery created, status: PENDING
8. Admin assigns delivery person → Delivery assigned
9. Delivery person picks up → Delivery status: PICKED
10. Delivery person delivers → Delivery status: DELIVERED

**Alternative Flows:**
- Payment fails → Order status: FAILED, no delivery created
- Catch not verified → Buyer cannot create order
- Delivery fails → Delivery status: FAILED

---

## 10. Security Requirements

### 10.1 Authentication Security
- All passwords must be hashed using bcrypt (10 rounds)
- JWT tokens must be signed with secret key
- JWT tokens expire after 7 days
- Email verification required before login
- OTP expires after configured time period

### 10.2 Authorization Security
- Role-based access control enforced on all protected routes
- Users can only access their own resources (catches, orders)
- Admins have full system access
- Agents can verify catches and register fishers
- Buyers can only create orders for verified catches

### 10.3 Data Security
- QR codes encrypted using AES-256 encryption
- Database passwords stored as bcrypt hashes (never plain text)
- JWT secrets must be strong and stored in environment variables
- All sensitive data in environment variables (not in code)
- HTTPS required in production

### 10.4 API Security
- All protected endpoints require JWT token in Authorization header
- Input validation on all user inputs
- SQL injection prevention via parameterized queries
- CORS enabled for frontend domain
- Rate limiting recommended for production

### 10.5 File Upload Security
- Image file size limit: 10MB
- Allowed file types: JPEG, PNG, GIF
- File validation before processing
- Uploaded files cleaned up after processing

---

## 11. Deployment and Environment

### 11.1 Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fishlink"
SECRET_KEY="aes-256-encryption-key-minimum-32-characters"
JWT_SECRET="jwt-secret-key-minimum-32-characters"
PORT=5000
NODE_ENV=development
CHAPA_SECRET_KEY="chapa-api-secret-key"
ROBOFLOW_API_KEY="roboflow-api-key"
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="smtp-username"
SMTP_PASS="smtp-password"
ALLOW_DB_RESET=false
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
```

### 11.2 Database Setup
1. Create PostgreSQL database
2. Run migration: `npm run db:migrate`
3. (Optional) Seed admin user: `npm run db:seed:admin`

### 11.3 Deployment Steps

**Backend:**
1. Install dependencies: `npm install`
2. Configure `.env` file
3. Run database migrations
4. Start server: `npm start` (production) or `npm run dev` (development)

**Frontend:**
1. Install dependencies: `npm install`
2. Configure environment variables
3. Build for production: `npm run build`
4. Serve static files or deploy to hosting service

### 11.4 Production Considerations
- Use HTTPS for all connections
- Set strong secret keys (JWT_SECRET, SECRET_KEY)
- Enable database SSL connections
- Configure proper CORS origins
- Set up monitoring and logging
- Implement rate limiting
- Regular database backups
- Environment variable security

---

## Appendix A: API Response Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Appendix B: Role Permissions Matrix

| Feature | FISHER | BUYER | AGENT | ADMIN |
|---------|--------|-------|-------|-------|
| Register catch | ✓ | ✗ | ✗ | ✗ |
| View own catches | ✓ | ✗ | ✗ | ✗ |
| Edit own catch | ✓ | ✗ | ✗ | ✗ |
| Delete own catch | ✓ | ✗ | ✗ | ✗ |
| View verified catches | ✓ | ✓ | ✓ | ✓ |
| View all catches | ✗ | ✗ | ✓ | ✓ |
| Verify catch | ✗ | ✗ | ✓ | ✓ |
| Create order | ✗ | ✓ | ✗ | ✗ |
| View own orders | ✗ | ✓ | ✗ | ✗ |
| View all orders | ✗ | ✗ | ✗ | ✓ |
| Update payment status | ✗ | ✗ | ✗ | ✓ |
| Create delivery | ✗ | ✗ | ✗ | ✓ |
| Assign delivery person | ✗ | ✗ | ✗ | ✓ |
| Update delivery status | ✗ | ✗ | ✗ | ✓ (or assigned person) |
| Register fisher | ✗ | ✗ | ✓ | ✓ |
| View user profile | Own | Own | ✗ | All |

---

**Document End**

