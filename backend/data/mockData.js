const states = [
  { id: 1, name: 'Telangana', airAQI: 56, waterQuality: 72, overallScore: 64, trend: 'improving', status: 'Moderate' },
  { id: 2, name: 'Maharashtra', airAQI: 120, waterQuality: 55, overallScore: 88, trend: 'worsening', status: 'Unhealthy' },
  { id: 3, name: 'Delhi', airAQI: 284, waterQuality: 40, overallScore: 162, trend: 'worsening', status: 'Hazardous' },
  { id: 4, name: 'Kerala', airAQI: 35, waterQuality: 85, overallScore: 60, trend: 'improving', status: 'Good' },
  { id: 5, name: 'Karnataka', airAQI: 75, waterQuality: 65, overallScore: 70, trend: 'stable', status: 'Moderate' }
];

const cities = [
  { id: 1, name: 'Hyderabad', state: 'Telangana', aqi: 56, mainPollutant: 'PM2.5', status: 'Moderate', pm25: 11.7, pm10: 45, no2: 12, so2: 8, o3: 35, co: 0.5 },
  { id: 2, name: 'Mumbai', state: 'Maharashtra', aqi: 156, mainPollutant: 'PM2.5', status: 'Unhealthy', pm25: 65.2, pm10: 120, no2: 45, so2: 25, o3: 50, co: 1.2 },
  { id: 3, name: 'New Delhi', state: 'Delhi', aqi: 284, mainPollutant: 'PM2.5', status: 'Hazardous', pm25: 150.5, pm10: 280, no2: 85, so2: 40, o3: 90, co: 3.5 },
  { id: 4, name: 'Kochi', state: 'Kerala', aqi: 35, mainPollutant: 'PM10', status: 'Good', pm25: 8.5, pm10: 25, no2: 5, so2: 2, o3: 20, co: 0.2 },
  { id: 5, name: 'Bengaluru', state: 'Karnataka', aqi: 75, mainPollutant: 'PM2.5', status: 'Moderate', pm25: 25.4, pm10: 60, no2: 20, so2: 10, o3: 40, co: 0.8 }
];

const products = [
  {
    id: 1, name: 'EcoPulse Air Quality Monitor Pro', brand: 'EcoPulse',
    category: 'Air Quality Monitors', price: 2999, originalPrice: 3999, rating: 4.8, reviews: 2847,
    imageUrl: '/products/air-monitor.jpg',
    description: 'Professional-grade air quality monitor tracking PM2.5, PM10, CO2, VOCs, temperature and humidity in real-time.',
    warranty: '1 Year Manufacturer Warranty', inStock: true, badge: 'Best Seller',
    highlights: ['Tracks PM2.5, PM10, CO2, VOC, Temp & Humidity', 'Color LED AQI indicator', 'Mobile app + cloud sync', 'Historical data export'],
    specs: { Sensor: 'Laser particle counter', Display: '2.4" TFT color LCD', Battery: '2500mAh (8h)', Connectivity: 'Wi-Fi 2.4GHz + Bluetooth 5.0' },
    inTheBox: 'Monitor unit, USB-C cable, wall mount bracket, quick-start guide'
  },
  {
    id: 2, name: 'AquaCheck Water Quality Monitor', brand: 'AquaCheck',
    category: 'Water Quality Monitors', price: 1499, originalPrice: 1999, rating: 4.5, reviews: 1234,
    imageUrl: '/products/water-monitor.jpg',
    description: 'Multi-parameter water quality tester measuring pH, TDS, EC, ORP and temperature instantly.',
    warranty: '6 Months Warranty', inStock: true, badge: 'Top Rated',
    highlights: ['Measures pH, TDS, EC, ORP, Temperature', 'Auto temperature compensation', 'IP67 waterproof housing', 'Replaceable electrode tip'],
    specs: { 'pH Range': '0–14 pH (±0.01)', 'TDS Range': '0–9999 ppm', Display: 'Digital LCD', 'Battery Life': '300 hrs continuous' },
    inTheBox: 'Meter unit, calibration solutions (pH 4/7), storage solution, AAA batteries'
  },
  {
    id: 3, name: 'PureFlow Under-Sink Water Filter', brand: 'PureFlow',
    category: 'Water Filters', price: 3499, originalPrice: 4500, rating: 4.6, reviews: 987,
    imageUrl: '/products/water-filter.jpg',
    description: '5-stage RO+UV+UF filtration removing 99.9% of contaminants including heavy metals, bacteria and viruses.',
    warranty: '2 Years Comprehensive Warranty', inStock: true, badge: 'Eco Choice',
    highlights: ['5-stage RO+UV+UF filtration', '12L/hr flow rate', 'Zero water wastage design', 'Smart filter life indicator'],
    specs: { 'Filtration Stages': 5, Capacity: '12 litres/hour', 'TDS Reduction': '95%', Installation: 'Under-sink / countertop' },
    inTheBox: 'Filter unit, tap, 5 filter cartridges, installation kit, manual'
  },
  {
    id: 4, name: 'SoilSense Pro Testing Kit', brand: 'SoilSense',
    category: 'Soil Testing Kits', price: 899, originalPrice: 1299, rating: 4.2, reviews: 456,
    imageUrl: '/products/soil-kit.jpg',
    description: 'Complete DIY soil analysis kit measuring pH, NPK nutrients, moisture and 10 heavy metals.',
    warranty: '30-Day Satisfaction Guarantee', inStock: true,
    highlights: ['Tests pH, N, P, K, moisture', 'Detects 10 heavy metal contaminants', '100 test strips included', 'Expert crop recommendation guide'],
    specs: { 'Tests Per Kit': 100, 'pH Range': '3.5–9.0', 'Metal Detection': '10 heavy metals', 'Result Time': '5–10 minutes' },
    inTheBox: '100 test strips, soil sampler, color comparison chart, 60ml reagent solution, guide'
  },
  {
    id: 5, name: 'SmartHome Indoor Air Station', brand: 'SmartHome',
    category: 'Indoor Air Monitors', price: 4299, originalPrice: 5500, rating: 4.7, reviews: 1876,
    imageUrl: '/products/indoor-sensor.jpg',
    description: 'Comprehensive indoor air quality station monitoring PM2.5, CO2, TVOC, formaldehyde, temperature and humidity.',
    warranty: '1 Year Warranty', inStock: true, badge: 'Staff Pick',
    highlights: ['Detects formaldehyde & TVOC in real-time', 'E-ink display with backlight', 'Smart home integration (Alexa/Google)', '7-day historical trend graphs'],
    specs: { Sensors: 'PM2.5, CO2, TVOC, HCHO, Temp, Humidity', Display: '3.1" E-ink', 'Smart Home': 'Alexa, Google Home, HomeKit', Power: 'USB-C / battery backup' },
    inTheBox: 'Monitor, USB-C cable, desktop stand, quick start guide'
  },
  {
    id: 6, name: 'EcoMask N99 Anti-Pollution Respirator', brand: 'EcoMask',
    category: 'Anti-Pollution Masks', price: 599, originalPrice: 799, rating: 4.4, reviews: 3421,
    imageUrl: '/products/eco-mask.jpg',
    description: 'N99-rated respirator with activated carbon layer filtering PM0.3, PM2.5, smoke, allergens and urban pollutants.',
    warranty: '90-Day Quality Guarantee', inStock: true, badge: 'Popular',
    highlights: ['N99 filtration (99% particle removal)', 'Activated carbon odour layer', 'Ergonomic 3D contour fit', 'Reusable with replaceable filters'],
    specs: { 'Filter Grade': 'N99 / FFP3 equivalent', 'Particle Size': 'PM0.3 and above', 'Filter Life': '200 hours / 30 days', Layers: 5 },
    inTheBox: 'Mask frame, 2 replacement filters, carry pouch, adjustment guide'
  },
  {
    id: 7, name: 'BreathEasy HEPA Air Purifier 400', brand: 'BreathEasy',
    category: 'Air Purifiers', price: 8999, originalPrice: 12000, rating: 4.9, reviews: 2103,
    imageUrl: '/products/air-purifier.svg',
    description: 'Medical-grade True HEPA H13 purifier covering 400 sq ft, removing 99.97% of particles down to 0.3 microns.',
    warranty: '2 Years Warranty + 1 Year Free Filter', inStock: true, badge: 'Award Winner',
    highlights: ['True HEPA H13 + activated carbon', 'Coverage: up to 400 sq ft', 'Ultra-quiet 22dB sleep mode', 'Real-time AQI feedback display'],
    specs: { 'CADR Rating': '400 m³/hr', 'Filter Type': 'True HEPA H13 + carbon', Coverage: '400 sq ft', Noise: '22dB–55dB', Power: '45W' },
    inTheBox: 'Purifier unit, pre-installed H13 HEPA filter, remote, manual'
  },
  {
    id: 8, name: 'SilentGuard Premium Noise-Reduction Earplugs', brand: 'SilentGuard',
    category: 'Noise Pollution Solutions', price: 349, originalPrice: 499, rating: 4.3, reviews: 892,
    imageUrl: '/products/earplug.svg',
    description: 'High-fidelity silicone earplugs with 32dB NRR rating, designed for urban noise pollution and sleep.',
    warranty: '6-Month Warranty', inStock: true,
    highlights: ['32 dB NRR noise reduction', 'Medical-grade silicone', 'Fits all ear canal sizes', 'Washable and reusable 200+ times'],
    specs: { 'NRR Rating': '32 dB', Material: 'Medical-grade silicone', 'Frequency Range': '20Hz–20kHz (attenuated)', 'Size Options': 'S / M / L included' },
    inTheBox: '3 pairs of earplugs (S/M/L), aluminium carry case, cleaning cloth'
  },
  {
    id: 9, name: 'EnviroDesk Desktop Environmental Monitor', brand: 'EnviroDesk',
    category: 'Air Quality Monitors', price: 5499, originalPrice: 6999, rating: 4.6, reviews: 743,
    imageUrl: '/products/desktop-monitor.svg',
    description: 'All-in-one desktop monitor for offices tracking CO2, PM2.5, temperature, humidity and noise levels with traffic-light alerts.',
    warranty: '1 Year Warranty', inStock: true, badge: 'Office Choice',
    highlights: ['CO2, PM2.5, Temp, Humidity, Noise', 'Traffic-light LED alert system', 'USB-C powered — no batteries', 'Data export via USB / Wi-Fi'],
    specs: { 'Sensors': 'CO2, PM2.5, Temp, Humidity, Noise', Display: '4" IPS touchscreen', Connectivity: 'Wi-Fi, USB-C data', Power: 'USB-C (5V 2A)' },
    inTheBox: 'Monitor, USB-C cable, desk stand, software CD, manual'
  },
  {
    id: 10, name: 'GreenThumb Indoor Plant Starter Kit', brand: 'GreenThumb',
    category: 'Eco-Friendly Products', price: 1299, originalPrice: 1799, rating: 4.5, reviews: 1567,
    imageUrl: '/products/plant-kit.svg',
    description: 'All-in-one indoor garden kit with 6 air-purifying plant seeds, biodegradable pots, organic soil and a care guide.',
    warranty: '90-Day Germination Guarantee', inStock: true, badge: 'Eco Favourite',
    highlights: ['6 NASA-approved air-purifying plant varieties', 'Biodegradable coconut coir pots', '100% organic potting mix', 'Full illustrated care guide'],
    specs: { 'Plants Included': 6, 'Pot Material': 'Biodegradable coconut coir', 'Soil Volume': '2 kg organic mix', 'Germination Rate': '>85%' },
    inTheBox: '6 seed packets, 6 biodegradable pots, 2kg organic soil, grow guide, fertiliser sachet'
  }
];

const news = [
  { id: 1, title: 'New Air Quality Standards Announced', date: '03 Sep 2026', location: 'New Delhi', category: 'Policy', description: 'The government has announced stricter guidelines for industrial emissions.' },
  { id: 2, title: 'River Cleaning Initiative Shows Results', date: '01 Sep 2026', location: 'Varanasi', category: 'Water', description: 'Recent tests show a 20% improvement in water quality in the targeted zones.' }
];

module.exports = { states, cities, products, news };
