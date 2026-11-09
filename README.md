# 🌿 Eco-nexus (EcoPulse India)

> **Real-Time Environmental Intelligence, Pollution Monitoring & Sustainable Marketplace for India**

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

Eco-nexus (**EcoPulse India**) is a comprehensive environmental intelligence platform engineered to track, analyze, and mitigate pollution across India. Integrating real-time air quality metrics, water health indexes, soil contamination levels, interactive geospatial maps, citizen reporting, and an eco-friendly marketplace, Eco-nexus bridges data with actionable community impact.

---

## 🚀 Key Features

### 🌫️ Air Quality Index (AQI) Monitoring
- Live AQI tracking across major Indian metropolitan hubs and states.
- Detailed pollutant breakdowns: **PM2.5, PM10, NO₂, SO₂, O₃, and CO**.
- Health advisory bands, vulnerable demographic alerts, and preventive recommendations.

### 💧 Water Quality Index (WQI)
- Real-time data for critical rivers and water bodies (Yamuna, Ganga, Sabarmati, Periyar, Mula-Mutha).
- Biochemical indicators: **pH, Dissolved Oxygen (DO), Turbidity, BOD, COD, and Phosphate levels**.

### 🌾 Land & Soil Quality Index (SQI)
- Monitoring of industrial dumping, chemical contamination, and plastic waste hotspots.
- Soil health indicators and degradation trends across agricultural and industrial corridors.

### 🗺️ Interactive Geospatial Map
- Powered by **Leaflet** & **React-Leaflet** with custom environmental overlays.
- Dynamic color-coded markers for states and cities showing real-time environmental status.

### 📢 Citizen Pollution Reporting
- Community-driven incident reporting tool enabling citizens to report illegal dumping, smog emissions, or water contamination.
- Location tagging, category selection, and severity logging.

### 🛒 Eco Marketplace & Green Store
- Curated sustainable products (air-purifying plants, reusable alternatives, energy-efficient utilities, biodegradable daily essentials).
- Integrated shopping cart, product details, category filters, and checkout simulation.

### 📊 Comparative Rankings & Analytics
- National leaderboards ranking cleanest to most polluted cities and states.
- Multi-dimensional scoring combining Air, Water, and Soil quality.
- Interactive charts powered by **Recharts**.

### 🛡️ Personal Exposure & Alerts
- Personalized exposure risk assessment based on daily habits and location.
- High-priority environmental alert notices during dangerous pollution spikes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Mapping:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Data Visualization:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Modular CSS Design System with responsive layouts and dark/light accents

### Backend
- **Runtime:** [Node.js](https://nodejs.org/)
- **Server Framework:** [Express 5](https://expressjs.com/)
- **Database Support:** [Mongoose](https://mongoosejs.com/) (MongoDB)
- **Utilities:** CORS, Dotenv, Nodemon

---

## 📁 Project Structure

```text
Eco-nexus/
├── backend/
│   ├── data/
│   │   └── mockData.js          # Preloaded environmental data, products & news
│   ├── routes/
│   │   └── api.js               # REST API endpoints (Air, Water, Land, Rankings, Products)
│   ├── index.js                 # Express server initialization
│   ├── package.json             # Backend dependencies
│   └── .env                     # Backend environment configurations
│
├── frontend/
│   ├── public/                  # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/              # Images and design assets
│   │   ├── components/          # Reusable UI (Navbar, Footer, LocationSelector, BottomNav)
│   │   ├── context/             # Global application state (AppContext)
│   │   ├── data/                # Geographic locations and datasets
│   │   ├── pages/               # Application routes & views
│   │   │   ├── Dashboard.jsx    # Primary overview dashboard
│   │   │   ├── AirPollution.jsx # In-depth air quality analysis
│   │   │   ├── WaterPollution.jsx # River & water quality tracking
│   │   │   ├── LandPollution.jsx  # Soil & land contamination
│   │   │   ├── IndiaMap.jsx     # Interactive Leaflet map view
│   │   │   ├── Rankings.jsx     # City & state leaderboards
│   │   │   ├── Shop.jsx         # Sustainable marketplace
│   │   │   ├── Cart.jsx         # Cart & checkout workflow
│   │   │   ├── ReportPollution.jsx # Incident report submission
│   │   │   ├── Exposure.jsx     # Personal risk calculator
│   │   │   ├── AlertsPage.jsx   # Active pollution warnings
│   │   │   ├── News.jsx         # Environmental news feed
│   │   │   └── Admin.jsx        # Administrative control panel
│   │   ├── utils/               # Geographic search & helper algorithms
│   │   ├── App.jsx              # Routing and page layout
│   │   ├── index.css            # Core design system and utilities
│   │   └── main.jsx             # React entry point
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
│
└── README.md                    # Project documentation
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Mohana-Mucherla/Eco-nexus.git
cd Eco-nexus
```

---

### 2. Backend Setup
```bash
cd backend
npm install
```

Start the backend API server:
```bash
# Development mode with hot-reload
npm run dev

# Or standard production mode
npm start
```
> The API server will run at: `http://localhost:5000`

---

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The frontend client will run at: `http://localhost:5173`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/air/overview` | National air quality summary and dominant pollutants |
| `GET` | `/api/air/ranking` | City/State rankings based on AQI |
| `GET` | `/api/air/city/:cityName` | Detailed air pollutant statistics for a specific city |
| `GET` | `/api/water/overview` | Overall water quality and chemical parameters |
| `GET` | `/api/water/ranking` | Water body rankings and pollution indices |
| `GET` | `/api/land/overview` | Soil health, plastic waste & contamination levels |
| `GET` | `/api/states` | List of monitored Indian states with aggregated scores |
| `GET` | `/api/cities` | List of monitored Indian cities with detailed metrics |
| `GET` | `/api/ranking/overall` | Composite environmental leaderboard (Air + Water + Land) |
| `GET` | `/api/products` | Catalog of eco-friendly products with category/price filters |
| `GET` | `/api/alerts` | Active high-priority pollution hazard warnings |
| `GET` | `/api/news` | Curated climate and ecological news articles |
| `GET` | `/api/search?q=:query` | Global search across cities, states, and products |

---

## 🤝 Contributing

Contributions make the open-source community thrive! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/EcoFeature`)
3. Commit your Changes (`git commit -m 'Add some EcoFeature'`)
4. Push to the Branch (`git push origin feature/EcoFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **ISC License**. See `package.json` for details.

---

## 👤 Author

- **Mohana Mucherla** - [GitHub Profile](https://github.com/Mohana-Mucherla)
