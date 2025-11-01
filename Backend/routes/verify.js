import express from 'express';
import CryptoJS from 'crypto-js';
import pool from '../db/connection.js';

const router = express.Router();

// Verify QR code
router.post('/', async (req, res) => {
  try {
    const { encrypted } = req.body;

    if (!encrypted) {
      return res.status(400).json({ error: 'Encrypted QR data is required' });
    }

    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encrypted, process.env.SECRET_KEY);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    // Fetch catch details
    const result = await pool.query(
      `SELECT 
        c.id, c.fish_name, c.weight, c.price, c.freshness, c.lake, c.fisher_id, 
        c.qr_encrypted, c.verified, c.created_at,
        u.id as fisher_id, u.name as fisher_name, u.phone as fisher_phone
      FROM catches c
      JOIN users u ON c.fisher_id = u.id
      WHERE c.id = $1`,
      [decrypted.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Catch not found' });
    }

    const catchData = result.rows[0];

    res.json({
      verified: true,
      catch: {
        id: catchData.id,
        fishName: catchData.fish_name,
        weight: parseFloat(catchData.weight),
        price: parseFloat(catchData.price),
        freshness: catchData.freshness,
        lake: catchData.lake,
        verified: catchData.verified,
        fisher: {
          id: catchData.fisher_id,
          name: catchData.fisher_name,
          phone: catchData.fisher_phone
        },
        createdAt: catchData.created_at
      },
      message: 'Fish traceability verified successfully'
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(400).json({ 
      error: 'Invalid QR code or decryption failed', 
      message: error.message 
    });
  }
});

export default router;
