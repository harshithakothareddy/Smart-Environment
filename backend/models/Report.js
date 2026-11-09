const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Air', 'Water', 'Other'],
      default: 'Air',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      default: '',
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
    reporterName: {
      type: String,
      default: 'Anonymous Citizen',
    },
    evidenceType: {
      type: String,
      default: 'Citizen Witness Log',
    },
    status: {
      type: String,
      enum: ['Pending', 'Investigating', 'Verified', 'Action Taken', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    upvotes: {
      type: Number,
      default: 1,
    },
    actionNote: {
      type: String,
      default: 'Submitted to Environmental Board queue',
    },
    date: {
      type: String,
      default: 'Just now',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
