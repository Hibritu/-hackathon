import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import pool from '../db/connection.js';

dotenv.config();
const router = express.Router();

// POST /api/chapa/pay
router.post('/pay', async (req, res) => {
  try {
    const {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      callback_url,
      return_url,
    } = req.body;

    const tx_ref = 'tx-' + Date.now();

    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        currency,
        email,
        first_name,
        last_name,
        phone_number,
        tx_ref,
        callback_url,
        return_url,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } 
  catch (error) {
  console.error('Chapa error:', error?.response?.data || error.message);
  res.status(500).json({
    error: error?.response?.data || error.message || 'Payment initiation failed.'
  });
}

});

// POST /api/chapa/callback - Chapa payment verification callback
router.post('/callback', async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    console.log('Chapa callback received:', { tx_ref, status });

    if (status === 'success') {
      // Extract order ID from tx_ref (format: tx-orderId-timestamp)
      const orderIdMatch = tx_ref.match(/tx-(\d+)-/);
      
      if (!orderIdMatch) {
        return res.status(400).json({ error: 'Invalid transaction reference' });
      }

      const orderId = parseInt(orderIdMatch[1]);

      // Update order payment status to COMPLETED
      const updateResult = await pool.query(
        `UPDATE orders SET payment_status = 'COMPLETED' 
         WHERE id = $1 
         RETURNING id, buyer_id, catch_id, payment_status`,
        [orderId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = updateResult.rows[0];

      // Auto-create delivery for completed order
      try {
        await pool.query(
          `INSERT INTO deliveries (order_id, status, notes)
           VALUES ($1, $2, $3)
           ON CONFLICT (order_id) DO NOTHING`,
          [orderId, 'PENDING', 'Auto-created after payment completion']
        );
        console.log(`✅ Delivery created for order ${orderId}`);
      } catch (deliveryError) {
        console.error('Delivery creation error:', deliveryError.message);
        // Don't fail the payment callback if delivery creation fails
      }

      res.json({
        message: 'Payment verified and order updated',
        orderId: order.id,
        paymentStatus: order.payment_status
      });
    } else {
      // Payment failed
      const orderIdMatch = tx_ref.match(/tx-(\d+)-/);
      if (orderIdMatch) {
        const orderId = parseInt(orderIdMatch[1]);
        await pool.query(
          `UPDATE orders SET payment_status = 'FAILED' WHERE id = $1`,
          [orderId]
        );
      }

      res.json({
        message: 'Payment failed',
        status: 'failed'
      });
    }
  } catch (error) {
    console.error('Chapa callback error:', error);
    res.status(500).json({
      error: 'Callback processing failed',
      message: error.message
    });
  }
});

// GET /api/chapa/verify/:tx_ref - Manual payment verification
router.get('/verify/:tx_ref', async (req, res) => {
  try {
    const { tx_ref } = req.params;

    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const { status } = response.data;

    if (status === 'success') {
      // Extract order ID and update
      const orderIdMatch = tx_ref.match(/tx-(\d+)-/);
      if (orderIdMatch) {
        const orderId = parseInt(orderIdMatch[1]);
        await pool.query(
          `UPDATE orders SET payment_status = 'COMPLETED' WHERE id = $1`,
          [orderId]
        );

        // Auto-create delivery
        await pool.query(
          `INSERT INTO deliveries (order_id, status, notes)
           VALUES ($1, $2, $3)
           ON CONFLICT (order_id) DO NOTHING`,
          [orderId, 'PENDING', 'Auto-created after payment verification']
        );
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error('Chapa verify error:', error?.response?.data || error.message);
    res.status(500).json({
      error: error?.response?.data || error.message || 'Verification failed'
    });
  }
});

export default router;
