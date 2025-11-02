# Postman Testing Guide for FishLink API

This guide will help you test all API endpoints using Postman.

## Table of Contents
1. [Setup](#setup)
2. [Creating a Postman Collection](#creating-a-postman-collection)
3. [Environment Variables](#environment-variables)
4. [Testing Authentication Endpoints](#testing-authentication-endpoints)
5. [Testing Protected Endpoints](#testing-protected-endpoints)
6. [Complete Endpoint Examples](#complete-endpoint-examples)

---

## Setup

### Prerequisites
1. **Postman installed** - Download from [postman.com](https://www.postman.com/downloads/)
2. **Backend server running** - Make sure your backend is running on `http://localhost:5000`
3. **Database setup** - Ensure your PostgreSQL database is configured and running

### Base URL
```
http://localhost:5000/api
```

---

## Creating a Postman Collection

1. Open Postman
2. Click **New** → **Collection**
3. Name it "FishLink API"
4. Click the **three dots** (⋯) on the collection → **Edit**
5. Add a **Variables** tab with:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (leave empty, will be set automatically)

---

## Environment Variables

Create a Postman Environment for easier testing:

1. Click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it "FishLink Local"
4. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: (leave empty)
   - `user_id`: (leave empty)
   - `email`: (your test email)
   - `password`: (your test password)

5. **Save** and select this environment from the dropdown

**Usage**: Use `{{base_url}}`, `{{token}}`, etc. in your requests

---

## Testing Authentication Endpoints

### 1. Root Endpoint (No Auth Required)

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/`

**Response:**
```json
{
  "message": "FishLink API - Fresh Fish Trace Management System",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {...}
}
```

---

### 2. Register New User

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/register`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251912345678",
  "password": "password123",
  "role": "FISHER"
}
```

**Valid Roles:** `ADMIN`, `AGENT`, `FISHER`, `BUYER`

**Response (201):**
```json
{
  "message": "User registered successfully. Verification OTP sent to email.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251912345678",
    "role": "FISHER",
    "emailVerified": false
  }
}
```

**Note:** Check your email for the OTP code!

---

### 3. Verify OTP

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/verify-otp`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251912345678",
    "role": "FISHER",
    "emailVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANT:** Copy the `token` from the response and save it as `{{token}}` in your environment variables or collection variables!

---

### 4. Login with Email

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/login-email`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251912345678",
    "role": "FISHER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Save the token!**

---

### 5. Login with Phone

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/login`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "phone": "+251912345678",
  "password": "password123"
}
```

**Response (200):** Same format as login-email

---

### 6. Resend OTP

**Request:**
- Method: `POST`
- URL: `{{base_url}}/auth/send-otp`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "john@example.com",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully to your email",
  "email": "john@example.com"
}
```

---

## Testing Protected Endpoints

For protected endpoints, you need to include the JWT token in the Authorization header.

### Setting Up Authorization

1. In your request, go to the **Authorization** tab
2. Select **Type**: `Bearer Token`
3. Enter `{{token}}` in the Token field

OR manually add to Headers:
- Key: `Authorization`
- Value: `Bearer {{token}}`

---

## Complete Endpoint Examples

### Catch Endpoints (Protected)

#### Create Catch (FISHER only)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/catch`
- Authorization: `Bearer {{token}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "fishName": "Tilapia",
  "weight": 2.5,
  "price": 150,
  "freshness": "Fresh",
  "lake": "Lake Tana"
}
```

**Response (201):**
```json
{
  "message": "Catch registered successfully",
  "catch": {
    "id": 1,
    "fishName": "Tilapia",
    "weight": 2.5,
    "price": 150,
    "freshness": "Fresh",
    "lake": "Lake Tana",
    "fisherId": 1,
    "qrEncrypted": "U2FsdGVkX1...",
    "verified": false
  },
  "qrCode": "data:image/png;base64,iVBORw0KGgo...",
  "encryptedData": "U2FsdGVkX1..."
}
```

**Note:** Save the `encryptedData` for QR verification testing!

---

#### Get All Verified Catches (Authenticated Users)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/catch`
- Authorization: `Bearer {{token}}`
- Query Params (optional):
  - `lake`: Filter by lake name
  - `fishName`: Filter by fish name
  - `freshness`: Filter by freshness

**Example:**
```
GET {{base_url}}/catch?lake=Tana&fishName=Tilapia
```

**Response (200):**
```json
{
  "catches": [
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
      }
    }
  ]
}
```

---

#### Get My Catches (FISHER only)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/catch/my-catches`
- Authorization: `Bearer {{token}}`

**Response (200):** Same format as above

---

#### Update Catch (FISHER only)

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/catch/:id`
- Authorization: `Bearer {{token}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON - all fields optional):
```json
{
  "fishName": "Updated Tilapia",
  "weight": 3.0,
  "price": 180
}
```

**Response (200):**
```json
{
  "message": "Catch updated successfully",
  "catch": {...}
}
```

---

#### Delete Catch (FISHER only)

**Request:**
- Method: `DELETE`
- URL: `{{base_url}}/catch/:id`
- Authorization: `Bearer {{token}}`

**Response (200):**
```json
{
  "message": "Catch deleted successfully"
}
```

---

#### Verify Catch (AGENT/ADMIN only)

**Request:**
- Method: `PATCH`
- URL: `{{base_url}}/catch/:id/verify`
- Authorization: `Bearer {{token}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "verified": true
}
```

**Response (200):**
```json
{
  "message": "Catch verified successfully",
  "catch": {...}
}
```

---

#### Get All Catches (AGENT/ADMIN only)

**Request:**
- Method: `GET`
- URL: `{{base_url}}/catch/all`
- Authorization: `Bearer {{token}}`

**Response (200):** Returns all catches (verified and unverified)

---

### Verify QR Code (Public - No Auth)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/verify`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "encrypted": "U2FsdGVkX1..."
}
```

**Response (200):**
```json
{
  "verified": true,
  "catch": {
    "id": 1,
    "fishName": "Tilapia",
    "weight": 2.5,
    "price": 150,
    "freshness": "Fresh",
    "lake": "Lake Tana",
    "verified": true,
    "fisher": {
      "id": 1,
      "name": "John Doe",
      "phone": "+251912345678"
    }
  },
  "message": "Fish traceability verified successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid QR code or decryption failed",
  "message": "..."
}
```

---

### Order Endpoints

#### Create Order (BUYER only)

**Request:**
- Method: `POST`
- URL: `{{base_url}}/order`
- Authorization: `Bearer {{token}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "catchId": 1,
  "date": "2024-01-15"
}
```

**Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "buyerId": 2,
    "catchId": 1,
    "paymentStatus": "PENDING",
    "date": "2024-01-15"
  }
}
```

---

#### Get My Orders

**Request:**
- Method: `GET`
- URL: `{{base_url}}/order/my-orders`
- Authorization: `Bearer {{token}}`

**Response (200):**
```json
{
  "orders": [...]
}
```

---

### User Endpoints

#### Get My Profile

**Request:**
- Method: `GET`
- URL: `{{base_url}}/user/me`
- Authorization: `Bearer {{token}}`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251912345678",
    "role": "FISHER"
  }
}
```

---

#### Update Profile

**Request:**
- Method: `PUT`
- URL: `{{base_url}}/user/me`
- Authorization: `Bearer {{token}}`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "name": "John Updated",
  "phone": "+251998765432"
}
```

---

### Health Check

**Request:**
- Method: `GET`
- URL: `{{base_url}}/health`

**Response (200):**
```json
{
  "status": "ok",
  "message": "FishLink API is running"
}
```

---

## Postman Collection Setup Tips

### 1. Auto-Save Token

Create a **Test** script for login/verify-otp requests:

```javascript
// In the Tests tab of login/verify-otp requests
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.token) {
        pm.environment.set("token", jsonData.token);
        pm.collectionVariables.set("token", jsonData.token);
        console.log("Token saved:", jsonData.token);
    }
}
```

### 2. Pre-request Scripts

Add to collection level to set base URL:
```javascript
pm.request.url = pm.environment.get("base_url") + pm.request.url;
```

### 3. Folder Organization

Organize your collection:
```
FishLink API
├── Authentication
│   ├── Register
│   ├── Verify OTP
│   ├── Login Email
│   └── Login Phone
├── Catches
│   ├── Create Catch
│   ├── Get All Catches
│   ├── Get My Catches
│   ├── Update Catch
│   └── Delete Catch
├── Verification
│   └── Verify QR Code
└── Orders
    ├── Create Order
    └── Get My Orders
```

---

## Common Errors & Solutions

### 401 Unauthorized
- **Cause**: Missing or invalid token
- **Solution**: Make sure you've logged in and saved the token. Check Authorization header format: `Bearer {{token}}`

### 403 Forbidden
- **Cause**: Wrong user role for the endpoint
- **Solution**: Ensure your test user has the correct role (e.g., FISHER for catch creation)

### 400 Bad Request
- **Cause**: Missing required fields or invalid data
- **Solution**: Check the request body matches the required format

### 404 Not Found
- **Cause**: Invalid endpoint URL or resource doesn't exist
- **Solution**: Verify the URL path and ensure the resource exists

### 500 Internal Server Error
- **Cause**: Server-side error (database, etc.)
- **Solution**: Check backend logs for detailed error message

---

## Testing Workflow

### Complete Test Flow

1. **Register** a new user (or use existing)
2. **Verify OTP** to get token
3. **Create a catch** (as FISHER)
4. **Verify the catch** (as AGENT/ADMIN)
5. **Get all catches** (as BUYER)
6. **Create an order** (as BUYER)
7. **Verify QR code** with encrypted data from step 3

### Quick Test Users

Create test users for each role:
- **ADMIN**: Full access
- **AGENT**: Can verify catches
- **FISHER**: Can create/update catches
- **BUYER**: Can view catches and create orders

---

## Import Postman Collection

You can also import a Postman collection file (JSON format). If you have one, go to:
**Postman** → **Import** → Select your collection JSON file

---

## Additional Resources

- **API Documentation**: `http://localhost:5000/api/docs` (Swagger UI)
- **Backend Health**: `http://localhost:5000/api/health`
- **Root API Info**: `http://localhost:5000/`

---

## Tips for Efficient Testing

1. **Use Environments**: Create separate environments for dev/staging/prod
2. **Save Responses**: Use Postman's "Save Response" feature to compare responses
3. **Use Variables**: Leverage collection and environment variables for dynamic data
4. **Test Scripts**: Write automated tests in the "Tests" tab
5. **Collection Runner**: Run multiple requests in sequence using Collection Runner

---

Happy Testing! 🚀

