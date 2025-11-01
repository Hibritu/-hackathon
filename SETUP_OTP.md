# FishLink OTP Setup Guide

This guide explains how to set up the OTP (One-Time Password) email verification system for FishLink using Gmail and Neon PostgreSQL.

## Prerequisites

1. **Neon PostgreSQL Database** (Already configured)
2. **Gmail Account with App Password** (Already configured)
3. **Node.js** installed on your system

## Backend Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

This will install the new `nodemailer` package along with existing dependencies.

### 2. Configure Environment Variables

Your `.env` file should contain:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_6pA2smqowDXZ@ep-lingering-dream-aevwj82n-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

# Security Keys
JWT_SECRET=d9e3e0e44cc96f54e77c2035a2d1000397a4a876d637a883d01a3b95b28c16ecf1d594186a3b3f11d044105e26ca6a42fc775289a17228af61f1d5373a0d52b7
SECRET_KEY=ffaa514759658008e6897b289628326b

# Gmail Configuration for OTP
EMAIL_USER=diresshibritu1@gmail.com
EMAIL_PASSWORD=wvyvdqnubbxwbdfn

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Update Database Schema

Run the migration to add email fields to the users table:

```bash
npm run db:migrate
```

Or manually run the migration script:

```bash
node scripts/add-email-column.js
```

### 4. Start the Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Start the Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or the port Vite assigns)

## How OTP Registration Works

### User Flow:

1. **Step 1: Email Entry**
   - User enters their name and email address
   - Clicks "Send OTP"
   - Backend validates email and sends a 6-digit OTP to the email

2. **Step 2: OTP Verification**
   - User receives email with OTP code
   - Enters the 6-digit code
   - OTP is valid for 10 minutes
   - Can resend OTP if needed

3. **Step 3: Complete Registration**
   - User enters phone number, selects role, and creates password
   - Backend verifies OTP and creates account
   - User is automatically logged in

### API Endpoints:

- `POST /api/auth/send-otp` - Send OTP to email
  ```json
  {
    "email": "user@example.com",
    "name": "User Name"
  }
  ```

- `POST /api/auth/register` - Register with OTP verification
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "phone": "+251912345678",
    "password": "password123",
    "role": "BUYER",
    "otp": "123456"
  }
  ```

## Email Configuration

### Gmail App Password Setup:

Your Gmail account is already configured with an app password. If you need to generate a new one:

1. Go to Google Account Settings
2. Security → 2-Step Verification
3. App passwords
4. Generate new app password for "Mail"
5. Update `EMAIL_PASSWORD` in `.env`

## Database Schema Changes

New fields added to `users` table:
- `email` (VARCHAR 255) - User's email address
- `email_verified` (BOOLEAN) - Email verification status

## Security Features

- ✅ OTP expires after 10 minutes
- ✅ OTP is stored in-memory (can be moved to Redis for production)
- ✅ Email validation before sending OTP
- ✅ Duplicate email/phone check
- ✅ Password hashing with bcrypt
- ✅ JWT authentication

## Testing

1. Start both backend and frontend servers
2. Navigate to the registration page
3. Enter your email address
4. Check your email for the OTP code
5. Complete the registration process

## Troubleshooting

### Email not sending:
- Check Gmail credentials in `.env`
- Ensure app password is correct (not regular password)
- Check if 2-Step Verification is enabled on Gmail
- Check backend console for error messages

### OTP expired:
- OTP is valid for 10 minutes
- Click "Resend OTP" to get a new code

### Database connection issues:
- Verify Neon PostgreSQL connection string
- Check if database is accessible
- Run migrations if tables don't exist

## Production Considerations

For production deployment:

1. **Use Redis for OTP storage** instead of in-memory
2. **Add rate limiting** to prevent OTP spam
3. **Use environment-specific email templates**
4. **Add email delivery monitoring**
5. **Consider SMS OTP** as alternative/backup
6. **Implement CAPTCHA** to prevent abuse

## File Structure

```
Backend/
├── utils/
│   ├── email.js          # Email sending utility
│   └── otpStore.js       # OTP storage and verification
├── routes/
│   └── auth.js           # Updated with OTP endpoints
├── scripts/
│   └── add-email-column.js  # Database migration
└── .env                  # Environment variables

Frontend/
└── src/
    └── pages/
        └── Register.jsx  # Updated with 3-step OTP flow
```

## Support

For issues or questions, check the console logs in both backend and frontend for detailed error messages.
