const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inputType: {
        type: String,
        enum: ['text', 'audio'],
        required: true
    },
    rawInputData: {
        type: String,
        default: '' // Storing text excerpt or audio filename
    },
    predictionScore: {
        type: Number,
        required: true
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    recommendation: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
