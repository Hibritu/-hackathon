import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

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

export default router;
