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
  {
    id: 1,
    name: 'EcoPulse AirSense Pro',
    brand: 'EcoPulse Labs',
    sku: 'EP-AIR-PRO-01',
    category: 'Air Quality Monitors',
    price: 4299,
    originalPrice: 5499,
    rating: 4.8,
    reviews: 1245,
    image: 'air-monitor',
    imageUrl: '/products/air-monitor.jpg',
    description: 'Real-time PM2.5, PM10, CO2, TVOC, Temperature & Humidity monitoring with laser scattering sensor and Wi-Fi mobile app.',
    warranty: '2 Years Manufacturer Warranty',
    highlights: [
      'High-precision laser PM2.5 / PM10 & NDIR CO₂ sensors',
      '2.4 GHz Wi-Fi sync with real-time mobile alerts & 30-day history',
      'Color-coded OLED display with instant WHO/CPCB AQI band',
      '3000mAh USB-C rechargeable battery (up to 14 hrs portable use)',
    ],
    specs: {
      'Measured Parameters': 'PM2.5, PM10, CO₂, TVOC, Temp, Humidity',
      'Sensor Type': 'Laser Scattering + NDIR Infrared',
      'PM2.5 Range': '0 – 999 µg/m³ (±5% accuracy)',
      'Connectivity': 'Wi-Fi 2.4 GHz, Bluetooth 5.0',
      'Battery': '3000mAh Li-ion (USB-C)',
    },
    inTheBox: ['AirSense Pro Monitor', 'USB-C Charging Cable', 'Factory Calibration Certificate', 'User Manual'],
    inStock: true,
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'AirPure 360 Smart Purifier',
    brand: 'AirPure India',
    sku: 'AP-360-HEPA-02',
    category: 'Air Purifiers',
    price: 9999,
    originalPrice: 12999,
    rating: 4.9,
    reviews: 892,
    image: 'air-purifier',
    imageUrl: '/products/air-purifier.svg',
    description: '360° True HEPA H13 + Activated Carbon filtration with 500 sq ft coverage, auto AQI fan speed, and ultra-quiet 22 dB sleep mode.',
    warranty: '2 Years Motor & Electronics Warranty',
    highlights: [
      '3-stage Pre-filter, True HEPA H13 (99.97% @ 0.3 µm) & Carbon filter',
      '380 m³/h CADR — purifies a 500 sq ft room in 15 minutes',
      'Built-in PM2.5 laser sensor with auto-adjusting fan speed',
      'Whisper-quiet 22 dB night mode & Alexa / Google Home support',
    ],
    specs: {
      'Coverage Area': 'Up to 500 sq ft (46 m²)',
      'CADR': '380 m³/hr',
      'Filter Grade': 'True HEPA H13 + Activated Carbon',
      'Noise Level': '22 dB (Sleep) – 52 dB (Turbo)',
      'Power Consumption': '38W BLDC Motor',
    },
    inTheBox: ['AirPure 360 Tower', 'Pre-installed 360° H13 Filter', 'Power Cord', 'Quick Start Guide'],
    inStock: true,
    badge: 'Top Rated',
  },
  {
    id: 3,
    name: 'EcoTest Water Meter PRO',
    brand: 'EcoTest Instruments',
    sku: 'ET-H2O-PRO-03',
    category: 'Water Quality Monitors',
    price: 1899,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 678,
    image: 'water-monitor',
    imageUrl: '/products/water-monitor.jpg',
    description: '5-in-1 digital TDS, pH, EC, ORP, and temperature meter with automatic temperature compensation (ATC) for drinking water & lab checks.',
    warranty: '1 Year Replacement Warranty',
    highlights: [
      'Measures pH (0.00–14.00), TDS (0–9999 ppm), EC, ORP & Temp',
      'Automatic Temperature Compensation (ATC) from 0°C to 60°C',
      'IP67 waterproof body with backlit LCD & Hold/Auto-off',
      'Includes 3 pH calibration buffer sachets (pH 4.00, 6.86, 9.18)',
    ],
    specs: {
      'Parameters': 'pH, TDS, EC, ORP, Temperature',
      'pH Accuracy': '±0.01 pH',
      'TDS Range': '0 – 9999 ppm (±2% F.S.)',
      'Waterproof Rating': 'IP67',
      'Power': '3 × LR44 Button Cells (Included)',
    },
    inTheBox: ['EcoTest Water Meter PRO', 'Protective Cap', 'pH Calibration Powders (3x)', 'User Guide'],
    inStock: true,
    badge: null,
  },
  {
    id: 4,
    name: 'ClearFlow Water Filter 7-Stage',
    brand: 'ClearFlow Systems',
    sku: 'CF-ROUV-7S-04',
    category: 'Water Filters',
    price: 15999,
    originalPrice: 19999,
    rating: 4.7,
    reviews: 534,
    image: 'water-filter',
    imageUrl: '/products/water-filter.jpg',
    description: '7-stage RO + UV + UF + Alkaline Mineralizer purifier removing 99.9% dissolved salts, heavy metals, bacteria, and microplastics.',
    warranty: '1 Year Comprehensive + Free Installation',
    highlights: [
      '7-stage Sediment, Carbon, RO, UV-C, UF, Mineral & Copper guard',
      'Handles high-TDS borewell & municipal water up to 2000 ppm',
      'Smart LED filter life & tank-full indicators',
      '8-litre food-grade stainless steel storage tank',
    ],
    specs: {
      'Purification Stages': '7 Stages (RO + UV + UF + Alkaline)',
      'Input TDS Limit': 'Up to 2000 ppm',
      'Storage Capacity': '8 Litres (304 Stainless Steel)',
      'Purification Rate': '15 Litres / Hour',
      'Power Rating': '45W (230V AC)',
    },
    inTheBox: ['ClearFlow 7-Stage Purifier', 'Installation Kit & Diverter Valve', 'User Manual & Warranty Card'],
    inStock: true,
    badge: 'Top Rated',
  },
  {
    id: 5,
    name: 'GreenCheck Soil Test Kit',
    brand: 'GreenCheck Agri',
    sku: 'GC-SOIL-50-05',
    category: 'Soil Testing Kits',
    price: 799,
    originalPrice: 999,
    rating: 4.4,
    reviews: 312,
    image: 'soil-kit',
    imageUrl: '/products/soil-kit.jpg',
    description: 'Complete home & farm soil diagnostic kit to test Nitrogen (N), Phosphorus (P), Potassium (K), soil pH, and moisture levels.',
    warranty: '6 Months Reagent Shelf Warranty',
    highlights: [
      '50+ colorimetric tests for N, P, K and soil pH (4.0 – 9.0)',
      'Includes dual-probe analog moisture & light meter (no battery needed)',
      'Clear laminated color chart for instant nutrient deficiency diagnosis',
      'Ideal for kitchen gardens, terrace farms, lawns, and agriculture',
    ],
    specs: {
      'Tests Included': '50 Tests (pH, N, P, K)',
      'Probe Type': 'Dual-Prong Soil Moisture & pH Probe',
      'pH Range': '4.0 – 9.0 pH',
      'Result Time': 'Under 5 minutes per sample',
      'Weight': '420 g (Portable Carry Box)',
    },
    inTheBox: ['Reagent Dropper Bottles (4x)', 'Glass Test Tubes (4x)', 'Soil Probe Meter', 'Color Comparison Chart'],
    inStock: true,
    badge: null,
  },
  {
    id: 6,
    name: 'SenseHub Indoor Station',
    brand: 'SenseHub',
    sku: 'SH-IND-06',
    category: 'Indoor Environment Sensors',
    price: 5499,
    originalPrice: 6999,
    rating: 4.7,
    reviews: 445,
    image: 'indoor-sensor',
    imageUrl: '/products/indoor-sensor.jpg',
    description: 'All-in-one indoor comfort & wellness hub tracking PM2.5, CO2, ambient noise (dB), lux light level, temperature, and humidity.',
    warranty: '2 Years Manufacturer Warranty',
    highlights: [
      'Monitors 6 indoor health metrics including decibel noise & lux',
      'Matter & HomeKit compatible for smart home ventilation automation',
      'High-contrast IPS circular display with auto-dimming night mode',
      'Exports CSV/JSON logs via web dashboard',
    ],
    specs: {
      'Metrics': 'PM2.5, CO₂, Noise (dBA), Light (Lux), Temp, RH',
      'Noise Range': '30 – 110 dBA (±1.5 dB)',
      'Connectivity': 'Wi-Fi 2.4/5 GHz, Matter, Bluetooth',
      'Power': 'USB-C 5V/2A Adapter Included',
      'Material': 'Anodized Aluminum & Gorilla Glass',
    },
    inTheBox: ['SenseHub Station', 'USB-C Power Adapter', 'Braided Cable', 'Quick Setup Guide'],
    inStock: false,
    badge: 'New',
  },
  {
    id: 7,
    name: 'EcoMask N99 Pro',
    brand: 'EcoMask',
    sku: 'EM-N99-PRO-07',
    category: 'Pollution Protection',
    price: 1299,
    originalPrice: 1699,
    rating: 4.5,
    reviews: 1890,
    image: 'eco-mask',
    imageUrl: '/products/eco-mask.jpg',
    description: 'Certified N99 / FFP3 6-layer anti-pollution mask with activated carbon layer, valve-less breathable design, and 2 replaceable filters.',
    warranty: '6 Months Stitching & Strap Warranty',
    highlights: [
      'Blocks 99.7% of PM2.5, PM10, smoke, pollen & traffic exhaust',
      '6-layer nanofiber + activated carbon filtration',
      'Valve-less ergonomic seal prevents glasses from fogging',
      'Washable cotton-mesh outer shell + 2 replaceable 100-hr filters',
    ],
    specs: {
      'Filtration Efficiency': '≥ 99.7% @ 0.3 µm (N99 / FFP3)',
      'Filter Layers': '6 Layers (Meltblown + Activated Carbon)',
      'Filter Lifespan': '200 hours total (2 × 100-hr filters)',
      'Washability': 'Hand-washable outer shell',
      'Sizes': 'Adjustable Universal Fit (M/L)',
    },
    inTheBox: ['EcoMask N99 Pro Shell', '2 × N99 Activated Carbon Filters', 'Carry Pouch'],
    inStock: true,
    badge: 'Best Seller',
  },
  {
    id: 8,
    name: 'SmartNoise Earplug+',
    brand: 'EcoMask Audio',
    sku: 'EM-EAR-08',
    category: 'Pollution Protection',
    price: 499,
    originalPrice: 699,
    rating: 4.3,
    reviews: 220,
    image: 'earplug',
    imageUrl: '/products/earplug.svg',
    description: 'Reusable acoustic-filter earplugs reducing harsh traffic & urban noise by 24 dB while keeping speech and sirens clear.',
    warranty: '1 Year Warranty',
    highlights: [
      '24 dB SNR flat-attenuation acoustic filter (no muffled sound)',
      'Medical-grade hypoallergenic liquid silicone tips (S, M, L)',
      'Ideal for daily metro/bike commutes, focus work, and sleep',
      'Includes waterproof anodized aluminum keychain carry case',
    ],
    specs: {
      'Noise Reduction': '24 dB SNR',
      'Material': 'Medical-Grade Silicone + Acoustic Mesh',
      'Ear Tip Sizes': '3 Pairs (Small, Medium, Large)',
      'Weight': '4.2 g per pair',
      'Case': 'Anodized Aluminum Keychain Case',
    },
    inTheBox: ['SmartNoise Earplug+ Pair', '3 Pairs Silicone Tips (S/M/L)', 'Aluminum Carry Case'],
    inStock: true,
    badge: null,
  },
  {
    id: 9,
    name: 'EcoPulse Desktop Monitor',
    brand: 'EcoPulse Labs',
    sku: 'EP-DESK-09',
    category: 'Air Quality Monitors',
    price: 2499,
    originalPrice: 3199,
    rating: 4.6,
    reviews: 560,
    image: 'desktop-monitor',
    imageUrl: '/products/desktop-monitor.svg',
    description: 'Compact angled desk AQI display tracking PM2.5, CO2, TVOC, Temperature, and Humidity with audible ventilation reminder.',
    warranty: '1 Year Manufacturer Warranty',
    highlights: [
      'Always-on angled 3.5" color LCD ideal for study & office desks',
      'Real-time PM2.5, CO₂ & TVOC alerts when room air gets stale',
      'Built-in 2000mAh backup battery + continuous USB-C power',
      'Zero app required — works out of the box in 10 seconds',
    ],
    specs: {
      'Parameters': 'PM2.5, CO₂, TVOC, Temp, Humidity',
      'Display': '3.5" Color TFT LCD (Angled)',
      'Alert Threshold': 'Configurable CO₂ (>1000 ppm) & PM2.5',
      'Power': 'USB-C + 2000mAh Backup Battery',
      'Dimensions': '105 × 72 × 58 mm',
    },
    inTheBox: ['Desktop Monitor', 'USB-C Cable (1.5m)', 'Quick Reference Card'],
    inStock: true,
    badge: null,
  },
  {
    id: 10,
    name: 'PurePlant Indoor Kit',
    brand: 'PurePlant India',
    sku: 'PP-KIT-10',
    category: 'Environmental Accessories',
    price: 1199,
    originalPrice: 1499,
    rating: 4.2,
    reviews: 188,
    image: 'plant-kit',
    imageUrl: '/products/plant-kit.svg',
    description: 'Curated NASA-studied indoor air-purifying plant set (Snake Plant, Peace Lily, Areca Palm & Money Plant) with ceramic pots & organic coco-peat.',
    warranty: '7-Day Live Plant Transit Guarantee',
    highlights: [
      '4 natural air-purifying plants targeting VOCs, benzene & formaldehyde',
      'Includes 4 matte ceramic self-draining pots with bamboo saucers',
      'Enriched organic vermicompost & coco-peat potting mix included',
      'Low-maintenance indoor care guide for Indian apartments',
    ],
    specs: {
      'Plants Included': 'Snake Plant, Peace Lily, Areca Palm, Pothos',
      'Pot Material': 'Matte Ceramic (4.5-inch diameter)',
      'Soil Mix': 'Organic Coco-Peat + Vermicompost (2 kg)',
      'Light Needs': 'Low to Indirect Bright Light',
      'Pet Safety': 'Includes care & placement notes',
    },
    inTheBox: ['4 Live Healthy Saplings', '4 Matte White Ceramic Pots', '2 kg Organic Potting Mix', 'Care Guide'],
    inStock: true,
    badge: 'Eco Pick',
  },
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
