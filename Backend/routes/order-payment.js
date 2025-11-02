import express from 'express';
import axios from 'axios';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create order and initiate Chapa payment (Buyer only)
router.post('/create-and-pay', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { catchId } = req.body;

    if (!catchId) {
      return res.status(400).json({ error: 'Catch ID is required' });
    }

    // Get catch details
    const catchResult = await pool.query(
      `SELECT c.id, c.verified, c.price, c.fish_name,
              u.id as fisher_id, u.name as fisher_name
       FROM catches c
       JOIN users u ON c.fisher_id = u.id
       WHERE c.id = $1`,
      [catchId]
    );

    if (catchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    const catchData = catchResult.rows[0];

    if (!catchData.verified) {
      return res.status(400).json({ error: 'This catch is not verified yet' });
    }

    const catchPrice = parseFloat(catchData.price);

    // Create order with PENDING status
    const orderResult = await pool.query(
      `INSERT INTO orders (buyer_id, catch_id, payment_status) 
       VALUES ($1, $2, 'PENDING') 
       RETURNING id, buyer_id, catch_id, payment_status, date, created_at, updated_at`,
      [req.user.id, catchId]
    );

    const order = orderResult.rows[0];

    // Get buyer details
    const buyerResult = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [req.user.id]
    );

    const buyer = buyerResult.rows[0];

    // Generate transaction reference with order ID
    const tx_ref = `tx-${order.id}-${Date.now()}`;

    // Initialize Chapa payment
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: catchPrice,
        currency: 'ETB',
        email: buyer.email,
        first_name: buyer.name.split(' ')[0] || buyer.name,
        last_name: buyer.name.split(' ').slice(1).join(' ') || 'Buyer',
        phone_number: buyer.phone || '',
        tx_ref: tx_ref,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/chapa/callback`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        customization: {
          title: `Fish ${catchData.id}`.replace(/[^a-zA-Z0-9 _-]/g, ' ').trim(),
          description: `Fish ${catchData.fish_name}`.replace(/[^a-zA-Z0-9 _-]/g, ' ').trim()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(201).json({
      message: 'Order created and payment initialized',
      order: {
        id: order.id,
        buyerId: order.buyer_id,
        catchId: order.catch_id,
        paymentStatus: order.payment_status,
        amount: catchPrice,
        createdAt: order.created_at
      },
      payment: {
        tx_ref: tx_ref,
        checkout_url: chapaResponse.data.data.checkout_url,
        status: chapaResponse.data.status
      },
      catch: {
        id: catchData.id,
        fishName: catchData.fish_name,
        price: catchPrice
      }
    });
  } catch (error) {
    console.error('Create order and pay error:', error);
    
    // If Chapa fails, we might want to delete the order or mark it as failed
    // For now, just return error
    res.status(500).json({
      error: 'Failed to create order and initialize payment',
      message: error?.response?.data || error.message
    });
  }
});

export default router;
