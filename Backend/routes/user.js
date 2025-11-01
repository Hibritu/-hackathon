import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless admin
    if (id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user info
    const userResult = await pool.query(
      'SELECT id, name, phone, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userResult.rows[0];

    // Get catches if user is a fisher
    let catches = [];
    if (userData.role === 'FISHER') {
      const catchesResult = await pool.query(
        `SELECT 
          c.id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
          c.qr_encrypted, c.verified, c.created_at, c.updated_at,
          u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
        FROM catches c
        JOIN users u ON c.fisher_id = u.id
        WHERE c.fisher_id = $1
        ORDER BY c.created_at DESC`,
        [id]
      );

      catches = catchesResult.rows.map(row => ({
        id: row.id,
        fishName: row.fish_name,
        weight: parseFloat(row.weight),
        price: parseFloat(row.price),
        freshness: row.freshness,
        lake: row.lake,
        fisherId: row.fisher_id,
        qrEncrypted: row.qr_encrypted,
        verified: row.verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fisher: {
          id: row.fisher_id,
          name: row.fisher_name,
          phone: row.fisher_phone
        }
      }));
    }

    // Get orders if user is a buyer
    let orders = [];
    if (userData.role === 'BUYER') {
      const ordersResult = await pool.query(
        `SELECT 
          o.id, o.buyer_id, o.catch_id, o.payment_status, o.date, o.created_at, o.updated_at,
          c.id as catch_id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
          c.verified, c.created_at as catch_created_at,
          u_fisher.id as fisher_id, u_fisher.name as fisher_name, u_fisher.phone as fisher_phone
        FROM orders o
        JOIN catches c ON o.catch_id = c.id
        JOIN users u_fisher ON c.fisher_id = u_fisher.id
        WHERE o.buyer_id = $1
        ORDER BY o.created_at DESC`,
        [id]
      );

      orders = ordersResult.rows.map(row => ({
        id: row.id,
        buyerId: row.buyer_id,
        catchId: row.catch_id,
        paymentStatus: row.payment_status,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        catch: {
          id: row.catch_id,
          fishName: row.fish_name,
          weight: parseFloat(row.weight),
          price: parseFloat(row.price),
          freshness: row.freshness,
          lake: row.lake,
          verified: row.verified,
          createdAt: row.catch_created_at,
          fisher: {
            id: row.fisher_id,
            name: row.fisher_name,
            phone: row.fisher_phone
          }
        }
      }));
    }

    const user = {
      id: userData.id,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      createdAt: userData.created_at,
      catches,
      orders
    };

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

// Register new fisher (Agent only)
router.post('/register-fisher', authenticate, authorize('AGENT'), async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create fisher
    const result = await pool.query(
      `INSERT INTO users (name, phone, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, phone, role, created_at`,
      [name, phone, hashedPassword, 'FISHER']
    );

    const fisher = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      message: 'Fisher registered successfully',
      fisher
    });
  } catch (error) {
    console.error('Register fisher error:', error);
    res.status(500).json({ error: 'Failed to register fisher', message: error.message });
  }
});

export default router;
