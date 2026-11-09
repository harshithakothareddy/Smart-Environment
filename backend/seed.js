require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const Report = require('./models/Report');
const Alert = require('./models/Alert');
const City = require('./models/City');
const Product = require('./models/Product');
const State = require('./models/State');

const INITIAL_REPORTS = [
  {
    id: 'REP-1042',
    category: 'Air',
    title: 'Dense Industrial Smoke Plume from Metal Fabrication Unit',
    description: 'Black plume billowing from factory chimney without scrubber operation since early morning. Heavy sulfur odor spreading across residential blocks.',
    locationName: 'Nacharam Industrial Area, Phase 2',
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4350,
    lng: 78.5620,
    severity: 'High',
    reporterName: 'K. S. Rao',
    evidenceType: 'Photo / Document Attached',
    status: 'Investigating',
    upvotes: 24,
    actionNote: 'Notice dispatched by TSPCB Regional Officer for stack inspection.',
    date: '3 hours ago',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000),
  },
  {
    id: 'REP-1043',
    category: 'Water',
    title: 'Severe Toxic Froth & White Foam Overflowing Spillway',
    description: 'Chemical detergent foam rising over 4 feet high and spilling onto the road bridge after sudden upstream discharge.',
    locationName: 'Bellandur Lake North Canal Outlet',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9352,
    lng: 77.6710,
    severity: 'Critical',
    reporterName: 'Priya Narayanan',
    evidenceType: 'Video Recording Attached',
    status: 'Verified',
    upvotes: 42,
    actionNote: 'Wetland marsh barrier deployed; water samples collected for BOD/COD testing.',
    date: '5 hours ago',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000),
  },
  {
    id: 'REP-1044',
    category: 'Air',
    title: 'Unchecked Agricultural Crop Residue Open Burn',
    description: 'Large acreage stubble burning causing thick smog reducing visibility below 50 meters on the expressway corridor.',
    locationName: 'GT Karnal Road Bypass, Outer Ring',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.7450,
    lng: 77.1420,
    severity: 'Critical',
    reporterName: 'Manpreet Singh',
    evidenceType: 'Drone & Ground Photos',
    status: 'Action Taken',
    upvotes: 68,
    actionNote: 'Fire tenders doused hotspot; challan issued under Environment Protection Act.',
    date: 'Yesterday',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000),
  },
  {
    id: 'REP-1045',
    category: 'Water',
    title: 'Untreated Tannery Dark Effluent into River Flow',
    description: 'Dark purple water entering directly from unauthorized bypass drain into the river stream.',
    locationName: 'Jajmau Riverbank Ghat Outlet #4',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    lat: 26.4310,
    lng: 80.3980,
    severity: 'High',
    reporterName: 'Rameshwar Verma',
    evidenceType: 'Water Sample Kit Results Attached',
    status: 'Pending',
    upvotes: 19,
    actionNote: 'Enforcement team scheduled for inspection tomorrow morning.',
    date: 'Yesterday',
    timestamp: new Date(Date.now() - 28 * 3600 * 1000),
  },
  {
    id: 'REP-1046',
    category: 'Air',
    title: 'Demolition Site Dust Without Water Sprinklers / Green Nets',
    description: 'Massive particulate dust blowing onto pedestrian walkway and school perimeter from unshielded building demolition.',
    locationName: 'Andheri East Link Road, Chakala',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.1136,
    lng: 72.8697,
    severity: 'Moderate',
    reporterName: 'Aarav Mehta',
    evidenceType: 'Citizen Witness Log',
    status: 'Verified',
    upvotes: 15,
    actionNote: 'Stop-work notice issued pending installation of anti-smog gun.',
    date: '2 days ago',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000),
  },
];

const INITIAL_ALERTS = [
  {
    id: 1,
    type: 'Air',
    severity: 'Critical',
    title: 'Severe Smog & PM2.5 Spike (>350 µg/m³)',
    location: 'Delhi NCR Region',
    message: 'Extreme particulate matter concentration recorded across monitoring stations. Vulnerable individuals should remain indoors; use N95 respirators outdoors.',
    active: true,
    time: new Date(),
  },
  {
    id: 2,
    type: 'Water',
    severity: 'High',
    title: 'Industrial Chemical Contamination Watch',
    location: 'Yamuna River & Okhla Barrage',
    message: 'Dissolved oxygen dropped below 1.2 mg/L; elevated ammonia levels detected. Direct contact prohibited.',
    active: true,
    time: new Date(Date.now() - 4 * 3600 * 1000),
  },
  {
    id: 3,
    type: 'Air',
    severity: 'Medium',
    title: 'Fugitive Dust & High AQI Advisory',
    location: 'Mumbai Suburban Metro Corridor',
    message: 'Moderate-to-poor air quality with elevated PM10 levels due to dry winds and construction corridors.',
    active: true,
    time: new Date(Date.now() - 12 * 3600 * 1000),
  },
];

const INITIAL_CITIES = [
  { id: 1, name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, aqi: 284, status: 'Hazardous', mainPollutant: 'PM2.5', pm25: 150.5, pm10: 280, no2: 85, so2: 40, o3: 90, co: 3.5, temp: 34, humidity: 55, wind: 12, waterWQI: 38, landSQI: 40 },
  { id: 2, name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, aqi: 235, status: 'Very Unhealthy', mainPollutant: 'PM2.5', pm25: 128.0, pm10: 220, no2: 70, so2: 32, o3: 75, co: 2.8, temp: 35, humidity: 60, wind: 8, waterWQI: 35, landSQI: 38 },
  { id: 3, name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, aqi: 210, status: 'Very Unhealthy', mainPollutant: 'PM2.5', pm25: 110.0, pm10: 200, no2: 65, so2: 28, o3: 70, co: 2.5, temp: 36, humidity: 58, wind: 7, waterWQI: 30, landSQI: 35 },
  { id: 4, name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, aqi: 210, status: 'Very Unhealthy', mainPollutant: 'PM2.5', pm25: 108.5, pm10: 198, no2: 62, so2: 25, o3: 68, co: 2.3, temp: 34, humidity: 65, wind: 6, waterWQI: 32, landSQI: 40 },
  { id: 5, name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, aqi: 168, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 85.0, pm10: 165, no2: 55, so2: 22, o3: 60, co: 2.0, temp: 32, humidity: 75, wind: 10, waterWQI: 42, landSQI: 45 },
  { id: 6, name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, aqi: 156, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 65.2, pm10: 120, no2: 45, so2: 25, o3: 50, co: 1.2, temp: 29, humidity: 82, wind: 18, waterWQI: 55, landSQI: 60 },
  { id: 7, name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, aqi: 145, status: 'Unhealthy', mainPollutant: 'PM10', pm25: 58.5, pm10: 140, no2: 40, so2: 20, o3: 45, co: 1.0, temp: 37, humidity: 45, wind: 15, waterWQI: 45, landSQI: 42 },
  { id: 8, name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, aqi: 138, status: 'Unhealthy', mainPollutant: 'PM10', pm25: 55.0, pm10: 135, no2: 38, so2: 18, o3: 42, co: 0.9, temp: 38, humidity: 35, wind: 14, waterWQI: 48, landSQI: 55 },
  { id: 9, name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794, aqi: 128, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 48.0, pm10: 125, no2: 35, so2: 14, o3: 38, co: 0.8, temp: 31, humidity: 50, wind: 12, waterWQI: 48, landSQI: 55 },
  { id: 10, name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, aqi: 125, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 46.0, pm10: 118, no2: 32, so2: 12, o3: 36, co: 0.7, temp: 33, humidity: 52, wind: 10, waterWQI: 50, landSQI: 45 },
  { id: 11, name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, aqi: 120, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 43.5, pm10: 115, no2: 30, so2: 10, o3: 34, co: 0.7, temp: 34, humidity: 48, wind: 11, waterWQI: 55, landSQI: 58 },
  { id: 12, name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, aqi: 115, status: 'Unhealthy', mainPollutant: 'PM10', pm25: 41.0, pm10: 112, no2: 28, so2: 9, o3: 32, co: 0.6, temp: 33, humidity: 62, wind: 14, waterWQI: 50, landSQI: 48 },
  { id: 13, name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, aqi: 112, status: 'Unhealthy', mainPollutant: 'PM2.5', pm25: 40.0, pm10: 110, no2: 26, so2: 8, o3: 30, co: 0.6, temp: 33, humidity: 50, wind: 9, waterWQI: 52, landSQI: 48 },
  { id: 14, name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, aqi: 56, status: 'Moderate', mainPollutant: 'PM2.5', pm25: 11.7, pm10: 45, no2: 12, so2: 8, o3: 35, co: 0.5, temp: 31, humidity: 58, wind: 10, waterWQI: 72, landSQI: 68 },
  { id: 15, name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, aqi: 52, status: 'Moderate', mainPollutant: 'PM2.5', pm25: 10.5, pm10: 42, no2: 14, so2: 6, o3: 30, co: 0.4, temp: 27, humidity: 65, wind: 12, waterWQI: 65, landSQI: 70 },
  { id: 16, name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, aqi: 62, status: 'Moderate', mainPollutant: 'PM2.5', pm25: 14.0, pm10: 50, no2: 18, so2: 10, o3: 28, co: 0.6, temp: 32, humidity: 78, wind: 16, waterWQI: 62, landSQI: 65 },
  { id: 17, name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, aqi: 78, status: 'Moderate', mainPollutant: 'PM2.5', pm25: 18.5, pm10: 62, no2: 22, so2: 11, o3: 32, co: 0.6, temp: 28, humidity: 62, wind: 11, waterWQI: 58, landSQI: 62 },
  { id: 18, name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, aqi: 35, status: 'Good', mainPollutant: 'PM10', pm25: 8.5, pm10: 25, no2: 5, so2: 2, o3: 20, co: 0.2, temp: 30, humidity: 85, wind: 14, waterWQI: 82, landSQI: 85 },
];

const INITIAL_STATES = [
  { id: 1, name: 'Telangana', code: 'TS', airAQI: 56, waterQuality: 72, landQuality: 68, overallScore: 64, trend: 'improving', capital: 'Hyderabad', status: 'Moderate' },
  { id: 2, name: 'Maharashtra', code: 'MH', airAQI: 120, waterQuality: 55, landQuality: 60, overallScore: 88, trend: 'worsening', capital: 'Mumbai', status: 'Unhealthy' },
  { id: 3, name: 'Delhi', code: 'DL', airAQI: 284, waterQuality: 38, landQuality: 40, overallScore: 162, trend: 'worsening', capital: 'New Delhi', status: 'Hazardous' },
  { id: 4, name: 'Kerala', code: 'KL', airAQI: 35, waterQuality: 82, landQuality: 85, overallScore: 50, trend: 'improving', capital: 'Thiruvananthapuram', status: 'Good' },
  { id: 5, name: 'Karnataka', code: 'KA', airAQI: 75, waterQuality: 65, landQuality: 70, overallScore: 70, trend: 'stable', capital: 'Bengaluru', status: 'Moderate' },
  { id: 6, name: 'Uttar Pradesh', code: 'UP', airAQI: 235, waterQuality: 30, landQuality: 35, overallScore: 155, trend: 'worsening', capital: 'Lucknow', status: 'Very Unhealthy' },
  { id: 7, name: 'West Bengal', code: 'WB', airAQI: 168, waterQuality: 42, landQuality: 48, overallScore: 110, trend: 'worsening', capital: 'Kolkata', status: 'Unhealthy' },
  { id: 8, name: 'Gujarat', code: 'GJ', airAQI: 145, waterQuality: 45, landQuality: 42, overallScore: 98, trend: 'worsening', capital: 'Gandhinagar', status: 'Unhealthy' },
  { id: 9, name: 'Tamil Nadu', code: 'TN', airAQI: 82, waterQuality: 62, landQuality: 65, overallScore: 72, trend: 'stable', capital: 'Chennai', status: 'Moderate' },
];

const INITIAL_PRODUCTS = [
  { id: 1, name: 'EcoPulse Air Monitor Pro', category: 'Air Quality Monitors', price: 2999, rating: 4.8, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300', description: 'Laser optical PM2.5 & PM10 sensor with real-time Wi-Fi cloud synchronization.' },
  { id: 2, name: 'Smart Home Water Purity Tester', category: 'Water Quality Monitors', price: 1499, rating: 4.6, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300', description: 'Instant multi-parameter digital probe testing pH, TDS, and heavy mineral contamination.' },
  { id: 3, name: 'EcoAir True HEPA Air Purifier H13', category: 'Air Purifiers', price: 8999, rating: 4.9, image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300', description: 'Medical-grade 4-stage filtration capturing 99.97% of airborne toxic particles and smoke.' },
  { id: 4, name: 'Solar UV Water Disinfection System', category: 'Water Purifiers', price: 4499, rating: 4.7, image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300', description: 'Chemical-free ultraviolet disinfection eliminating 99.99% of biological water pathogens.' },
];

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/econexus';
  console.log(`Connecting to MongoDB for seeding: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB. Seeding collections...');

    // Reports
    const reportCount = await Report.countDocuments();
    if (reportCount === 0) {
      await Report.insertMany(INITIAL_REPORTS);
      console.log(`✅ Seeded ${INITIAL_REPORTS.length} citizen reports.`);
    } else {
      console.log(`ℹ️ Reports collection already has ${reportCount} documents.`);
    }

    // Alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      await Alert.insertMany(INITIAL_ALERTS);
      console.log(`✅ Seeded ${INITIAL_ALERTS.length} environmental alerts.`);
    } else {
      console.log(`ℹ️ Alerts collection already has ${alertCount} documents.`);
    }

    // Cities
    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      await City.insertMany(INITIAL_CITIES);
      console.log(`✅ Seeded ${INITIAL_CITIES.length} cities.`);
    } else {
      console.log(`ℹ️ Cities collection already has ${cityCount} documents.`);
    }

    // States
    const stateCount = await State.countDocuments();
    if (stateCount === 0) {
      await State.insertMany(INITIAL_STATES);
      console.log(`✅ Seeded ${INITIAL_STATES.length} states.`);
    } else {
      console.log(`ℹ️ States collection already has ${stateCount} documents.`);
    }

    // Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} products.`);
    } else {
      console.log(`ℹ️ Products collection already has ${productCount} documents.`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Database seeding error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, INITIAL_REPORTS, INITIAL_ALERTS, INITIAL_CITIES, INITIAL_STATES, INITIAL_PRODUCTS };
