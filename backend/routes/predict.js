const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Prediction = require('../models/Prediction');

const upload = multer({ dest: 'uploads/' });
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

// Auth middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Predict from Text
router.post('/text', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        // Call Python ML API
        const response = await axios.post(`${ML_API_URL}/predict_text`, { text });
        
        const { confidence_score, risk_level, recommendation } = response.data;

        // Save prediction to DB
        const newPrediction = new Prediction({
            userId: req.user.id,
            inputType: 'text',
            rawInputData: text.substring(0, 100), // store snippet
            predictionScore: confidence_score,
            riskLevel: risk_level,
            recommendation
        });

        await newPrediction.save();
        res.json(newPrediction);

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error or ML Service Unavailable');
    }
});

// Predict from Audio
router.post('/audio', auth, upload.single('file'), async (req, res) => {
    try {
        // Forward file to Python ML API
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
        
        const response = await axios.post(`${ML_API_URL}/predict_audio`, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        const { confidence_score, risk_level, recommendation } = response.data;
        
        // Cleanup local file
        fs.unlinkSync(req.file.path);

        const newPrediction = new Prediction({
            userId: req.user.id,
            inputType: 'audio',
            rawInputData: req.file.originalname,
            predictionScore: confidence_score,
            riskLevel: risk_level,
            recommendation
        });

        await newPrediction.save();
        res.json(newPrediction);

    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send('Server Error or ML Service Unavailable');
    }
});

// Get User History
router.get('/history', auth, async (req, res) => {
    try {
        const history = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
