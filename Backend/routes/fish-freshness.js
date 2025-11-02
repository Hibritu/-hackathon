import express from 'express';
import axios from 'axios';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fish-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || 'ndX29s2dF7YMevR8ZVKe';

// POST /api/fish-freshness/detect - Analyze fish freshness from uploaded image
router.post('/detect', upload.single('image'), async (req, res) => {
  let imagePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    imagePath = req.file.path;
    
    // Read image and convert to base64
    const image = fs.readFileSync(imagePath, { encoding: 'base64' });

    // Call Roboflow API
    const response = await axios({
      method: 'POST',
      url: 'https://detect.roboflow.com/fish-freshness-vyn9g/1',
      params: { 
        api_key: ROBOFLOW_API_KEY,
        confidence: 40, // Lower threshold to 40% to catch more predictions
        overlap: 30
      },
      data: image,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log('Roboflow API Response:', JSON.stringify(response.data, null, 2));

    // Extract predictions
    const predictions = response.data.predictions || [];

    if (predictions.length > 0) {
      // Get the prediction with highest confidence
      const topPrediction = predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );

      const freshnessResult = {
        freshness: topPrediction.class,
        confidence: topPrediction.confidence,
        confidencePercent: (topPrediction.confidence * 100).toFixed(2),
        message: `The fish is likely ${topPrediction.class} (${(topPrediction.confidence * 100).toFixed(2)}% confident).`,
        allPredictions: predictions.map(p => ({
          class: p.class,
          confidence: p.confidence,
          confidencePercent: (p.confidence * 100).toFixed(2)
        })),
        analyzedAt: new Date().toISOString()
      };

      // Clean up uploaded file
      fs.unlinkSync(imagePath);

      return res.json(freshnessResult);
    } else {
      // Clean up uploaded file
      fs.unlinkSync(imagePath);
      
      console.log('No predictions found. Full response:', response.data);
      
      return res.json({
        freshness: 'Unknown',
        confidence: 0,
        message: 'No fish detected in the image. Please upload a clear image of a fish.',
        allPredictions: [],
        debug: {
          imageSize: response.data.image?.width && response.data.image?.height 
            ? `${response.data.image.width}x${response.data.image.height}` 
            : 'unknown',
          modelVersion: '1',
          apiResponse: response.data
        }
      });
    }
  } catch (error) {
    console.error('Fish freshness detection error:', error.message);
    
    // Clean up uploaded file if it exists
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(500).json({
      error: 'Failed to analyze fish freshness',
      message: error?.response?.data?.message || error.message
    });
  }
});

// POST /api/fish-freshness/detect-url - Analyze fish freshness from image URL
router.post('/detect-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Call Roboflow API with image URL
    const response = await axios({
      method: 'POST',
      url: 'https://detect.roboflow.com/fish-freshness-vyn9g/1',
      params: {
        api_key: ROBOFLOW_API_KEY,
        image: imageUrl,
        confidence: 40,
        overlap: 30
      }
    });

    console.log('Roboflow API Response (URL):', JSON.stringify(response.data, null, 2));

    // Extract predictions
    const predictions = response.data.predictions || [];

    if (predictions.length > 0) {
      const topPrediction = predictions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
      );

      return res.json({
        freshness: topPrediction.class,
        confidence: topPrediction.confidence,
        confidencePercent: (topPrediction.confidence * 100).toFixed(2),
        message: `The fish is likely ${topPrediction.class} (${(topPrediction.confidence * 100).toFixed(2)}% confident).`,
        allPredictions: predictions.map(p => ({
          class: p.class,
          confidence: p.confidence,
          confidencePercent: (p.confidence * 100).toFixed(2)
        })),
        analyzedAt: new Date().toISOString()
      });
    } else {
      console.log('No predictions found (URL). Full response:', response.data);
      
      return res.json({
        freshness: 'Unknown',
        confidence: 0,
        message: 'No fish detected in the image.',
        allPredictions: [],
        debug: {
          imageSize: response.data.image?.width && response.data.image?.height 
            ? `${response.data.image.width}x${response.data.image.height}` 
            : 'unknown',
          modelVersion: '1',
          apiResponse: response.data
        }
      });
    }
  } catch (error) {
    console.error('Fish freshness detection error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze fish freshness',
      message: error?.response?.data?.message || error.message
    });
  }
});

export default router;
