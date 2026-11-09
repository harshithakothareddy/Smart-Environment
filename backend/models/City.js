const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
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
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    aqi: {
      type: Number,
      default: 50,
    },
    status: {
      type: String,
      default: 'Moderate',
    },
    mainPollutant: {
      type: String,
      default: 'PM2.5',
    },
    pm25: {
      type: Number,
      default: 0,
    },
    pm10: {
      type: Number,
      default: 0,
    },
    no2: {
      type: Number,
      default: 0,
    },
    so2: {
      type: Number,
      default: 0,
    },
    o3: {
      type: Number,
      default: 0,
    },
    co: {
      type: Number,
      default: 0,
    },
    temp: {
      type: Number,
      default: 30,
    },
    humidity: {
      type: Number,
      default: 50,
    },
    wind: {
      type: Number,
      default: 10,
    },
    waterWQI: {
      type: Number,
      default: 60,
    },
    landSQI: {
      type: Number,
      default: 60,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('City', citySchema);
