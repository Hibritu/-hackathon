import express from 'express';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Haversine distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await axios.get(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'FishTrace/1.0' } });
  const first = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
  if (!first) return null;
  return { lat: parseFloat(first.lat), lon: parseFloat(first.lon) };
}

// Helper: compute effective price with decay-based reduction
function effectivePrice(basePrice, freshness, createdAt) {
  const decayHours = Number(process.env.FRESH_DECAY_HOURS || 3);
  const isFresh = (freshness || '').toLowerCase() === 'fresh';
  const isWasted = (freshness || '').toLowerCase() === 'wasted';
  let decayed = false;
  if (isWasted) decayed = true;
  else if (isFresh && createdAt) {
    const ageHrs = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    if (ageHrs >= decayHours) decayed = true;
  }
  const priceNum = Number(basePrice || 0);
  if (decayed) return Number((priceNum * 0.98).toFixed(2));
  return priceNum;
}

// Create order and initiate Chapa payment (Buyer only)
router.post('/create-and-pay', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { catchId, delivery } = req.body;

    if (!catchId) {
      return res.status(400).json({ error: 'Catch ID is required' });
    }

    // Get catch details
    const catchResult = await pool.query(
      `SELECT c.id, c.verified, c.price, c.fish_name, c.freshness, c.created_at,
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

    const catchPriceBase = parseFloat(catchData.price);
    const catchPrice = effectivePrice(catchPriceBase, catchData.freshness, catchData.created_at);
    const buyerFee = Number((catchPrice * 0.10).toFixed(2));
    const fisherFee = Number((catchPrice * 0.05).toFixed(2));
    const needDelivery = !!delivery?.needDelivery;
    let deliveryFee = 0;
    let distanceKm = 0;

    // Create order with PENDING status
    const orderResult = await pool.query(
      `INSERT INTO orders (buyer_id, catch_id, payment_status) 
       VALUES ($1, $2, 'PENDING') 
       RETURNING id, buyer_id, catch_id, payment_status, date, created_at, updated_at`,
      [req.user.id, catchId]
    );

    const order = orderResult.rows[0];

    // If delivery requested, compute distance-based fee and create delivery record
    if (needDelivery) {
      // Origin: use stored GPS from catch
      let origin = null;
      try {
        const co = await pool.query('SELECT origin_lat, origin_lng FROM catches WHERE id = $1', [catchId]);
        if (co.rows.length && co.rows[0].origin_lat != null && co.rows[0].origin_lng != null) {
          origin = { lat: parseFloat(co.rows[0].origin_lat), lon: parseFloat(co.rows[0].origin_lng) };
        }
      } catch {}
      if (!origin) {
        return res.status(422).json({ error: 'Catch location is missing for distance calculation. Please register the catch with GPS.' });
      }
      // Destination: from payload lat/lng or geocode address
      let dest = null;
      const hasLatLng = delivery?.lat && delivery?.lng;
      if (hasLatLng) {
        dest = { lat: parseFloat(delivery.lat), lon: parseFloat(delivery.lng) };
      } else if (delivery?.address || delivery?.city) {
        const q = [delivery?.address, delivery?.city, 'Ethiopia'].filter(Boolean).join(', ');
        try { dest = await geocodeNominatim(q); } catch {}
      }

      if (origin && dest) {
        distanceKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
        deliveryFee = Math.max(0, Number((distanceKm * 10).toFixed(2))); // 10 ETB per km
      }

      const notes = JSON.stringify({
        address: delivery?.address || '',
        city: delivery?.city || '',
        contactName: delivery?.contactName || '',
        phone: delivery?.phone || '',
        lat: hasLatLng ? parseFloat(delivery.lat) : undefined,
        lng: hasLatLng ? parseFloat(delivery.lng) : undefined,
        deliveryFee,
        distanceKm
      });
      try {
        await pool.query(
          `INSERT INTO deliveries (order_id, status, notes) VALUES ($1, $2, $3) ON CONFLICT (order_id) DO NOTHING`,
          [order.id, 'PENDING', notes]
        );
      } catch (e) {
        console.error('Pre-create delivery error:', e.message);
      }
    }

    // Get buyer details
    const buyerResult = await pool.query(
      'SELECT id, name, email, phone FROM users WHERE id = $1',
      [req.user.id]
    );

    const buyer = buyerResult.rows[0];

    // Generate transaction reference with order ID
    const tx_ref = `tx-${order.id}-${Date.now()}`;

    // Initialize Chapa payment (amount includes delivery fee if any)
    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount: catchPrice + buyerFee + deliveryFee,
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
      breakdown: {
        catchPrice,
        buyerFee,
        fisherFee,
        deliveryFee,
        distanceKm,
        netToFisher: Number((catchPrice - fisherFee).toFixed(2)),
        total: Number((catchPrice + buyerFee + deliveryFee).toFixed(2))
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

// Fisher: earnings summary and list of sold catches
router.get('/earnings/me', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    const { from, to } = req.query; // optional ISO date strings
    const params = [req.user.id];
    let where = `o.payment_status = 'COMPLETED' AND c.fisher_id = $1`;
    if (from) { params.push(from); where += ` AND o.created_at >= $${params.length}`; }
    if (to) { params.push(to); where += ` AND o.created_at <= $${params.length}`; }

    const q = await pool.query(
      `SELECT o.id as order_id, o.created_at as order_created_at,
              c.id as catch_id, c.fish_name, c.price, c.freshness, c.created_at as catch_created_at
       FROM orders o
       JOIN catches c ON o.catch_id = c.id
       WHERE ${where}
       ORDER BY o.created_at DESC`,
      params
    );

    let totalGross = 0, totalFisherFee = 0, totalNet = 0, count = 0;
    const items = q.rows.map(r => {
      const eff = effectivePrice(parseFloat(r.price), r.freshness, r.catch_created_at);
      const fisherFee = Number((eff * 0.05).toFixed(2));
      const net = Number((eff - fisherFee).toFixed(2));
      totalGross += eff; totalFisherFee += fisherFee; totalNet += net; count += 1;
      return {
        orderId: r.order_id,
        catchId: r.catch_id,
        fishName: r.fish_name,
        gross: eff,
        fisherFee,
        netToFisher: net,
        createdAt: r.order_created_at,
      };
    });

    res.json({
      summary: {
        count,
        totalGross: Number(totalGross.toFixed(2)),
        totalFisherFee: Number(totalFisherFee.toFixed(2)),
        totalNetToFisher: Number(totalNet.toFixed(2)),
      },
      items,
    });
  } catch (error) {
    console.error('Fisher earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings', message: error.message });
  }
});

// Admin: platform income summary (buyer + fisher fees)
router.get('/income/admin', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { from, to } = req.query; // optional ISO date strings
    const params = [];
    let where = `o.payment_status = 'COMPLETED'`;
    if (from) { params.push(from); where += ` AND o.created_at >= $${params.length}`; }
    if (to) { params.push(to); where += ` AND o.created_at <= $${params.length}`; }

    const q = await pool.query(
      `SELECT o.id as order_id, o.created_at as order_created_at,
              c.id as catch_id, c.price, c.freshness, c.created_at as catch_created_at
       FROM orders o
       JOIN catches c ON o.catch_id = c.id
       WHERE ${where}
       ORDER BY o.created_at DESC`,
      params
    );

    let totalBuyerFees = 0, totalFisherFees = 0, totalRevenue = 0, count = 0;
    const items = q.rows.map(r => {
      const eff = effectivePrice(parseFloat(r.price), r.freshness, r.catch_created_at);
      const buyerFee = Number((eff * 0.10).toFixed(2));
      const fisherFee = Number((eff * 0.05).toFixed(2));
      const revenue = Number((buyerFee + fisherFee).toFixed(2));
      totalBuyerFees += buyerFee; totalFisherFees += fisherFee; totalRevenue += revenue; count += 1;
      return {
        orderId: r.order_id,
        catchId: r.catch_id,
        gross: eff,
        buyerFee,
        fisherFee,
        revenue,
        createdAt: r.order_created_at,
      };
    });

    res.json({
      summary: {
        count,
        totalBuyerFees: Number(totalBuyerFees.toFixed(2)),
        totalFisherFees: Number(totalFisherFees.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2)),
      },
      items,
    });
  } catch (error) {
    console.error('Admin income error:', error);
    res.status(500).json({ error: 'Failed to fetch income', message: error.message });
  }
});

// Initiate payment for an existing pending order (Buyer only)
router.post('/pay/:orderId', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { orderId } = req.params;

    // Load order and ensure it belongs to the user and is pending
    const orderResult = await pool.query(
      `SELECT o.id, o.buyer_id, o.catch_id, o.payment_status,
              c.price, c.fish_name, c.freshness, c.created_at,
              u_buyer.name as buyer_name, u_buyer.email as buyer_email, u_buyer.phone as buyer_phone
       FROM orders o
       JOIN catches c ON o.catch_id = c.id
       JOIN users u_buyer ON o.buyer_id = u_buyer.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (order.buyer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only pay your own orders' });
    }

    if (order.payment_status === 'COMPLETED') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Prevent race: if the catch is already sold via another completed order
    const soldCheck = await pool.query(
      `SELECT 1 FROM orders WHERE catch_id = $1 AND payment_status = 'COMPLETED' LIMIT 1`,
      [order.catch_id]
    );
    if (soldCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Order no longer available' });
    }

    const base = effectivePrice(parseFloat(order.price), order.freshness, order.created_at);
    const buyerFee = Number((base * 0.10).toFixed(2));
    const amount = Number((base + buyerFee).toFixed(2));
    const tx_ref = `tx-${order.id}-${Date.now()}`;

    const chapaResponse = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      {
        amount,
        currency: 'ETB',
        email: order.buyer_email,
        first_name: order.buyer_name.split(' ')[0] || order.buyer_name,
        last_name: order.buyer_name.split(' ').slice(1).join(' ') || 'Buyer',
        phone_number: order.buyer_phone || '',
        tx_ref: tx_ref,
        callback_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/chapa/callback`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        customization: {
          title: `Fish ${order.catch_id}`.replace(/[^a-zA-Z0-9 _-]/g, ' ').trim(),
          description: `Fish ${order.fish_name}`.replace(/[^a-zA-Z0-9 _-]/g, ' ').trim()
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      message: 'Payment initialized',
      payment: {
        tx_ref: tx_ref,
        checkout_url: chapaResponse.data.data.checkout_url,
        status: chapaResponse.data.status
      }
    });
  } catch (error) {
    console.error('Pay existing order error:', error);
    res.status(500).json({ error: 'Failed to initialize payment', message: error?.response?.data || error.message });
  }
});

// Quote delivery fee (no order creation). Buyer only to avoid abuse.
router.post('/quote', authenticate, authorize('BUYER'), async (req, res) => {
  try {
    const { catchId, delivery } = req.body;
    if (!catchId) return res.status(400).json({ error: 'Catch ID is required' });

    // Fetch catch price and lake for origin geocoding
    const cRes = await pool.query('SELECT price, lake, freshness, created_at FROM catches WHERE id = $1', [catchId]);
    if (cRes.rows.length === 0) return res.status(404).json({ error: 'Catch not found' });
    const catchPrice = effectivePrice(parseFloat(cRes.rows[0].price), cRes.rows[0].freshness, cRes.rows[0].created_at);
    const buyerFee = Number((catchPrice * 0.10).toFixed(2));
    const fisherFee = Number((catchPrice * 0.05).toFixed(2));

    if (!delivery?.needDelivery) {
      return res.json({ breakdown: { catchPrice, buyerFee, fisherFee, deliveryFee: 0, distanceKm: 0, netToFisher: Number((catchPrice - fisherFee).toFixed(2)), total: Number((catchPrice + buyerFee).toFixed(2)) } });
    }

    // Origin from lake name (fallback until origin lat/lng is stored on catch)
    let origin = null;
    const lakeName = cRes.rows[0].lake;
    if (lakeName) {
      try { origin = await geocodeNominatim(lakeName + ', Ethiopia'); } catch {}
    }

    // Destination from payload lat/lng or geocode address
    let dest = null;
    if (delivery?.lat && delivery?.lng) {
      dest = { lat: parseFloat(delivery.lat), lon: parseFloat(delivery.lng) };
    } else if (delivery?.address || delivery?.city) {
      const q = [delivery?.address, delivery?.city, 'Ethiopia'].filter(Boolean).join(', ');
      try { dest = await geocodeNominatim(q); } catch {}
    }

    let distanceKm = 0;
    let deliveryFee = 0;
    if (origin && dest) {
      distanceKm = haversineKm(origin.lat, origin.lon, dest.lat, dest.lon);
      deliveryFee = Math.max(0, Number((distanceKm * 10).toFixed(2))); // 10 ETB per km
    }

    return res.json({
      breakdown: {
        catchPrice,
        buyerFee,
        fisherFee,
        deliveryFee,
        distanceKm,
        netToFisher: Number((catchPrice - fisherFee).toFixed(2)),
        total: Number((catchPrice + buyerFee + deliveryFee).toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ error: 'Failed to compute quote', message: error?.response?.data || error.message });
  }
});

// Admin/Agent: list deliveries with coordinates and distance/fee
router.get('/deliveries/admin', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id as delivery_id, d.order_id, d.status as delivery_status, d.notes, d.created_at as delivery_created_at,
        o.buyer_id, o.catch_id,
        u_buyer.name as buyer_name, u_buyer.phone as buyer_phone,
        c.fish_name, c.price, c.origin_lat, c.origin_lng
      FROM deliveries d
      JOIN orders o ON d.order_id = o.id
      JOIN users u_buyer ON o.buyer_id = u_buyer.id
      JOIN catches c ON o.catch_id = c.id
      ORDER BY d.created_at DESC
    `);

    const deliveries = result.rows.map(row => {
      let destLat = null, destLng = null; 
      let distanceKm = 0, deliveryFee = 0;
      try {
        const notes = row.notes ? (typeof row.notes === 'object' ? row.notes : JSON.parse(row.notes)) : {};
        if (notes && notes.lat != null && notes.lng != null) {
          destLat = parseFloat(notes.lat);
          destLng = parseFloat(notes.lng);
        }
        if (row.origin_lat != null && row.origin_lng != null && destLat != null && destLng != null) {
          distanceKm = haversineKm(parseFloat(row.origin_lat), parseFloat(row.origin_lng), destLat, destLng);
          deliveryFee = Number((distanceKm * 10).toFixed(2));
        }
      } catch {}

      return {
        id: row.delivery_id,
        orderId: row.order_id,
        status: row.delivery_status,
        createdAt: row.delivery_created_at,
        buyer: { id: row.buyer_id, name: row.buyer_name, phone: row.buyer_phone },
        catch: { id: row.catch_id, fishName: row.fish_name, price: parseFloat(row.price) },
        origin: { lat: row.origin_lat != null ? parseFloat(row.origin_lat) : null, lng: row.origin_lng != null ? parseFloat(row.origin_lng) : null },
        destination: { lat: destLat, lng: destLng },
        distanceKm,
        deliveryFee,
      };
    });

    res.json({ deliveries });
  } catch (error) {
    console.error('Admin deliveries error:', error);
    res.status(500).json({ error: 'Failed to fetch deliveries', message: error.message });
  }
});

// Admin: update delivery status (e.g., mark as DELIVERED)
router.patch('/deliveries/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., DELIVERED, IN_TRANSIT, PICKED, CANCELLED
    const newStatus = (status || 'DELIVERED').toUpperCase();

    const allowed = ['PENDING', 'PICKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid delivery status' });
    }

    const update = await pool.query(
      `UPDATE deliveries SET status = $1 WHERE id = $2 RETURNING id, order_id, status, notes, created_at`,
      [newStatus, id]
    );

    if (!update.rows.length) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ message: 'Delivery status updated', delivery: update.rows[0] });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Failed to update delivery status', message: error.message });
  }
});

export default router;
// Auto-complete delivery by scanning catch QR (Agent/Admin)
router.post('/deliveries/complete-by-qr', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ error: 'Encrypted QR data is required' });

    // Decrypt QR to get catchId
    let catchId;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, process.env.SECRET_KEY);
      const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      catchId = decrypted?.id;
      if (!catchId) throw new Error('Invalid decrypted payload');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid QR code or decryption failed' });
    }

    // Find most recent delivery for this catch's order
    const q = await pool.query(
      `SELECT d.id AS delivery_id, d.status
       FROM deliveries d
       JOIN orders o ON d.order_id = o.id
       WHERE o.catch_id = $1
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [catchId]
    );

    if (!q.rows.length) {
      return res.status(404).json({ error: 'No delivery found for this catch' });
    }

    const deliveryId = q.rows[0].delivery_id;

    // Mark as DELIVERED if not already
    const upd = await pool.query(
      `UPDATE deliveries SET status = 'DELIVERED' WHERE id = $1 RETURNING id, order_id, status, notes, created_at`,
      [deliveryId]
    );

    res.json({ message: 'Delivery marked as DELIVERED', delivery: upd.rows[0] });
  } catch (error) {
    console.error('Complete delivery by QR error:', error);
    res.status(500).json({ error: 'Failed to complete delivery by QR', message: error.message });
  }
});
