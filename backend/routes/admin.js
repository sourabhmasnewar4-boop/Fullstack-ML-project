const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Prediction = require('../models/Prediction');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

// Admin Auth middleware
const adminAuth = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access required' });
        }
        
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Get Dashboard Stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const predCount = await Prediction.countDocuments();
        
        const highRiskCount = await Prediction.countDocuments({ riskLevel: 'High' });
        
        const recentPredictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email');

        res.json({
            userCount,
            totalPredictions: predCount,
            highRiskCount,
            recentPredictions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
