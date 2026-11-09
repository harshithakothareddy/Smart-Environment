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
  { id: 1, name: 'EcoPulse Air Monitor', category: 'Air Quality Monitors', price: 2999, rating: 4.8, image: 'https://via.placeholder.com/150', description: 'Track PM2.5 and AQI in real-time.' },
  { id: 2, name: 'Home Water Quality Monitor', category: 'Water Quality Monitors', price: 1499, rating: 4.5, image: 'https://via.placeholder.com/150', description: 'Check your tap water pH and TDS.' },
  { id: 3, name: 'Soil Testing Kit', category: 'Soil Testing Kits', price: 899, rating: 4.2, image: 'https://via.placeholder.com/150', description: 'Analyze soil health and contamination.' },
  { id: 4, name: 'Indoor Air Purifier', category: 'Air Purifiers', price: 8999, rating: 4.9, image: 'https://via.placeholder.com/150', description: 'HEPA filter for PM2.5 and PM10.' }
];

const news = [
  { id: 1, title: 'New Air Quality Standards Announced', date: '03 Sep 2026', location: 'New Delhi', category: 'Policy', description: 'The government has announced stricter guidelines for industrial emissions.' },
  { id: 2, title: 'River Cleaning Initiative Shows Results', date: '01 Sep 2026', location: 'Varanasi', category: 'Water', description: 'Recent tests show a 20% improvement in water quality in the targeted zones.' }
];

module.exports = { states, cities, products, news };
