import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

// Pages
import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import CityDetail from './pages/CityDetail';
import Exposure from './pages/Exposure';
import IndiaMap from './pages/IndiaMap';
import News from './pages/News';
import Resources from './pages/Resources';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import AirPollution from './pages/AirPollution';
import WaterPollution from './pages/WaterPollution';
import StateDetail from './pages/StateDetail';
import ProductDetail from './pages/ProductDetail';
import AlertsPage from './pages/AlertsPage';
import ReportPollution from './pages/ReportPollution';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';

import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Starting Page — accessible before login */}
          <Route path="/" element={<Dashboard />} />

          {/* Protected Pages — accessible AFTER login only */}
          <Route path="/air" element={<ProtectedRoute pageTitle="Air Pollution Telemetry"><AirPollution /></ProtectedRoute>} />
          <Route path="/water" element={<ProtectedRoute pageTitle="Water Health Monitoring"><WaterPollution /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute pageTitle="Pollution-Aware Safe Routes & Maps"><IndiaMap /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute pageTitle="Citizen Pollution Reporting"><ReportPollution /></ProtectedRoute>} />
          <Route path="/rankings" element={<ProtectedRoute pageTitle="Cleanest & Most Polluted Rankings"><Rankings /></ProtectedRoute>} />
          <Route path="/exposure" element={<ProtectedRoute pageTitle="Pollution Exposure Tracker"><Exposure /></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute pageTitle="Environmental News & Updates"><News /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute pageTitle="Eco Education & Resources"><Resources /></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute pageTitle="Eco Equipment & Masks Store"><Shop /></ProtectedRoute>} />
          <Route path="/shop/cart" element={<ProtectedRoute pageTitle="Cart"><Cart /></ProtectedRoute>} />
          <Route path="/shop/product/:productId" element={<ProtectedRoute pageTitle="Product Details"><ProductDetail /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute pageTitle="Location & Telemetry Search"><Search /></ProtectedRoute>} />
          <Route path="/city/:cityName" element={<ProtectedRoute pageTitle="City Telemetry Report"><CityDetail /></ProtectedRoute>} />
          <Route path="/state/:stateName" element={<ProtectedRoute pageTitle="State Pollution Profile"><StateDetail /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute pageTitle="Admin Portal"><Admin /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute pageTitle="Citizen Profile"><Profile /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute pageTitle="Live Environmental Alerts"><AlertsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <BottomNav />
        <AuthModal />
      </Router>
    </AppProvider>
  );
}

function NotFound() {
  return (
    <div className="page-wrapper">
      <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: 72 }}>🌍</div>
        <h1 style={{ marginTop: 'var(--space-4)' }}>Page Not Found</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-6)', display: 'inline-flex' }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
