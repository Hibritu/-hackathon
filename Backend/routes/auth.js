import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';
import { generateOTP, sendOTPEmail } from '../utils/email.js';
import { storeOTP, verifyOTP } from '../utils/otpStore.js';

const router = express.Router();

// Send OTP to email (resend for existing unverified users)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check account status
    const existingUser = await pool.query(
      'SELECT id, name, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'No account found for this email. Please register first.' });
    }

    if (existingUser.rows[0].email_verified) {
      return res.status(400).json({ error: 'Email already verified. You can login.' });
    }

    // Generate and send OTP
    const otp = generateOTP();
    const emailResult = await sendOTPEmail(email, otp, name);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send OTP email', message: emailResult.error });
    }

    // Store OTP
    storeOTP(email, otp);

    res.json({
      message: 'OTP sent successfully to your email',
      email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP', message: error.message });
  }
});

// Login with email + password
router.post('/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT id, name, email, phone, role, password, email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login (email) error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Register with OTP verification (email as primary identifier)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user exists (email or phone if provided)
    let existingUserQuery = 'SELECT id FROM users WHERE email = $1';
    let queryParams = [email];
    
    if (phone) {
      existingUserQuery += ' OR phone = $2';
      queryParams.push(phone);
    }
    
    const existingUser = await pool.query(existingUserQuery, queryParams);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with email as primary identifier (unverified)
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email, phone, role, email_verified, created_at`,
      [name, email, phone || null, hashedPassword, role || 'BUYER', false]
    );

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
      emailVerified: result.rows[0].email_verified,
      createdAt: result.rows[0].created_at
    };

    // Send OTP for email verification
    const otp = generateOTP();
    const emailResult = await sendOTPEmail(email, otp, name);
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification OTP', message: emailResult.error });
    }
    storeOTP(email, otp);

    res.status(201).json({
      message: 'User registered successfully. Verification OTP sent to email.',
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Verify OTP and activate account; respond with JWT for immediate login
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const otpVerification = verifyOTP(email, otp);
    if (!otpVerification.valid) {
      return res.status(400).json({ error: otpVerification.error });
    }

    // Mark email as verified
    const update = await pool.query(
      `UPDATE users SET email_verified = true WHERE email = $1 RETURNING id, name, email, phone, role, email_verified`,
      [email]
    );

    if (update.rows.length === 0) {
      return res.status(404).json({ error: 'No account found for this email' });
    }

    const user = update.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.email_verified
      },
      token
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Verification failed', message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, name, phone, role, password, email_verified FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

export default router;
