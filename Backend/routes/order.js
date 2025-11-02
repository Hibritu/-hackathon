import express from 'express';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create order (Buyer only) - returns payment URL
router.post('/', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { catchId } = req.body;

    if (!catchId) {
      return res.status(400).json({ error: 'Catch ID is required' });
    }

    // Check if catch exists and is verified
    const catchResult = await pool.query(
      'SELECT id, verified, price FROM catches WHERE id = $1',
      [catchId]
    );

    if (catchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    if (!catchResult.rows[0].verified) {
      return res.status(400).json({ error: 'This catch is not verified yet' });
    }

    const catchPrice = parseFloat(catchResult.rows[0].price);

    // Create order with PENDING status
    const orderResult = await pool.query(
      `INSERT INTO orders (buyer_id, catch_id, payment_status) 
       VALUES ($1, $2, $3) 
       RETURNING id, buyer_id, catch_id, payment_status, date, created_at, updated_at`,
      [req.user.id, catchId, 'PENDING']
    );

    const order = orderResult.rows[0];

    // Get catch with fisher info
    const catchDataResult = await pool.query(
      `SELECT 
        c.id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
        c.verified, c.created_at,
        u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
      FROM catches c
      JOIN users u ON c.fisher_id = u.id
      WHERE c.id = $1`,
      [catchId]
    );

    const catchData = catchDataResult.rows[0];

    // Get buyer info
    const buyerResult = await pool.query(
      'SELECT id, name, phone FROM users WHERE id = $1',
      [req.user.id]
    );

    const orderResponse = {
      id: order.id,
      buyerId: order.buyer_id,
      catchId: order.catch_id,
      paymentStatus: order.payment_status,
      date: order.date,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      catch: {
        id: catchData.id,
        fishName: catchData.fish_name,
        weight: parseFloat(catchData.weight),
        price: parseFloat(catchData.price),
        freshness: catchData.freshness,
        lake: catchData.lake,
        verified: catchData.verified,
        createdAt: catchData.created_at,
        fisher: {
          id: catchData.fisher_id,
          name: catchData.fisher_name,
          phone: catchData.fisher_phone
        }
      },
      buyer: buyerResult.rows[0]
    };

    res.status(201).json({
      message: 'Order created successfully',
      order: orderResponse
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order', message: error.message });
  }
});

// Update payment status (ADMIN only)
router.patch('/:id/payment', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    // Check if order exists
    const orderResult = await pool.query(
      'SELECT buyer_id FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateResult = await pool.query(
      `UPDATE orders SET payment_status = $1 
       WHERE id = $2 
       RETURNING id, buyer_id, catch_id, payment_status, date, created_at, updated_at`,
      [paymentStatus || 'COMPLETED', id]
    );

    const order = updateResult.rows[0];

    // Get catch with fisher info
    const catchDataResult = await pool.query(
      `SELECT 
        c.id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
        c.verified, c.created_at,
        u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
      FROM catches c
      JOIN users u ON c.fisher_id = u.id
      WHERE c.id = $1`,
      [order.catch_id]
    );

    const catchData = catchDataResult.rows[0];

    // Get buyer info
    const buyerResult = await pool.query(
      'SELECT id, name, phone FROM users WHERE id = $1',
      [order.buyer_id]
    );

    const orderResponse = {
      id: order.id,
      buyerId: order.buyer_id,
      catchId: order.catch_id,
      paymentStatus: order.payment_status,
      date: order.date,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      catch: {
        id: catchData.id,
        fishName: catchData.fish_name,
        weight: parseFloat(catchData.weight),
        price: parseFloat(catchData.price),
        freshness: catchData.freshness,
        lake: catchData.lake,
        verified: catchData.verified,
        createdAt: catchData.created_at,
        fisher: {
          id: catchData.fisher_id,
          name: catchData.fisher_name,
          phone: catchData.fisher_phone
        }
      },
      buyer: buyerResult.rows[0]
    };

    res.json({
      message: 'Payment status updated',
      order: orderResponse
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment', message: error.message });
  }
});

// Get buyer's orders (optionally filter by payment status)
router.get('/my-orders', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { status } = req.query; // ?status=COMPLETED or ?status=PENDING
    
    let query = `
      SELECT 
        o.id, o.buyer_id, o.catch_id, o.payment_status, o.date, o.created_at, o.updated_at,
        c.id as catch_id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
        c.verified, c.created_at as catch_created_at,
        u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
      FROM orders o
      JOIN catches c ON o.catch_id = c.id
      JOIN users u ON c.fisher_id = u.id
      WHERE o.buyer_id = $1`;
    
    const params = [req.user.id];
    
    if (status) {
      query += ` AND o.payment_status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await pool.query(query, params);

    const orders = result.rows.map(row => ({
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

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

// Get all orders (Admin only, optionally filter by payment status)
router.get('/all', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { status } = req.query; // ?status=COMPLETED or ?status=PENDING
    
    let query = `
      SELECT 
        o.id, o.buyer_id, o.catch_id, o.payment_status, o.date, o.created_at, o.updated_at,
        c.id as catch_id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
        c.verified, c.created_at as catch_created_at,
        u_fisher.id as fisher_id, u_fisher.name as fisher_name, u_fisher.phone as fisher_phone,
        u_buyer.id as buyer_id, u_buyer.name as buyer_name, u_buyer.phone as buyer_phone
      FROM orders o
      JOIN catches c ON o.catch_id = c.id
      JOIN users u_fisher ON c.fisher_id = u_fisher.id
      JOIN users u_buyer ON o.buyer_id = u_buyer.id`;
    
    const params = [];
    
    if (status) {
      query += ` WHERE o.payment_status = $1`;
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await pool.query(query, params);

    const orders = result.rows.map(row => ({
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
      },
      buyer: {
        id: row.buyer_id,
        name: row.buyer_name,
        phone: row.buyer_phone
      }
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
});

export default router;
