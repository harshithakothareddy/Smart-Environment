require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'EcoPulse India Backend API',
    database: 'MongoDB',
    status: 'online',
    endpoints: {
      health: '/api/health',
      reports: '/api/reports',
      alerts: '/api/alerts',
      cities: '/api/cities',
      airOverview: '/api/air/overview',
      airRanking: '/api/air/ranking',
      states: '/api/states',
      products: '/api/products',
      search: '/api/search',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EcoPulse Backend Server running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
});
