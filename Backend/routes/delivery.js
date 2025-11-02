import express from 'express';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Create delivery for an order (ADMIN or auto-create on order completion)
router.post('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { orderId, deliveryPersonId, notes } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Check if order exists
    const orderResult = await pool.query(
      'SELECT id, payment_status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if delivery already exists for this order
    const existingDelivery = await pool.query(
      'SELECT id FROM deliveries WHERE order_id = $1',
      [orderId]
    );

    if (existingDelivery.rows.length > 0) {
      return res.status(400).json({ error: 'Delivery already exists for this order' });
    }

    // Create delivery
    const result = await pool.query(
      `INSERT INTO deliveries (order_id, delivery_person_id, status, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, order_id, delivery_person_id, status, notes, picked_at, delivered_at, created_at, updated_at`,
      [orderId, deliveryPersonId || null, 'PENDING', notes || null]
    );

    const delivery = result.rows[0];

    res.status(201).json({
      message: 'Delivery created successfully',
      delivery: {
        id: delivery.id,
        orderId: delivery.order_id,
        deliveryPersonId: delivery.delivery_person_id,
        status: delivery.status,
        notes: delivery.notes,
        pickedAt: delivery.picked_at,
        deliveredAt: delivery.delivered_at,
        createdAt: delivery.created_at,
        updatedAt: delivery.updated_at
      }
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ error: 'Failed to create delivery', message: error.message });
  }
});

// Update delivery status (ADMIN or assigned delivery person)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['PENDING', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status', validStatuses });
    }

    // Get delivery
    const deliveryResult = await pool.query(
      'SELECT delivery_person_id FROM deliveries WHERE id = $1',
      [id]
    );

    if (deliveryResult.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = deliveryResult.rows[0];

    // Check authorization: ADMIN or assigned delivery person
    if (req.user.role !== 'ADMIN' && req.user.id !== delivery.delivery_person_id) {
      return res.status(403).json({ error: 'Access denied. Only assigned delivery person or admin can update.' });
    }

    // Build update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);

      // Auto-set timestamps based on status
      if (status === 'PICKED' || status === 'IN_TRANSIT') {
        updates.push(`picked_at = COALESCE(picked_at, NOW())`);
      }
      if (status === 'DELIVERED') {
        updates.push(`delivered_at = NOW()`);
      }
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE deliveries
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, order_id, delivery_person_id, status, notes, picked_at, delivered_at, created_at, updated_at
    `;

    const updateResult = await pool.query(query, params);
    const updatedDelivery = updateResult.rows[0];

    res.json({
      message: 'Delivery status updated',
      delivery: {
        id: updatedDelivery.id,
        orderId: updatedDelivery.order_id,
        deliveryPersonId: updatedDelivery.delivery_person_id,
        status: updatedDelivery.status,
        notes: updatedDelivery.notes,
        pickedAt: updatedDelivery.picked_at,
        deliveredAt: updatedDelivery.delivered_at,
        createdAt: updatedDelivery.created_at,
        updatedAt: updatedDelivery.updated_at
      }
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Failed to update delivery status', message: error.message });
  }
});

// Assign delivery person (ADMIN only)
router.patch('/:id/assign', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    if (!deliveryPersonId) {
      return res.status(400).json({ error: 'Delivery person ID is required' });
    }

    // Verify delivery person exists
    const personResult = await pool.query(
      'SELECT id, name FROM users WHERE id = $1',
      [deliveryPersonId]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery person not found' });
    }

    const updateResult = await pool.query(
      `UPDATE deliveries
       SET delivery_person_id = $1
       WHERE id = $2
       RETURNING id, order_id, delivery_person_id, status, notes, picked_at, delivered_at, created_at, updated_at`,
      [deliveryPersonId, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const delivery = updateResult.rows[0];

    res.json({
      message: 'Delivery person assigned',
      delivery: {
        id: delivery.id,
        orderId: delivery.order_id,
        deliveryPersonId: delivery.delivery_person_id,
        status: delivery.status,
        notes: delivery.notes,
        pickedAt: delivery.picked_at,
        deliveredAt: delivery.delivered_at,
        createdAt: delivery.created_at,
        updatedAt: delivery.updated_at
      }
    });
  } catch (error) {
    console.error('Assign delivery person error:', error);
    res.status(500).json({ error: 'Failed to assign delivery person', message: error.message });
  }
});

// Get delivery by order ID (buyer, fisher, delivery person, or admin)
router.get('/order/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      `SELECT 
        d.id, d.order_id, d.delivery_person_id, d.status, d.notes, 
        d.picked_at, d.delivered_at, d.created_at, d.updated_at,
        u.id as person_id, u.name as person_name, u.phone as person_phone,
        o.buyer_id, c.fisher_id
      FROM deliveries d
      LEFT JOIN users u ON d.delivery_person_id = u.id
      JOIN orders o ON d.order_id = o.id
      JOIN catches c ON o.catch_id = c.id
      WHERE d.order_id = $1`,
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found for this order' });
    }

    const row = result.rows[0];

    // Check authorization: buyer, fisher, delivery person, or admin
    const isAuthorized = 
      req.user.role === 'ADMIN' ||
      req.user.id === row.buyer_id ||
      req.user.id === row.fisher_id ||
      req.user.id === row.delivery_person_id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const delivery = {
      id: row.id,
      orderId: row.order_id,
      deliveryPersonId: row.delivery_person_id,
      status: row.status,
      notes: row.notes,
      pickedAt: row.picked_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deliveryPerson: row.person_id ? {
        id: row.person_id,
        name: row.person_name,
        phone: row.person_phone
      } : null
    };

    res.json({ delivery });
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery', message: error.message });
  }
});

// Get all deliveries (ADMIN only)
router.get('/all', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        d.id, d.order_id, d.delivery_person_id, d.status, d.notes, 
        d.picked_at, d.delivered_at, d.created_at, d.updated_at,
        u.id as person_id, u.name as person_name, u.phone as person_phone
      FROM deliveries d
      LEFT JOIN users u ON d.delivery_person_id = u.id
      ORDER BY d.created_at DESC`
    );

    const deliveries = result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      deliveryPersonId: row.delivery_person_id,
      status: row.status,
      notes: row.notes,
      pickedAt: row.picked_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deliveryPerson: row.person_id ? {
        id: row.person_id,
        name: row.person_name,
        phone: row.person_phone
      } : null
    }));

    res.json({ deliveries });
  } catch (error) {
    console.error('Get all deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', message: error.message });
  }
});

// Get deliveries assigned to current user (delivery person)
router.get('/my-deliveries', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        d.id, d.order_id, d.delivery_person_id, d.status, d.notes, 
        d.picked_at, d.delivered_at, d.created_at, d.updated_at,
        o.buyer_id, o.payment_status,
        u_buyer.name as buyer_name, u_buyer.phone as buyer_phone
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users u_buyer ON o.buyer_id = u_buyer.id
      WHERE d.delivery_person_id = $1
      ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    const deliveries = result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      deliveryPersonId: row.delivery_person_id,
      status: row.status,
      notes: row.notes,
      pickedAt: row.picked_at,
      deliveredAt: row.delivered_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      buyer: {
        id: row.buyer_id,
        name: row.buyer_name,
        phone: row.buyer_phone
      },
      paymentStatus: row.payment_status
    }));

    res.json({ deliveries });
  } catch (error) {
    console.error('Get my deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', message: error.message });
  }
});

export default router;
