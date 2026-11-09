// EcoPulse India - Comprehensive Mock Data (Demo Mode)
// All data is clearly labeled as demo/sample data.

export const ALL_INDIAN_STATES = [
  { id: 1,  name: 'Andhra Pradesh',         code: 'AP',  airAQI: 89,  waterQuality: 62, landQuality: 58, trend: 'stable',    capital: 'Amaravati' },
  { id: 2,  name: 'Arunachal Pradesh',       code: 'AR',  airAQI: 28,  waterQuality: 88, landQuality: 92, trend: 'improving', capital: 'Itanagar' },
  { id: 3,  name: 'Assam',                   code: 'AS',  airAQI: 95,  waterQuality: 58, landQuality: 55, trend: 'worsening', capital: 'Dispur' },
  { id: 4,  name: 'Bihar',                   code: 'BR',  airAQI: 210, waterQuality: 35, landQuality: 40, trend: 'worsening', capital: 'Patna' },
  { id: 5,  name: 'Chhattisgarh',            code: 'CG',  airAQI: 112, waterQuality: 52, landQuality: 48, trend: 'stable',    capital: 'Raipur' },
  { id: 6,  name: 'Goa',                     code: 'GA',  airAQI: 42,  waterQuality: 78, landQuality: 80, trend: 'improving', capital: 'Panaji' },
  { id: 7,  name: 'Gujarat',                 code: 'GJ',  airAQI: 145, waterQuality: 45, landQuality: 42, trend: 'worsening', capital: 'Gandhinagar' },
  { id: 8,  name: 'Haryana',                 code: 'HR',  airAQI: 198, waterQuality: 40, landQuality: 50, trend: 'worsening', capital: 'Chandigarh' },
  { id: 9,  name: 'Himachal Pradesh',        code: 'HP',  airAQI: 35,  waterQuality: 85, landQuality: 88, trend: 'improving', capital: 'Shimla' },
  { id: 10, name: 'Jharkhand',               code: 'JH',  airAQI: 135, waterQuality: 48, landQuality: 38, trend: 'worsening', capital: 'Ranchi' },
  { id: 11, name: 'Karnataka',               code: 'KA',  airAQI: 75,  waterQuality: 65, landQuality: 70, trend: 'stable',    capital: 'Bengaluru' },
  { id: 12, name: 'Kerala',                  code: 'KL',  airAQI: 38,  waterQuality: 82, landQuality: 85, trend: 'improving', capital: 'Thiruvananthapuram' },
  { id: 13, name: 'Madhya Pradesh',          code: 'MP',  airAQI: 128, waterQuality: 50, landQuality: 45, trend: 'worsening', capital: 'Bhopal' },
  { id: 14, name: 'Maharashtra',             code: 'MH',  airAQI: 120, waterQuality: 55, landQuality: 60, trend: 'worsening', capital: 'Mumbai' },
  { id: 15, name: 'Manipur',                 code: 'MN',  airAQI: 52,  waterQuality: 72, landQuality: 75, trend: 'stable',    capital: 'Imphal' },
  { id: 16, name: 'Meghalaya',               code: 'ML',  airAQI: 30,  waterQuality: 90, landQuality: 88, trend: 'improving', capital: 'Shillong' },
  { id: 17, name: 'Mizoram',                 code: 'MZ',  airAQI: 25,  waterQuality: 92, landQuality: 90, trend: 'improving', capital: 'Aizawl' },
  { id: 18, name: 'Nagaland',                code: 'NL',  airAQI: 32,  waterQuality: 88, landQuality: 85, trend: 'improving', capital: 'Kohima' },
  { id: 19, name: 'Odisha',                  code: 'OD',  airAQI: 108, waterQuality: 58, landQuality: 52, trend: 'stable',    capital: 'Bhubaneswar' },
  { id: 20, name: 'Punjab',                  code: 'PB',  airAQI: 168, waterQuality: 42, landQuality: 48, trend: 'worsening', capital: 'Chandigarh' },
  { id: 21, name: 'Rajasthan',               code: 'RJ',  airAQI: 138, waterQuality: 48, landQuality: 55, trend: 'stable',    capital: 'Jaipur' },
  { id: 22, name: 'Sikkim',                  code: 'SK',  airAQI: 22,  waterQuality: 95, landQuality: 93, trend: 'improving', capital: 'Gangtok' },
  { id: 23, name: 'Tamil Nadu',              code: 'TN',  airAQI: 82,  waterQuality: 62, landQuality: 65, trend: 'stable',    capital: 'Chennai' },
  { id: 24, name: 'Telangana',               code: 'TS',  airAQI: 56,  waterQuality: 72, landQuality: 68, trend: 'stable',    capital: 'Hyderabad' },
  { id: 25, name: 'Tripura',                 code: 'TR',  airAQI: 68,  waterQuality: 70, landQuality: 72, trend: 'stable',    capital: 'Agartala' },
  { id: 26, name: 'Uttar Pradesh',           code: 'UP',  airAQI: 235, waterQuality: 30, landQuality: 35, trend: 'worsening', capital: 'Lucknow' },
  { id: 27, name: 'Uttarakhand',             code: 'UK',  airAQI: 58,  waterQuality: 78, landQuality: 82, trend: 'improving', capital: 'Dehradun' },
  { id: 28, name: 'West Bengal',             code: 'WB',  airAQI: 148, waterQuality: 42, landQuality: 48, trend: 'worsening', capital: 'Kolkata' },
  // UTs
  { id: 29, name: 'Andaman & Nicobar',       code: 'AN',  airAQI: 20,  waterQuality: 92, landQuality: 95, trend: 'improving', capital: 'Port Blair' },
  { id: 30, name: 'Chandigarh',              code: 'CH',  airAQI: 155, waterQuality: 48, landQuality: 55, trend: 'stable',    capital: 'Chandigarh' },
  { id: 31, name: 'Dadra & Nagar Haveli',    code: 'DH',  airAQI: 98,  waterQuality: 62, landQuality: 58, trend: 'stable',    capital: 'Silvassa' },
  { id: 32, name: 'Daman & Diu',             code: 'DD',  airAQI: 85,  waterQuality: 60, landQuality: 62, trend: 'stable',    capital: 'Daman' },
  { id: 33, name: 'Delhi',                   code: 'DL',  airAQI: 284, waterQuality: 38, landQuality: 40, trend: 'worsening', capital: 'New Delhi' },
  { id: 34, name: 'Jammu & Kashmir',         code: 'JK',  airAQI: 62,  waterQuality: 72, landQuality: 78, trend: 'improving', capital: 'Srinagar' },
  { id: 35, name: 'Ladakh',                  code: 'LA',  airAQI: 18,  waterQuality: 98, landQuality: 96, trend: 'improving', capital: 'Leh' },
  { id: 36, name: 'Lakshadweep',             code: 'LD',  airAQI: 15,  waterQuality: 98, landQuality: 97, trend: 'improving', capital: 'Kavaratti' },
  { id: 37, name: 'Puducherry',              code: 'PY',  airAQI: 78,  waterQuality: 68, landQuality: 65, trend: 'stable',    capital: 'Puducherry' },
];

export const CITIES = [
  { id: 1,  name: 'Delhi',           state: 'Delhi',           lat: 28.6139, lng: 77.2090, aqi: 284, status: 'Hazardous',    mainPollutant: 'PM2.5', pm25: 150.5, pm10: 280, no2: 85, so2: 40, o3: 90,  co: 3.5, temp: 34, humidity: 55, wind: 12, waterWQI: 38, landSQI: 40 },
  { id: 2,  name: 'Lucknow',         state: 'Uttar Pradesh',   lat: 26.8467, lng: 80.9462, aqi: 235, status: 'Very Unhealthy',mainPollutant: 'PM2.5', pm25: 128.0, pm10: 220, no2: 70, so2: 32, o3: 75,  co: 2.8, temp: 35, humidity: 60, wind: 8,  waterWQI: 35, landSQI: 38 },
  { id: 3,  name: 'Kanpur',          state: 'Uttar Pradesh',   lat: 26.4499, lng: 80.3319, aqi: 210, status: 'Very Unhealthy',mainPollutant: 'PM2.5', pm25: 110.0, pm10: 200, no2: 65, so2: 28, o3: 70,  co: 2.5, temp: 36, humidity: 58, wind: 7,  waterWQI: 30, landSQI: 35 },
  { id: 4,  name: 'Patna',           state: 'Bihar',           lat: 25.5941, lng: 85.1376, aqi: 210, status: 'Very Unhealthy',mainPollutant: 'PM2.5', pm25: 108.5, pm10: 198, no2: 62, so2: 25, o3: 68,  co: 2.3, temp: 34, humidity: 65, wind: 6,  waterWQI: 32, landSQI: 40 },
  { id: 5,  name: 'Kolkata',         state: 'West Bengal',     lat: 22.5726, lng: 88.3639, aqi: 168, status: 'Unhealthy',     mainPollutant: 'PM2.5', pm25: 85.0,  pm10: 165, no2: 55, so2: 22, o3: 60,  co: 2.0, temp: 32, humidity: 75, wind: 10, waterWQI: 42, landSQI: 45 },
  { id: 6,  name: 'Mumbai',          state: 'Maharashtra',     lat: 19.0760, lng: 72.8777, aqi: 156, status: 'Unhealthy',     mainPollutant: 'PM2.5', pm25: 65.2,  pm10: 120, no2: 45, so2: 25, o3: 50,  co: 1.2, temp: 29, humidity: 82, wind: 18, waterWQI: 55, landSQI: 60 },
  { id: 7,  name: 'Ahmedabad',       state: 'Gujarat',         lat: 23.0225, lng: 72.5714, aqi: 145, status: 'Unhealthy',     mainPollutant: 'PM10', pm25: 58.5,  pm10: 140, no2: 40, so2: 20, o3: 45,  co: 1.0, temp: 37, humidity: 45, wind: 15, waterWQI: 45, landSQI: 42 },
  { id: 8,  name: 'Jaipur',          state: 'Rajasthan',       lat: 26.9124, lng: 75.7873, aqi: 138, status: 'Unhealthy',     mainPollutant: 'PM10', pm25: 55.0,  pm10: 135, no2: 38, so2: 18, o3: 42,  co: 0.9, temp: 38, humidity: 35, wind: 14, waterWQI: 48, landSQI: 55 },
  { id: 9,  name: 'Jodhpur',         state: 'Rajasthan',       lat: 26.2389, lng: 73.0243, aqi: 132, status: 'Unhealthy',     mainPollutant: 'PM10', pm25: 50.5,  pm10: 130, no2: 35, so2: 15, o3: 40,  co: 0.8, temp: 40, humidity: 28, wind: 16, waterWQI: 50, landSQI: 58 },
  { id: 10, name: 'Chandigarh',      state: 'Punjab',          lat: 30.7333, lng: 76.7794, aqi: 128, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 48.0,  pm10: 125, no2: 35, so2: 14, o3: 38,  co: 0.8, temp: 31, humidity: 50, wind: 12, waterWQI: 48, landSQI: 55 },
  { id: 11, name: 'Bhopal',          state: 'Madhya Pradesh',  lat: 23.2599, lng: 77.4126, aqi: 125, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 46.0,  pm10: 118, no2: 32, so2: 12, o3: 36,  co: 0.7, temp: 33, humidity: 52, wind: 10, waterWQI: 50, landSQI: 45 },
  { id: 12, name: 'Nagpur',          state: 'Maharashtra',     lat: 21.1458, lng: 79.0882, aqi: 120, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 43.5,  pm10: 115, no2: 30, so2: 10, o3: 34,  co: 0.7, temp: 34, humidity: 48, wind: 11, waterWQI: 55, landSQI: 58 },
  { id: 13, name: 'Surat',           state: 'Gujarat',         lat: 21.1702, lng: 72.8311, aqi: 115, status: 'Unhealthy',     mainPollutant: 'PM10', pm25: 41.0,  pm10: 112, no2: 28, so2: 9,  o3: 32,  co: 0.6, temp: 33, humidity: 62, wind: 14, waterWQI: 50, landSQI: 48 },
  { id: 14, name: 'Indore',          state: 'Madhya Pradesh',  lat: 22.7196, lng: 75.8577, aqi: 112, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 40.0,  pm10: 110, no2: 26, so2: 8,  o3: 30,  co: 0.6, temp: 33, humidity: 50, wind: 9,  waterWQI: 52, landSQI: 48 },
  { id: 15, name: 'Hyderabad',       state: 'Telangana',       lat: 17.3850, lng: 78.4867, aqi: 56,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 11.7,  pm10: 45,  no2: 12, so2: 8,  o3: 35,  co: 0.5, temp: 31, humidity: 58, wind: 10, waterWQI: 72, landSQI: 68 },
  { id: 16, name: 'Bengaluru',       state: 'Karnataka',       lat: 12.9716, lng: 77.5946, aqi: 75,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 25.4,  pm10: 60,  no2: 20, so2: 10, o3: 40,  co: 0.8, temp: 26, humidity: 65, wind: 12, waterWQI: 65, landSQI: 70 },
  { id: 17, name: 'Chennai',         state: 'Tamil Nadu',      lat: 13.0827, lng: 80.2707, aqi: 82,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 28.0,  pm10: 65,  no2: 22, so2: 12, o3: 42,  co: 0.9, temp: 32, humidity: 72, wind: 15, waterWQI: 62, landSQI: 65 },
  { id: 18, name: 'Pune',            state: 'Maharashtra',     lat: 18.5204, lng: 73.8567, aqi: 88,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 32.0,  pm10: 75,  no2: 25, so2: 11, o3: 44,  co: 1.0, temp: 28, humidity: 60, wind: 13, waterWQI: 60, landSQI: 62 },
  { id: 19, name: 'Visakhapatnam',   state: 'Andhra Pradesh',  lat: 17.6868, lng: 83.2185, aqi: 89,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 33.0,  pm10: 78,  no2: 26, so2: 14, o3: 45,  co: 1.0, temp: 30, humidity: 70, wind: 16, waterWQI: 60, landSQI: 56 },
  { id: 20, name: 'Vijayawada',      state: 'Andhra Pradesh',  lat: 16.5062, lng: 80.6480, aqi: 92,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 34.5,  pm10: 80,  no2: 27, so2: 14, o3: 46,  co: 1.0, temp: 33, humidity: 62, wind: 12, waterWQI: 62, landSQI: 58 },
  { id: 21, name: 'Kochi',           state: 'Kerala',          lat: 9.9312,  lng: 76.2673, aqi: 35,  status: 'Good',           mainPollutant: 'PM10', pm25: 8.5,   pm10: 25,  no2: 5,  so2: 2,  o3: 20,  co: 0.2, temp: 28, humidity: 80, wind: 20, waterWQI: 82, landSQI: 85 },
  { id: 22, name: 'Thiruvananthapuram', state: 'Kerala',       lat: 8.5241,  lng: 76.9366, aqi: 38,  status: 'Good',           mainPollutant: 'PM10', pm25: 9.0,   pm10: 28,  no2: 6,  so2: 2,  o3: 22,  co: 0.2, temp: 29, humidity: 78, wind: 18, waterWQI: 80, landSQI: 84 },
  { id: 23, name: 'Shimla',          state: 'Himachal Pradesh',lat: 31.1048, lng: 77.1734, aqi: 35,  status: 'Good',           mainPollutant: 'PM10', pm25: 8.0,   pm10: 24,  no2: 4,  so2: 1,  o3: 18,  co: 0.1, temp: 18, humidity: 62, wind: 8,  waterWQI: 85, landSQI: 88 },
  { id: 24, name: 'Dehradun',        state: 'Uttarakhand',     lat: 30.3165, lng: 78.0322, aqi: 58,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 14.0,  pm10: 48,  no2: 14, so2: 5,  o3: 30,  co: 0.4, temp: 27, humidity: 60, wind: 9,  waterWQI: 78, landSQI: 82 },
  { id: 25, name: 'Bhubaneswar',     state: 'Odisha',          lat: 20.2961, lng: 85.8245, aqi: 108, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 38.5,  pm10: 105, no2: 28, so2: 10, o3: 34,  co: 0.7, temp: 32, humidity: 68, wind: 11, waterWQI: 58, landSQI: 52 },
  { id: 26, name: 'Ranchi',          state: 'Jharkhand',       lat: 23.3441, lng: 85.3096, aqi: 135, status: 'Unhealthy',     mainPollutant: 'PM2.5',pm25: 52.0,  pm10: 128, no2: 36, so2: 15, o3: 40,  co: 0.9, temp: 30, humidity: 55, wind: 8,  waterWQI: 48, landSQI: 38 },
  { id: 27, name: 'Guwahati',        state: 'Assam',           lat: 26.1445, lng: 91.7362, aqi: 95,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 35.0,  pm10: 88,  no2: 28, so2: 10, o3: 38,  co: 0.8, temp: 30, humidity: 72, wind: 10, waterWQI: 58, landSQI: 55 },
  { id: 28, name: 'Srinagar',        state: 'J&K',             lat: 34.0837, lng: 74.7973, aqi: 62,  status: 'Moderate',      mainPollutant: 'PM10', pm25: 15.0,  pm10: 55,  no2: 15, so2: 6,  o3: 28,  co: 0.4, temp: 20, humidity: 55, wind: 7,  waterWQI: 72, landSQI: 78 },
  { id: 29, name: 'Coimbatore',      state: 'Tamil Nadu',      lat: 11.0168, lng: 76.9558, aqi: 78,  status: 'Moderate',      mainPollutant: 'PM2.5',pm25: 26.5,  pm10: 62,  no2: 20, so2: 9,  o3: 38,  co: 0.7, temp: 30, humidity: 65, wind: 13, waterWQI: 64, landSQI: 66 },
];

export const WATER_BODIES = [
  { id: 1,  name: 'Yamuna River',     state: 'Delhi',         lat: 28.6500, lng: 77.2400, type: 'River',       wqi: 22, status: 'Hazardous',    pH: 8.2, do: 1.2, bod: 38, cod: 142, turbidity: 85, mainPollutant: 'BOD/Sewage' },
  { id: 2,  name: 'Ganga (Kanpur)',   state: 'Uttar Pradesh', lat: 26.4700, lng: 80.3500, type: 'River',       wqi: 28, status: 'Hazardous',    pH: 7.8, do: 2.5, bod: 28, cod: 110, turbidity: 72, mainPollutant: 'Tannery Waste' },
  { id: 3,  name: 'Sabarmati',        state: 'Gujarat',       lat: 23.0300, lng: 72.5800, type: 'River',       wqi: 38, status: 'Very Unhealthy',pH: 7.5, do: 3.2, bod: 22, cod: 85,  turbidity: 65, mainPollutant: 'Industrial Effluent' },
  { id: 4,  name: 'Mula-Mutha',       state: 'Maharashtra',   lat: 18.5300, lng: 73.8800, type: 'River',       wqi: 42, status: 'Unhealthy',    pH: 7.6, do: 3.8, bod: 18, cod: 72,  turbidity: 55, mainPollutant: 'Sewage' },
  { id: 5,  name: 'Damodar River',    state: 'West Bengal',   lat: 23.5500, lng: 87.2800, type: 'River',       wqi: 48, status: 'Unhealthy',    pH: 7.2, do: 4.2, bod: 15, cod: 62,  turbidity: 48, mainPollutant: 'Coal Runoff' },
  { id: 6,  name: 'Hussain Sagar',    state: 'Telangana',     lat: 17.4239, lng: 78.4738, type: 'Lake',        wqi: 52, status: 'Poor',         pH: 8.5, do: 4.8, bod: 12, cod: 48,  turbidity: 35, mainPollutant: 'Eutrophication' },
  { id: 7,  name: 'Dal Lake',         state: 'J&K',           lat: 34.1100, lng: 74.8700, type: 'Lake',        wqi: 65, status: 'Moderate',     pH: 7.8, do: 6.0, bod: 8,  cod: 32,  turbidity: 22, mainPollutant: 'Phosphate' },
  { id: 8,  name: 'Chilika Lake',     state: 'Odisha',        lat: 19.7000, lng: 85.3000, type: 'Lake',        wqi: 78, status: 'Good',         pH: 7.2, do: 7.5, bod: 4,  cod: 15,  turbidity: 10, mainPollutant: 'None (Monitoring)' },
  { id: 9,  name: 'Periyar River',    state: 'Kerala',        lat: 10.1500, lng: 76.3500, type: 'River',       wqi: 88, status: 'Good',         pH: 7.0, do: 8.2, bod: 2,  cod: 8,   turbidity: 5,  mainPollutant: 'None (Monitoring)' },
  { id: 10, name: 'Brahmaputra',      state: 'Assam',         lat: 26.1800, lng: 91.7500, type: 'River',       wqi: 72, status: 'Moderate',     pH: 7.1, do: 7.0, bod: 5,  cod: 20,  turbidity: 18, mainPollutant: 'Sediment' },
];

export const LAND_HOTSPOTS = [
  { id: 1, name: 'Delhi NCR Industrial Belt', state: 'Delhi',         lat: 28.7041, lng: 77.1025, sqi: 28, status: 'Hazardous',     mainConcern: 'Industrial Waste',       heavyMetals: 'Very High', plasticWaste: 'Very High' },
  { id: 2, name: 'Vapi Industrial Area',       state: 'Gujarat',       lat: 20.3700, lng: 72.9100, sqi: 32, status: 'Hazardous',     mainConcern: 'Chemical Contamination', heavyMetals: 'Very High', plasticWaste: 'High' },
  { id: 3, name: 'Kanpur Tannery Zone',        state: 'Uttar Pradesh', lat: 26.4600, lng: 80.3600, sqi: 38, status: 'Very Unhealthy',mainConcern: 'Chromium Waste',         heavyMetals: 'High',      plasticWaste: 'High' },
  { id: 4, name: 'Sukinda Valley',             state: 'Odisha',        lat: 21.0300, lng: 85.8300, sqi: 42, status: 'Unhealthy',     mainConcern: 'Chromite Mining',        heavyMetals: 'High',      plasticWaste: 'Low' },
  { id: 5, name: 'Singrauli Coal Belt',        state: 'Madhya Pradesh',lat: 24.2000, lng: 82.6700, sqi: 48, status: 'Unhealthy',     mainConcern: 'Coal Ash',               heavyMetals: 'Moderate',  plasticWaste: 'Moderate' },
];

// Citizen Reports initial seed data
export const INITIAL_REPORTS = [
  {
    id: 'REP-101',
    category: 'Air',
    title: 'Open Crop Stubble & Garbage Burning Near Bypass',
    description: 'Dense toxic black smoke blanketing the NH48 highway stretch. Visibility reduced to under 50 meters with severe throat burning sensation.',
    locationName: 'North Ring Road, Outer Delhi',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.7520,
    lng: 77.1210,
    severity: 'Critical',
    status: 'Investigating',
    date: 'Today, 10:15 AM',
    timestamp: '2026-09-03T10:15:00Z',
    upvotes: 42,
    reporterName: 'Aarav Sharma',
    evidenceType: 'Photo Verified',
    actionNote: 'Municipal flying squad dispatched to site.'
  },
  {
    id: 'REP-102',
    category: 'Water',
    title: 'Industrial Chemical Sludge Discharge in Drainage Canal',
    description: 'Dark reddish-brown effluent with pungent chemical odor directly flowing into storm water drain connecting to local reservoir.',
    locationName: 'Phase 2 Industrial Estate, Vapi',
    city: 'Surat',
    state: 'Gujarat',
    lat: 20.3800,
    lng: 72.9300,
    severity: 'Critical',
    status: 'Verified',
    date: 'Today, 09:30 AM',
    timestamp: '2026-09-03T09:30:00Z',
    upvotes: 67,
    reporterName: 'Pooja Patel',
    evidenceType: 'Video Verified',
    actionNote: 'Pollution Control Board inspector notified.'
  },
  {
    id: 'REP-103',
    category: 'Land',
    title: 'Illegal Plastic & Construction Debris Dumping on Lakebed',
    description: 'Multiple trucks unloading hazardous plastic mix and concrete rubble encroaching onto the seasonal wetlands.',
    locationName: 'Varthur Wetland Buffer Zone, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9400,
    lng: 77.7200,
    severity: 'High',
    status: 'Action Taken',
    date: 'Yesterday, 04:45 PM',
    timestamp: '2026-09-02T16:45:00Z',
    upvotes: 89,
    reporterName: 'Rohan Kulkarni',
    evidenceType: 'Photo Verified',
    actionNote: 'Dumping stopped; fencing erected around perimeter.'
  },
  {
    id: 'REP-104',
    category: 'Air',
    title: 'Unchecked Fugitive Dust from Massive Uncovered Ready-Mix Plant',
    description: 'High wind creating dense cement dust cloud penetrating into surrounding residential apartment blocks. Kids experiencing asthma triggers.',
    locationName: 'Madhapur Outer Sector, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4483,
    lng: 78.3915,
    severity: 'Moderate',
    status: 'Pending',
    date: 'Today, 11:20 AM',
    timestamp: '2026-09-03T11:20:00Z',
    upvotes: 19,
    reporterName: 'Dr. Sneha Reddy',
    evidenceType: 'Citizen Logged',
    actionNote: 'Pending admin review'
  },
  {
    id: 'REP-105',
    category: 'Water',
    title: 'Toxic White Froth & Chemical Foam on River Surface',
    description: 'Extensive soap-like chemical foam spilling over check dam onto walkway after early morning factory release.',
    locationName: 'Near Old Sangam Bridge, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5280,
    lng: 73.8640,
    severity: 'High',
    status: 'Investigating',
    date: 'Today, 08:10 AM',
    timestamp: '2026-09-03T08:10:00Z',
    upvotes: 53,
    reporterName: 'Vikram Deshmukh',
    evidenceType: 'Photo Verified',
    actionNote: 'Water samples collected for lab assay.'
  },
  {
    id: 'REP-106',
    category: 'Land',
    title: 'Toxic E-Waste Dismantling & Open Acid Leaching Pit',
    description: 'Informal scrap yard dissolving circuit boards in open acid tubs, acid runoff seeping into open soil and agricultural patch.',
    locationName: 'Mandoli Industrial Fringe, East Delhi',
    city: 'Delhi',
    state: 'Delhi',
    lat: 28.6980,
    lng: 77.3050,
    severity: 'Critical',
    status: 'Verified',
    date: '2 Days Ago',
    timestamp: '2026-09-01T14:20:00Z',
    upvotes: 112,
    reporterName: 'Ananya Sen',
    evidenceType: 'Geo-Tagged Photo',
    actionNote: 'District magistrate task force alerted.'
  }
];

export const PRODUCTS = [
  { id: 1,  name: 'EcoPulse AirSense Pro',    category: 'Air Quality Monitors',   price: 4299, originalPrice: 5499, rating: 4.8, reviews: 1245, image: 'air-monitor', description: 'Real-time PM2.5, PM10, CO2, VOC, Temp & Humidity monitoring. WiFi-enabled with mobile app.', inStock: true,  badge: 'Best Seller' },
  { id: 2,  name: 'AirPure 360 Smart Purifier',category: 'Air Purifiers',          price: 9999, originalPrice: 12999,rating: 4.9, reviews: 892,  image: 'air-purifier',description: '360° HEPA + Activated Carbon filter. 500 sq ft coverage. Smart auto mode. Voice control.', inStock: true,  badge: 'Top Rated' },
  { id: 3,  name: 'EcoTest Water Meter PRO',  category: 'Water Quality Monitors',  price: 1899, originalPrice: 2499, rating: 4.6, reviews: 678,  image: 'water-monitor',description: 'Digital TDS, pH, EC, ORP, and temperature meter with high accuracy. Perfect for home & lab.', inStock: true,  badge: null },
  { id: 4,  name: 'ClearFlow Water Filter 7-Stage', category: 'Water Filters',    price: 15999, originalPrice: 19999,rating: 4.7, reviews: 534, image: 'water-filter', description: '7-stage RO+UV+Alkaline filtration. Removes 99.9% contaminants. Smart alerts.', inStock: true,  badge: 'Top Rated' },
  { id: 5,  name: 'GreenCheck Soil Test Kit', category: 'Soil Testing Kits',       price: 799,  originalPrice: 999,  rating: 4.4, reviews: 312,  image: 'soil-kit',    description: 'Test NPK, pH, moisture, and heavy metals. 50-test strips included.', inStock: true,  badge: null },
  { id: 6,  name: 'SenseHub Indoor Station',  category: 'Indoor Environment Sensors',price: 5499,originalPrice: 6999,rating: 4.7, reviews: 445,  image: 'indoor-sensor',description: 'All-in-one indoor air quality, noise, light, and thermal comfort station.', inStock: false, badge: 'New' },
  { id: 7,  name: 'EcoMask N99 Pro',          category: 'Pollution Protection',    price: 1299, originalPrice: 1699, rating: 4.5, reviews: 1890, image: 'eco-mask',    description: 'N99 certification, valve-less design, 20hr usage, washable & reusable.', inStock: true,  badge: 'Best Seller' },
  { id: 8,  name: 'SmartNoise Earplug+',      category: 'Pollution Protection',    price: 499,  originalPrice: 699,  rating: 4.3, reviews: 220,  image: 'earplug',     description: 'High-fidelity noise reduction. Safe for concerts, commutes, and sleep.', inStock: true,  badge: null },
  { id: 9,  name: 'EcoPulse Desktop Monitor', category: 'Air Quality Monitors',   price: 2499, originalPrice: 3199, rating: 4.6, reviews: 560,  image: 'desktop-monitor',description: 'Compact AQI display for desks. PM2.5, CO2, TVOC, Temp, Humidity.', inStock: true,  badge: null },
  { id: 10, name: 'PurePlant Indoor Kit',     category: 'Environmental Accessories',price: 1199,originalPrice: 1499, rating: 4.2, reviews: 188,  image: 'plant-kit',   description: 'Grow 4 air-purifying plants. Includes soil, seeds, pots, and guide.', inStock: true,  badge: 'Eco Pick' },
];

export const NEWS = [
  { id: 1,  title: 'Delhi AQI Crosses 300, Authorities Issue Health Advisory',         date: '03 Sep 2026', location: 'New Delhi',    category: 'Air',     image: 'news1', description: 'Authorities urge residents to reduce outdoor exposure as air quality hits hazardous levels.' },
  { id: 2,  title: 'Ganga Rejuvenation Project Reports 20% Improvement in Water Quality', date: '02 Sep 2026', location: 'Kanpur',    category: 'Water',   image: 'news2', description: 'The latest water sampling results show a significant reduction in BOD levels.' },
  { id: 3,  title: 'CPCB Launches New Real-Time Pollution Monitoring Portal',            date: '01 Sep 2026', location: 'India',       category: 'Policy',  image: 'news3', description: 'The Central Pollution Control Board has launched an upgraded monitoring platform.' },
  { id: 4,  title: 'Study Finds Microplastics in 85% of Tested Water Sources in India', date: '31 Aug 2026', location: 'India',       category: 'Water',   image: 'news4', description: 'A new research study highlights the growing threat of microplastic contamination.' },
  { id: 5,  title: 'Maharashtra Launches Soil Health Mission for 5,000 Villages',        date: '30 Aug 2026', location: 'Maharashtra', category: 'Land',    image: 'news5', description: 'The initiative aims to test and remediate soil quality in rural and agricultural regions.' },
  { id: 6,  title: 'Kerala Records Cleanest Air Quality Among Indian States',            date: '29 Aug 2026', location: 'Kerala',      category: 'Air',     image: 'news6', description: 'For the third consecutive quarter, Kerala maintains the best average AQI.' },
];

export const ALERTS = [
  { id: 1, type: 'Air',   severity: 'Critical', title: 'Hazardous Air Quality Alert', location: 'Delhi',     lat: 28.6139, lng: 77.2090, message: 'PM2.5 levels have exceeded 150 μg/m³. Vulnerable groups should stay indoors.', time: '2026-09-03T08:00:00Z', icon: '🌫️', active: true },
  { id: 2, type: 'Water', severity: 'High',     title: 'Water Quality Warning',        location: 'Kanpur',    lat: 26.4499, lng: 80.3319, message: 'BOD levels in the local river exceed safe limits. Avoid contact.', time: '2026-09-03T07:30:00Z',         icon: '💧', active: true },
  { id: 3, type: 'Air',   severity: 'Medium',   title: 'Moderate Pollution Advisory',  location: 'Mumbai',    lat: 19.0760, lng: 72.8777, message: 'AQI has risen to 156. Sensitive individuals may experience discomfort.', time: '2026-09-03T07:00:00Z',      icon: '😷', active: true },
  { id: 4, type: 'Land',  severity: 'High',     title: 'Toxic Industrial Waste Runoff',location: 'Vapi',      lat: 20.3700, lng: 72.9100, message: 'Industrial discharge data confirms elevated heavy metals in soil & groundwater.', time: '2026-09-03T06:00:00Z', icon: '⚠️', active: true },
  { id: 5, type: 'Air',   severity: 'Critical', title: 'Severe Smog & Low Visibility',location: 'Patna',     lat: 25.5941, lng: 85.1376, message: 'AQI 210+. Stubble smoke convergence causing severe breathing distress.', time: '2026-09-03T05:30:00Z',       icon: '🚨', active: true },
  { id: 6, type: 'Water', severity: 'High',     title: 'Sewage Influx & Eutrophication',location: 'Hyderabad',lat: 17.4239, lng: 78.4738, message: 'Algal bloom detected in central water body. Advisory against direct water contact.', time: '2026-09-03T04:15:00Z', icon: '🚰', active: true },
];

export const RESOURCES = [
  { id: 1, title: 'Understanding AQI',          category: 'Air',   description: 'Learn what the Air Quality Index means and how it affects your daily life.', icon: '🌬️', readTime: '5 min' },
  { id: 2, title: 'Water Pollution Guide',       category: 'Water', description: 'A comprehensive guide to water contaminants and safe water practices.', icon: '💧', readTime: '8 min' },
  { id: 3, title: 'Soil Health & Agriculture',   category: 'Land',  description: 'How soil quality impacts food safety and farming.', icon: '🌱', readTime: '6 min' },
  { id: 4, title: 'Protecting Yourself from Air Pollution', category: 'Air', description: 'Practical steps to reduce your personal pollution exposure.', icon: '😷', readTime: '4 min' },
  { id: 5, title: 'India Pollution Laws',        category: 'Policy',description: 'An overview of major Indian environmental protection legislation.', icon: '⚖️', readTime: '10 min' },
  { id: 6, title: 'Clean Air for Schools',       category: 'Education', description: 'An educational guide designed for students and teachers.', icon: '🏫', readTime: '7 min' },
];

// Generate 24h chart data — anchored to current real time with 12-hour AM/PM labels
export const generate24hData = () => {
  const now = new Date();
  const currentHour = now.getHours();
  return Array.from({ length: 24 }, (_, i) => {
    // index 0 = 23 hours ago, index 23 = current hour (Now)
    const d = new Date(now);
    d.setMinutes(0, 0, 0);
    d.setHours(currentHour - (23 - i));
    const h = d.getHours();
    const isNow = i === 23;
    // Convert to 12-hour AM/PM
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const label = isNow ? `${h12} ${period} ▶Now` : `${h12} ${period}`;
    return {
      hour: label,
      isNow,
      aqi: Math.floor(Math.random() * 120 + 30),
      pm25: parseFloat((Math.random() * 80 + 10).toFixed(1)),
    };
  });
};

// Generate 7-day data — anchored to the last 7 real calendar days
export const generate7DayData = () => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i)); // index 0 = 6 days ago, index 6 = today
    const dayName = dayNames[d.getDay()];
    const dateNum = d.getDate();
    const month = monthNames[d.getMonth()];
    const isToday = i === 6;
    // Show "Wed ▶Today" for today, or "Mon 29 Sep" for past days
    const label = isToday ? `${dayName} ▶Today` : `${dayName} ${dateNum} ${month}`;
    return {
      day: label,
      isToday,
      aqi: Math.floor(Math.random() * 100 + 50),
      pm25: parseFloat((Math.random() * 60 + 15).toFixed(1)),
      pm10: parseFloat((Math.random() * 100 + 30).toFixed(1)),
    };
  });
};

// Safe Route Calculation & Waypoints Generator
export const calculateSafeRoute = (originCity, destCity) => {
  if (!originCity || !destCity) return null;

  const lat1 = Number(originCity.lat);
  const lon1 = Number(originCity.lng);
  const lat2 = Number(destCity.lat);
  const lon2 = Number(destCity.lng);

  if (!Number.isFinite(lat1) || !Number.isFinite(lon1) || !Number.isFinite(lat2) || !Number.isFinite(lon2)) {
    return null;
  }

  const originAqi = Number(originCity.aqi) || 120;
  const destAqi = Number(destCity.aqi) || 120;

  // Calculate approximate distance (Haversine km)
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = Math.max(10, Math.round(R * c));

  // Standard Direct Route (High exposure)
  const standardDist = Math.max(25, Math.round(rawDist * 1.08));
  const standardHours = (standardDist / 65).toFixed(1);
  const standardAvgAQI = Math.round((originAqi + destAqi) / 2 * 1.15);

  // Eco Safe Route (Avoids heavy industrial centers / traffic corridors)
  const safeDist = Math.max(30, Math.round(rawDist * 1.18));
  const safeHours = (safeDist / 62).toFixed(1);
  const safeAvgAQI = Math.max(45, Math.round((originAqi + destAqi) / 2 * 0.58));
  const pollutionReductionPct = Math.round(((standardAvgAQI - safeAvgAQI) / standardAvgAQI) * 100);

  // Create intermediate coordinates for visualization
  // Midpoint with offset
  const midLat = (lat1 + lat2) / 2;
  const midLng = (lon1 + lon2) / 2;

  // Standard line slightly bowed towards major industrial centers
  const stdMid = [midLat + 0.15, midLng - 0.1];
  const standardWaypoints = [
    [lat1, lon1],
    [lat1 + (midLat - lat1) * 0.5 + 0.05, lon1 + (midLng - lon1) * 0.5 - 0.05],
    stdMid,
    [midLat + (lat2 - midLat) * 0.5 + 0.08, midLng + (lon2 - midLng) * 0.5 - 0.08],
    [lat2, lon2]
  ];

  // Safe route bowed towards green corridor / bypass
  const safeMid = [midLat - 0.35, midLng + 0.35];
  const safeWaypoints = [
    [lat1, lon1],
    [lat1 + (midLat - lat1) * 0.45 - 0.15, lon1 + (midLng - lon1) * 0.45 + 0.2],
    safeMid,
    [midLat + (lat2 - midLat) * 0.55 - 0.18, midLng + (lon2 - midLng) * 0.55 + 0.18],
    [lat2, lon2]
  ];

  // Route Hazards & Warnings
  const hazards = [
    { km: Math.round(standardDist * 0.28), title: 'Industrial Smog Corridor', aqi: standardAvgAQI + 45, type: 'Air Hazard', advisory: 'Close vehicle vents, switch AC to internal recirculate.' },
    { km: Math.round(standardDist * 0.62), title: 'Thermal Plant / Brick Kiln Zone', aqi: standardAvgAQI + 30, type: 'Fugitive Dust', advisory: 'Avoid window opening; N95 mask recommended if on two-wheeler.' },
  ];

  const safeHighlights = [
    { title: 'Green Forest Corridor Bypass', note: 'Traverses agricultural & protected forest valley' },
    { title: 'Bypasses 2 Severe Smog Hotspots', note: `Reduces inhaled PM2.5 by ~${pollutionReductionPct}%` },
    { title: 'Lower Congestion Factor', note: 'Smoother cruising with continuous fresh air flow' }
  ];

  return {
    origin: originCity,
    destination: destCity,
    standardRoute: {
      name: 'Highway Expressway Route',
      distanceKm: standardDist,
      durationHours: standardHours,
      avgAQI: standardAvgAQI,
      exposureScore: standardAvgAQI > 150 ? 'Severe Exposure' : standardAvgAQI > 100 ? 'High Exposure' : 'Moderate Exposure',
      color: '#dc2626',
      waypoints: standardWaypoints,
      hazards
    },
    safeRoute: {
      name: 'EcoPulse Clean Air Route (Recommended)',
      distanceKm: safeDist,
      durationHours: safeHours,
      avgAQI: safeAvgAQI,
      exposureScore: safeAvgAQI <= 50 ? 'Clean Air Zone' : safeAvgAQI <= 100 ? 'Low Exposure' : 'Moderate Exposure',
      color: '#16a34a',
      waypoints: safeWaypoints,
      pollutionReductionPct,
      highlights: safeHighlights
    }
  };
};

// Helpers
export const getStatusFromAQI = (aqi) => {
  if (aqi <= 50)  return { label: 'Good',          className: 'good',      color: '#16a34a' };
  if (aqi <= 100) return { label: 'Moderate',       className: 'moderate',  color: '#ca8a04' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', className: 'poor', color: '#ea580c' };
  if (aqi <= 200) return { label: 'Unhealthy',      className: 'unhealthy', color: '#dc2626' };
  if (aqi <= 300) return { label: 'Very Unhealthy', className: 'unhealthy', color: '#dc2626' };
  return { label: 'Hazardous', className: 'hazardous', color: '#7c3aed' };
};

export const getStatusFromWQI = (wqi) => {
  if (wqi >= 80) return { label: 'Excellent', className: 'good',      color: '#16a34a' };
  if (wqi >= 65) return { label: 'Good',      className: 'good',      color: '#16a34a' };
  if (wqi >= 50) return { label: 'Fair',      className: 'moderate',  color: '#ca8a04' };
  if (wqi >= 35) return { label: 'Poor',      className: 'poor',      color: '#ea580c' };
  return { label: 'Very Poor', className: 'hazardous', color: '#7c3aed' };
};

export const getStatusFromSQI = (sqi) => {
  if (sqi >= 80) return { label: 'Excellent',     className: 'good',      color: '#16a34a' };
  if (sqi >= 65) return { label: 'Good',           className: 'good',      color: '#16a34a' };
  if (sqi >= 50) return { label: 'Fair',           className: 'moderate',  color: '#ca8a04' };
  if (sqi >= 35) return { label: 'Poor',           className: 'poor',      color: '#ea580c' };
  return { label: 'Degraded',  className: 'hazardous', color: '#7c3aed' };
};
