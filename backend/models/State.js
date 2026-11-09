const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      default: '',
    },
    capital: {
      type: String,
      default: '',
    },
    airAQI: {
      type: Number,
      default: 50,
    },
    waterQuality: {
      type: Number,
      default: 60,
    },
    landQuality: {
      type: Number,
      default: 60,
    },
    overallScore: {
      type: Number,
      default: 60,
    },
    trend: {
      type: String,
      enum: ['improving', 'stable', 'worsening'],
      default: 'stable',
    },
    status: {
      type: String,
      default: 'Moderate',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('State', stateSchema);
