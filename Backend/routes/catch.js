import express from 'express';
import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import pool from '../db/connection.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create a new catch (Fisher only)
 */
router.post('/', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    const { fishName, weight, price, freshness, lake, nationalId } = req.body;

    if ( !weight || !price || !freshness || !lake) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create catch record
    const insertQuery = `
      INSERT INTO catches (fish_name, weight, price, freshness, lake, fisher_id, verified, national_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, fish_name, weight, price, freshness, lake, fisher_id, verified, created_at, updated_at
    `;
    const insertParams = [
      fishName,
      parseFloat(weight),
      parseFloat(price),
      freshness,
      lake,
      req.user.id,
      false,
      nationalId || null
    ];

    const result = await pool.query(insertQuery, insertParams);
    const newCatch = result.rows[0];

    // Encrypt catch ID for QR code
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify({ id: newCatch.id }),
      process.env.SECRET_KEY
    ).toString();

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(encrypted);

    // Update catch with encrypted QR code
    const updateQuery = `
      UPDATE catches SET qr_encrypted = $1 
      WHERE id = $2 
      RETURNING id, fish_name, weight, price, freshness, lake, fisher_id, qr_encrypted, verified, national_id, created_at, updated_at
    `;
    const updateResult = await pool.query(updateQuery, [encrypted, newCatch.id]);

    const fisherResult = await pool.query(
      'SELECT id, name, phone FROM users WHERE id = $1',
      [req.user.id]
    );

    const updatedCatch = {
      ...updateResult.rows[0],
      fishName: updateResult.rows[0].fish_name,
      nationalId: updateResult.rows[0].national_id,
      createdAt: updateResult.rows[0].created_at,
      updatedAt: updateResult.rows[0].updated_at,
      fisher: fisherResult.rows[0]
    };

    res.status(201).json({
      message: 'Catch registered successfully',
      catch: updatedCatch,
      qrCode: qrDataUrl,
      encryptedData: encrypted
    });
  } catch (error) {
    console.error('Create catch error:', error);
    res.status(500).json({ error: 'Failed to create catch', message: error.message });
  }
});

/**
 * Get all verified catches (Buyers)
 */
router.get('/', async (req, res) => {
  try {
    const { lake, fishName, freshness, nationalId } = req.query;

    let query = `
      SELECT 
        c.id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, c.national_id,
        c.qr_encrypted, c.verified, c.created_at, c.updated_at,
        u.name AS fisher_name, u.phone AS fisher_phone
      FROM catches c
      JOIN users u ON c.fisher_id = u.id
      WHERE c.verified = TRUE
    `;

    const params = [];
    let paramCount = 1;

    if (lake) {
      query += ` AND LOWER(c.lake) LIKE LOWER($${paramCount++})`;
      params.push(`%${lake}%`);
    }
    if (fishName) {
      query += ` AND LOWER(c.fish_name) LIKE LOWER($${paramCount++})`;
      params.push(`%${fishName}%`);
    }
    if (freshness) {
      query += ` AND LOWER(c.freshness) LIKE LOWER($${paramCount++})`;
      params.push(`%${freshness}%`);
    }
    if (nationalId) {
      query += ` AND c.national_id = $${paramCount++}`;
      params.push(nationalId);
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await pool.query(query, params);

    const catches = result.rows.map(row => ({
      id: row.id,
      fishName: row.fish_name,
      weight: parseFloat(row.weight),
      price: parseFloat(row.price),
      freshness: row.freshness,
      lake: row.lake,
      nationalId: row.national_id,
      qrEncrypted: row.qr_encrypted,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fisher: {
        name: row.fisher_name,
        phone: row.fisher_phone
      }
    }));

    res.json({ catches });
  } catch (error) {
    console.error('Get catches error:', error);
    res.status(500).json({ error: 'Failed to fetch catches', message: error.message });
  }
});

/**
 * Fisher: Get own catches
 */
router.get('/my-catches', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.*, u.name AS fisher_name, u.phone AS fisher_phone
       FROM catches c
       JOIN users u ON c.fisher_id = u.id
       WHERE c.fisher_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const catches = result.rows.map(row => ({
      id: row.id,
      fishName: row.fish_name,
      weight: parseFloat(row.weight),
      price: parseFloat(row.price),
      freshness: row.freshness,
      lake: row.lake,
      nationalId: row.national_id,
      qrEncrypted: row.qr_encrypted,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fisher: {
        name: row.fisher_name,
        phone: row.fisher_phone
      }
    }));

    res.json({ catches });
  } catch (error) {
    console.error('Get my catches error:', error);
    res.status(500).json({ error: 'Failed to fetch catches', message: error.message });
  }
});

/**
 * Fisher: Update own catch
 */
router.put('/:id', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { fishName, weight, price, freshness, lake } = req.body;

    const checkResult = await pool.query('SELECT fisher_id FROM catches WHERE id = $1', [id]);
    if (!checkResult.rows.length) return res.status(404).json({ error: 'Catch not found' });
    if (checkResult.rows[0].fisher_id !== req.user.id)
      return res.status(403).json({ error: 'You can only edit your own catches' });

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (fishName) { updates.push(`fish_name = $${paramCount++}`); params.push(fishName); }
    if (weight)   { updates.push(`weight = $${paramCount++}`); params.push(parseFloat(weight)); }
    if (price)    { updates.push(`price = $${paramCount++}`); params.push(parseFloat(price)); }
    if (freshness){ updates.push(`freshness = $${paramCount++}`); params.push(freshness); }
    if (lake)     { updates.push(`lake = $${paramCount++}`); params.push(lake); }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    params.push(id);
    const query = `
      UPDATE catches
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;
    const updateResult = await pool.query(query, params);

    const fisher = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [req.user.id]);

    res.json({
      message: 'Catch updated successfully',
      catch: {
        ...updateResult.rows[0],
        fishName: updateResult.rows[0].fish_name,
        createdAt: updateResult.rows[0].created_at,
        updatedAt: updateResult.rows[0].updated_at,
        fisher: fisher.rows[0]
      }
    });
  } catch (error) {
    console.error('Update catch error:', error);
    res.status(500).json({ error: 'Failed to update catch', message: error.message });
  }
});

/**
 * Fisher: Delete own catch
 */
router.delete('/:id', authenticate, authorize('FISHER'), async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query('SELECT fisher_id FROM catches WHERE id = $1', [id]);
    if (!check.rows.length) return res.status(404).json({ error: 'Catch not found' });
    if (check.rows[0].fisher_id !== req.user.id)
      return res.status(403).json({ error: 'You can only delete your own catches' });

    await pool.query('DELETE FROM catches WHERE id = $1', [id]);
    res.json({ message: 'Catch deleted successfully' });
  } catch (error) {
    console.error('Delete catch error:', error);
    res.status(500).json({ error: 'Failed to delete catch', message: error.message });
  }
});

/**
 * Admin/Agent: Verify catch
 */
router.patch('/:id/verify', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const isVerified = verified === true || verified === 'true';

    const update = await pool.query(
      `UPDATE catches SET verified = $1 WHERE id = $2 RETURNING *`,
      [isVerified, id]
    );

    if (!update.rows.length) return res.status(404).json({ error: 'Catch not found' });

    const fisher = await pool.query('SELECT id, name, phone FROM users WHERE id = $1', [update.rows[0].fisher_id]);

    res.json({
      message: isVerified ? 'Catch verified successfully' : 'Catch verification removed',
      catch: {
        ...update.rows[0],
        fishName: update.rows[0].fish_name,
        createdAt: update.rows[0].created_at,
        updatedAt: update.rows[0].updated_at,
        fisher: fisher.rows[0]
      }
    });
  } catch (error) {
    console.error('Verify catch error:', error);
    res.status(500).json({ error: 'Failed to verify catch', message: error.message });
  }
});

/**
 * Admin/Agent: Get all catches
 */
router.get('/all', authenticate, authorize('AGENT', 'ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name AS fisher_name, u.phone AS fisher_phone
      FROM catches c
      JOIN users u ON c.fisher_id = u.id
      ORDER BY c.created_at DESC
    `);

    const catches = result.rows.map(row => ({
      id: row.id,
      fishName: row.fish_name,
      weight: parseFloat(row.weight),
      price: parseFloat(row.price),
      freshness: row.freshness,
      lake: row.lake,
      nationalId: row.national_id,
      qrEncrypted: row.qr_encrypted,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      fisher: {
        name: row.fisher_name,
        phone: row.fisher_phone
      }
    }));

    res.json({ catches });
  } catch (error) {
    console.error('Get all catches error:', error);
    res.status(500).json({ error: 'Failed to fetch catches', message: error.message });
  }
});

export default router;
