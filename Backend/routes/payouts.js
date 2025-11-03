import express from 'express';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payouts (
      id SERIAL PRIMARY KEY,
      fisher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      method VARCHAR(50) NOT NULL,
      account VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      processed_at TIMESTAMP WITHOUT TIME ZONE
    );
    CREATE INDEX IF NOT EXISTS idx_payouts_fisher ON payouts(fisher_id);
    CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
  `);
}

function toNumber(n) { const v = Number(n); return Number.isFinite(v) ? v : 0; }

async function fisherAvailableBalance(userId, from, to) {
  // Sum netToFisher from completed orders (effective price - 5%) minus payouts in APPROVED/PAID
  const ordersQ = await pool.query(
    `SELECT c.price, c.freshness, c.created_at
     FROM orders o JOIN catches c ON o.catch_id = c.id
     WHERE o.payment_status = 'COMPLETED' AND c.fisher_id = $1` +
     (from ? ` AND o.created_at >= $2` : '') +
     (to ? ` AND o.created_at <= $3` : ''),
    from && to ? [userId, from, to] : from ? [userId, from] : [userId]
  );

  const decayHours = Number(process.env.FRESH_DECAY_HOURS || 3);
  const effPrice = (price, freshness, createdAt) => {
    const isFresh = (freshness || '').toLowerCase() === 'fresh';
    const isWasted = (freshness || '').toLowerCase() === 'wasted';
    let decayed = false;
    if (isWasted) decayed = true; else if (isFresh && createdAt) {
      const ageHrs = (Date.now() - new Date(createdAt).getTime()) / 3600000;
      if (ageHrs >= decayHours) decayed = true;
    }
    const p = toNumber(price);
    return decayed ? Number((p * 0.98).toFixed(2)) : p;
  };

  let gross = 0, fisherFees = 0, net = 0;
  for (const r of ordersQ.rows) {
    const eff = effPrice(r.price, r.freshness, r.created_at);
    const fFee = Number((eff * 0.05).toFixed(2));
    gross += eff; fisherFees += fFee; net += (eff - fFee);
  }

  const payoutsQ = await pool.query(
    `SELECT COALESCE(SUM(amount),0) AS total FROM payouts WHERE fisher_id = $1 AND status IN ('APPROVED','PAID')`,
    [userId]
  );
  const withdrawn = toNumber(payoutsQ.rows[0]?.total);
  return { gross: Number(gross.toFixed(2)), fees: Number(fisherFees.toFixed(2)), net: Number(net.toFixed(2)), withdrawn, available: Number((net - withdrawn).toFixed(2)) };
}

// Fisher: list my payouts and available balance
router.get('/me', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    await ensureSchema();
    const { from, to } = req.query;
    const bal = await fisherAvailableBalance(req.user.id, from, to);
    const list = await pool.query(
      `SELECT id, amount, method, account, status, notes, created_at, processed_at
       FROM payouts WHERE fisher_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ balance: bal, payouts: list.rows });
  } catch (e) {
    console.error('Payouts me error:', e);
    res.status(500).json({ error: 'Failed to fetch payouts', message: e.message });
  }
});

// Fisher: request payout
router.post('/request', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    await ensureSchema();
    const { amount, method, account, notes } = req.body || {};
    const amt = Number(amount);
    if (!(amt > 0)) return res.status(400).json({ error: 'Invalid amount' });
    if (!method || !account) return res.status(400).json({ error: 'Method and account are required' });
    const bal = await fisherAvailableBalance(req.user.id);
    if (amt > bal.available) return res.status(400).json({ error: 'Amount exceeds available balance' });

    const ins = await pool.query(
      `INSERT INTO payouts (fisher_id, amount, method, account, status, notes)
       VALUES ($1, $2, $3, $4, 'PENDING', $5)
       RETURNING id, amount, method, account, status, notes, created_at`,
      [req.user.id, amt, method, account, notes || null]
    );
    res.status(201).json({ message: 'Payout requested', payout: ins.rows[0] });
  } catch (e) {
    console.error('Payout request error:', e);
    res.status(500).json({ error: 'Failed to request payout', message: e.message });
  }
});

// Admin: list payouts
router.get('/admin', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await ensureSchema();
    const { status } = req.query;
    const params = [];
    let where = '1=1';
    if (status) { params.push(status.toUpperCase()); where += ` AND p.status = $${params.length}`; }
    const q = await pool.query(
      `SELECT p.id, p.amount, p.method, p.account, p.status, p.notes, p.created_at, p.processed_at,
              u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
       FROM payouts p JOIN users u ON p.fisher_id = u.id
       WHERE ${where}
       ORDER BY p.created_at DESC`,
      params
    );
    res.json({ payouts: q.rows });
  } catch (e) {
    console.error('Payouts admin list error:', e);
    res.status(500).json({ error: 'Failed to fetch payouts', message: e.message });
  }
});

// Admin: update payout status
router.patch('/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await ensureSchema();
    const { id } = req.params;
    const { status, notes } = req.body || {};
    const allowed = ['PENDING','APPROVED','PAID','REJECTED'];
    const st = (status || '').toUpperCase();
    if (!allowed.includes(st)) return res.status(400).json({ error: 'Invalid status' });
    const processedAt = (st === 'PAID' || st === 'REJECTED' || st === 'APPROVED') ? new Date() : null;
    const upd = await pool.query(
      `UPDATE payouts SET status = $1, notes = COALESCE($2, notes), processed_at = $3 WHERE id = $4
       RETURNING id, amount, method, account, status, notes, created_at, processed_at`,
      [st, notes || null, processedAt, id]
    );
    if (!upd.rows.length) return res.status(404).json({ error: 'Payout not found' });
    res.json({ message: 'Payout updated', payout: upd.rows[0] });
  } catch (e) {
    console.error('Payout status update error:', e);
    res.status(500).json({ error: 'Failed to update payout', message: e.message });
  }
});

export default router;
