const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

// Models
const Report = require('../models/Report');
const Alert = require('../models/Alert');
const City = require('../models/City');
const Product = require('../models/Product');
const State = require('../models/State');

// Fallback Mock Data
const { states: fallbackStates, cities: fallbackCities, products: fallbackProducts, news } = require('../data/mockData');
const { INITIAL_REPORTS: fallbackReports, INITIAL_ALERTS: fallbackAlerts } = require('../seed');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ==================== HEALTH & STATUS ====================
router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB',
      ...dbStatus,
    },
  });
});

// ==================== CITIZEN REPORTS (CRUD) ====================
// GET all reports
router.get('/reports', async (req, res) => {
  try {
    if (isDbConnected()) {
      const reports = await Report.find().sort({ timestamp: -1 });
      if (reports.length > 0) {
        return res.json({ source: 'mongodb', data: reports, count: reports.length });
      }
    }
    res.json({ source: 'fallback', data: fallbackReports, count: fallbackReports.length });
  } catch (err) {
    console.error('Error fetching reports from MongoDB:', err.message);
    res.json({ source: 'fallback', data: fallbackReports, count: fallbackReports.length });
  }
});

// POST new report
router.post('/reports', async (req, res) => {
  try {
    const reportData = {
      id: req.body.id || `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: req.body.category || 'Air',
      title: req.body.title || 'Pollution Incident',
      description: req.body.description || '',
      locationName: req.body.locationName || '',
      city: req.body.city || 'Delhi',
      state: req.body.state || '',
      lat: Number(req.body.lat) || 28.6139,
      lng: Number(req.body.lng) || 77.2090,
      severity: req.body.severity || 'Moderate',
      reporterName: req.body.reporterName || 'Anonymous Citizen',
      evidenceType: req.body.evidenceType || 'Citizen Witness Log',
      status: req.body.status || 'Pending',
      upvotes: req.body.upvotes || 1,
      actionNote: req.body.actionNote || 'Submitted to Environmental Board queue',
      date: 'Just now',
      timestamp: new Date(),
    };

    if (isDbConnected()) {
      const created = await Report.create(reportData);
      return res.status(201).json({ source: 'mongodb', success: true, data: created });
    }

    res.status(201).json({ source: 'memory', success: true, data: reportData });
  } catch (err) {
    console.error('Error creating report in MongoDB:', err.message);
    res.status(500).json({ error: 'Failed to create report', details: err.message });
  }
});

// PATCH upvote report
router.patch('/reports/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const updated = await Report.findOneAndUpdate(
        { id },
        { $inc: { upvotes: 1 } },
        { new: true }
      );
      if (updated) {
        return res.json({ source: 'mongodb', success: true, data: updated });
      }
    }
    res.json({ source: 'fallback', success: true, id, upvotes: 1 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote report', details: err.message });
  }
});

// PATCH report status / action note
router.patch('/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actionNote } = req.body;
    if (isDbConnected()) {
      const updateFields = {};
      if (status) updateFields.status = status;
      if (actionNote) updateFields.actionNote = actionNote;

      const updated = await Report.findOneAndUpdate(
        { id },
        { $set: updateFields },
        { new: true }
      );
      if (updated) {
        return res.json({ source: 'mongodb', success: true, data: updated });
      }
    }
    res.json({ source: 'fallback', success: true, id, status, actionNote });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report status', details: err.message });
  }
});

// DELETE report
router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await Report.findOneAndDelete({ id });
      return res.json({ source: 'mongodb', success: true, message: `Report ${id} deleted` });
    }
    res.json({ source: 'fallback', success: true, message: `Report ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report', details: err.message });
  }
});

// ==================== ALERTS (CRUD) ====================
// GET alerts
router.get('/alerts', async (req, res) => {
  try {
    if (isDbConnected()) {
      const alerts = await Alert.find().sort({ time: -1 });
      if (alerts.length > 0) {
        return res.json({ source: 'mongodb', data: alerts });
      }
    }
    res.json({ source: 'fallback', data: fallbackAlerts });
  } catch (err) {
    res.json({ source: 'fallback', data: fallbackAlerts });
  }
});

// POST alert
router.post('/alerts', async (req, res) => {
  try {
    const alertData = {
      id: req.body.id || Date.now(),
      type: req.body.type || 'Air',
      severity: req.body.severity || 'Medium',
      title: req.body.title || 'Environmental Alert',
      location: req.body.location || 'India',
      message: req.body.message || '',
      active: req.body.active !== undefined ? req.body.active : true,
      time: new Date(),
    };

    if (isDbConnected()) {
      const created = await Alert.create(alertData);
      return res.status(201).json({ source: 'mongodb', success: true, data: created });
    }
    res.status(201).json({ source: 'memory', success: true, data: alertData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert', details: err.message });
  }
});

// PATCH toggle alert active
router.patch('/alerts/:id/toggle', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isDbConnected()) {
      const current = await Alert.findOne({ id });
      if (current) {
        current.active = !current.active;
        await current.save();
        return res.json({ source: 'mongodb', success: true, data: current });
      }
    }
    res.json({ source: 'fallback', success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle alert', details: err.message });
  }
});

// DELETE alert
router.delete('/alerts/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isDbConnected()) {
      await Alert.findOneAndDelete({ id });
      return res.json({ source: 'mongodb', success: true, message: `Alert ${id} removed` });
    }
    res.json({ source: 'fallback', success: true, message: `Alert ${id} removed` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete alert', details: err.message });
  }
});

// ==================== CITIES & AIR QUALITY ====================
// GET all cities
router.get('/cities', async (req, res) => {
  try {
    if (isDbConnected()) {
      const cities = await City.find().sort({ id: 1 });
      if (cities.length > 0) {
        return res.json({ source: 'mongodb', data: cities });
      }
    }
    res.json({ source: 'fallback', data: fallbackCities });
  } catch (err) {
    res.json({ source: 'fallback', data: fallbackCities });
  }
});

// GET Air Quality Overview
router.get('/air/overview', async (req, res) => {
  try {
    if (isDbConnected()) {
      const cities = await City.find();
      if (cities.length > 0) {
        const avgAQI = Math.round(cities.reduce((sum, c) => sum + (c.aqi || 0), 0) / cities.length);
        const avgPM25 = +(cities.reduce((sum, c) => sum + (c.pm25 || 0), 0) / cities.length).toFixed(1);
        const avgPM10 = Math.round(cities.reduce((sum, c) => sum + (c.pm10 || 0), 0) / cities.length);
        return res.json({
          source: 'mongodb',
          aqi: avgAQI,
          status: avgAQI <= 50 ? 'Good' : avgAQI <= 100 ? 'Moderate' : avgAQI <= 200 ? 'Unhealthy' : 'Hazardous',
          mainPollutant: 'PM2.5',
          pm25: avgPM25,
          pm10: avgPM10,
          no2: 24,
          so2: 14,
          o3: 36,
          co: 1.1,
          location: 'National Average (India)',
          totalMonitoredCities: cities.length,
          timestamp: new Date().toISOString(),
        });
      }
    }
    res.json({
      source: 'fallback',
      aqi: 92,
      status: 'Moderate',
      mainPollutant: 'PM2.5',
      pm25: 38.5,
      pm10: 95,
      no2: 22,
      so2: 12,
      o3: 34,
      co: 0.9,
      location: 'India Average',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate air overview', details: err.message });
  }
});

// GET Air Ranking
router.get('/air/ranking', async (req, res) => {
  try {
    const { order = 'desc' } = req.query;
    let cityList = [];

    if (isDbConnected()) {
      cityList = await City.find();
    }
    if (!cityList || cityList.length === 0) {
      cityList = fallbackCities;
    }

    const data = cityList.map((c) => ({
      name: c.name,
      state: c.state,
      aqi: c.aqi,
      mainPollutant: c.mainPollutant,
      status: c.status,
      pm25: c.pm25,
      pm10: c.pm10,
    }));

    data.sort((a, b) => (order === 'desc' ? b.aqi - a.aqi : a.aqi - b.aqi));
    data.forEach((d, i) => (d.rank = i + 1));

    res.json({
      source: isDbConnected() ? 'mongodb' : 'fallback',
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch air ranking', details: err.message });
  }
});

// GET Air by City Name
router.get('/air/city/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    let city = null;

    if (isDbConnected()) {
      city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    }
    if (!city) {
      city = fallbackCities.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    }

    if (!city) {
      return res.status(404).json({ error: `City '${cityName}' not found` });
    }

    res.json({
      source: isDbConnected() && city._id ? 'mongodb' : 'fallback',
      ...city.toObject ? city.toObject() : city,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch city air quality', details: err.message });
  }
});

// ==================== WATER QUALITY ====================
router.get('/water/overview', (req, res) => {
  res.json({
    source: isDbConnected() ? 'mongodb' : 'fallback',
    wqi: 72,
    status: 'Moderate',
    pH: 7.2,
    dissolvedOxygen: 6.5,
    turbidity: 4.2,
    bod: 3.1,
    cod: 12.5,
    nitrate: 5.8,
    phosphate: 0.3,
    timestamp: new Date().toISOString(),
  });
});

router.get('/water/ranking', (req, res) => {
  const waterBodies = [
    { rank: 1, name: 'Periyar River', state: 'Kerala', wqi: 88, status: 'Good', mainPollutant: 'None' },
    { rank: 2, name: 'Mula-Mutha', state: 'Maharashtra', wqi: 52, status: 'Poor', mainPollutant: 'BOD' },
    { rank: 3, name: 'Sabarmati', state: 'Gujarat', wqi: 45, status: 'Unhealthy', mainPollutant: 'Heavy Metals' },
    { rank: 4, name: 'Ganga (Kanpur)', state: 'Uttar Pradesh', wqi: 38, status: 'Very Unhealthy', mainPollutant: 'COD' },
    { rank: 5, name: 'Yamuna River', state: 'Delhi', wqi: 22, status: 'Hazardous', mainPollutant: 'BOD & Ammonia' },
  ];
  res.json({ source: 'reference', data: waterBodies, timestamp: new Date().toISOString() });
});

// ==================== STATES ====================
router.get('/states', async (req, res) => {
  try {
    if (isDbConnected()) {
      const states = await State.find().sort({ id: 1 });
      if (states.length > 0) {
        return res.json({ source: 'mongodb', data: states, timestamp: new Date().toISOString() });
      }
    }
    res.json({ source: 'fallback', data: fallbackStates, timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({ source: 'fallback', data: fallbackStates, timestamp: new Date().toISOString() });
  }
});

router.get('/states/:stateName', async (req, res) => {
  try {
    const { stateName } = req.params;
    let state = null;
    if (isDbConnected()) {
      state = await State.findOne({ name: new RegExp(`^${stateName}$`, 'i') });
    }
    if (!state) {
      state = fallbackStates.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    }
    if (!state) return res.status(404).json({ error: 'State not found' });
    res.json({ source: isDbConnected() && state._id ? 'mongodb' : 'fallback', ...state.toObject ? state.toObject() : state, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch state', details: err.message });
  }
});

// ==================== OVERALL RANKING ====================
router.get('/ranking/overall', async (req, res) => {
  try {
    let stateList = [];
    if (isDbConnected()) {
      stateList = await State.find();
    }
    if (!stateList || stateList.length === 0) {
      stateList = fallbackStates;
    }
    const ranked = stateList.map((s) => ({
      id: s.id,
      name: s.name,
      airAQI: s.airAQI,
      waterQuality: s.waterQuality,
      overallScore: Math.round(s.airAQI * 0.5 + (100 - s.waterQuality) * 0.5),
      trend: s.trend,
      status: s.status,
    })).sort((a, b) => b.overallScore - a.overallScore);

    ranked.forEach((r, i) => (r.rank = i + 1));
    res.json({ source: isDbConnected() ? 'mongodb' : 'fallback', data: ranked, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate overall ranking', details: err.message });
  }
});

// ==================== PRODUCTS ====================
router.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    let productsList = [];

    if (isDbConnected()) {
      const query = {};
      if (category) query.category = category;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      productsList = await Product.find(query);
    }

    if (!productsList || productsList.length === 0) {
      let filtered = [...fallbackProducts];
      if (category) filtered = filtered.filter((p) => p.category === category);
      if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
      if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
      if (search) filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
      productsList = filtered;
    }

    res.json({ source: isDbConnected() ? 'mongodb' : 'fallback', data: productsList, timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({ source: 'fallback', data: fallbackProducts, timestamp: new Date().toISOString() });
  }
});

router.get('/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    let product = null;
    if (isDbConnected()) {
      product = await Product.findOne({ id });
    }
    if (!product) {
      product = fallbackProducts.find((p) => p.id === id);
    }
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ source: isDbConnected() && product._id ? 'mongodb' : 'fallback', ...product.toObject ? product.toObject() : product, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err.message });
  }
});

// ==================== NEWS ====================
router.get('/news', (req, res) => {
  const { category } = req.query;
  let filtered = [...news];
  if (category) filtered = filtered.filter((n) => n.category === category);
  res.json({ source: 'live-feed', data: filtered, timestamp: new Date().toISOString() });
});

// ==================== SEARCH ====================
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ data: [] });
  const lq = q.toLowerCase();

  try {
    let matchedCities = [];
    let matchedStates = [];
    let matchedProducts = [];
    let matchedReports = [];

    if (isDbConnected()) {
      matchedCities = await City.find({ name: { $regex: lq, $options: 'i' } }).limit(5);
      matchedStates = await State.find({ name: { $regex: lq, $options: 'i' } }).limit(5);
      matchedProducts = await Product.find({ name: { $regex: lq, $options: 'i' } }).limit(5);
      matchedReports = await Report.find({
        $or: [
          { title: { $regex: lq, $options: 'i' } },
          { locationName: { $regex: lq, $options: 'i' } },
        ],
      }).limit(5);
    } else {
      matchedCities = fallbackCities.filter((c) => c.name.toLowerCase().includes(lq)).slice(0, 5);
      matchedStates = fallbackStates.filter((s) => s.name.toLowerCase().includes(lq)).slice(0, 5);
      matchedProducts = fallbackProducts.filter((p) => p.name.toLowerCase().includes(lq)).slice(0, 5);
    }

    res.json({
      source: isDbConnected() ? 'mongodb' : 'fallback',
      data: [
        ...matchedCities.map((c) => ({ type: 'city', ...(c.toObject ? c.toObject() : c) })),
        ...matchedStates.map((s) => ({ type: 'state', ...(s.toObject ? s.toObject() : s) })),
        ...matchedProducts.map((p) => ({ type: 'product', ...(p.toObject ? p.toObject() : p) })),
        ...matchedReports.map((r) => ({ type: 'report', ...(r.toObject ? r.toObject() : r) })),
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
