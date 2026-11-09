import React, { createContext, useContext, useState, useEffect } from 'react';
import { CITIES } from '../data/mockData';
import { fetchLiveTelemetry } from '../utils/realTelemetry';
import {
  getBackendHealth,
  fetchReports,
  createReportApi,
  upvoteReportApi,
  updateReportStatusApi,
  deleteReportApi,
  fetchAlerts,
  createAlertApi,
  toggleAlertApi,
  deleteAlertApi
} from '../utils/api';

const DEFAULT_REPORTS = [
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
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
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
    timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  }
];

const DEFAULT_ALERTS = [
  {
    id: 1,
    type: 'Air',
    severity: 'Critical',
    title: 'Severe Smog & PM2.5 Spike (>350 µg/m³)',
    location: 'Delhi NCR Region',
    message: 'Extreme particulate matter concentration recorded across monitoring stations. Vulnerable individuals should remain indoors; use N95 respirators outdoors.',
    active: true,
    time: new Date().toISOString(),
  },
  {
    id: 2,
    type: 'Water',
    severity: 'High',
    title: 'Industrial Chemical Contamination Watch',
    location: 'Yamuna River & Okhla Barrage',
    message: 'Dissolved oxygen dropped below 1.2 mg/L; elevated ammonia levels detected. Direct contact prohibited.',
    active: true,
    time: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  }
];

// Default safe context so useApp() never returns undefined during HMR
const defaultContext = {
  selectedLocation: { type: 'india', name: 'India', code: null },
  selectedCity: CITIES[14] || CITIES[0],
  setSelectedCity: () => {},
  cart: [], addToCart: () => {}, removeFromCart: () => {}, updateCartQty: () => {},
  cartTotal: 0, cartCount: 0,
  wishlist: [], toggleWishlist: () => {},
  savedLocations: [], setSavedLocations: () => {},
  notifications: true, setNotifications: () => {},
  user: null, setUser: () => {},
  login: () => {}, logout: () => {},
  authModalOpen: false, setAuthModalOpen: () => {},
  authModalMode: 'login', setAuthModalMode: () => {},
  isLoggedIn: false,
  searchQuery: '', setSearchQuery: () => {},
  citizenReports: DEFAULT_REPORTS, addCitizenReport: () => {}, upvoteReport: () => {}, updateReportStatus: () => {}, deleteReport: () => {},
  alerts: DEFAULT_ALERTS, addAlert: () => {}, toggleAlertActive: () => {}, deleteAlert: () => {},
  citiesData: CITIES, updateCityData: () => {},
  dbStatus: { connected: false, loading: true },
};

const AppContext = createContext(defaultContext);

export const AppProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState({ type: 'india', name: 'India', code: null });
  const [selectedCity, setSelectedCity] = useState(() => CITIES[14] || CITIES[0]); // Hyderabad default
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [savedLocations, setSavedLocations] = useState([
    { id: 1, label: 'Home',   name: 'Hyderabad',  state: 'Telangana', aqi: 56 },
    { id: 2, label: 'Work',   name: 'Hyderabad',  state: 'Telangana', aqi: 56 },
    { id: 3, label: 'Outdoor',name: 'Hyderabad',  state: 'Telangana', aqi: 56 },
  ]);
  const [notifications, setNotifications] = useState(true);
  
  // Authentication State (Default is null = unauthenticated before login)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('econexus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  const login = (email, name, role = 'Citizen') => {
    const newUser = {
      name: name || (email ? email.split('@')[0] : 'Citizen'),
      email: email || 'citizen@econexus.in',
      role,
      loginTime: new Date().toISOString()
    };
    setUser(newUser);
    try {
      localStorage.setItem('econexus_user', JSON.stringify(newUser));
    } catch (e) {}
    setAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('econexus_user');
    } catch (e) {}
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState({ connected: false, loading: true, host: null });

  // Global State for Citizen Reports (Air, Water)
  const [citizenReports, setCitizenReports] = useState(() => {
    const saved = localStorage.getItem('ecopulse_citizen_reports');
    return saved ? JSON.parse(saved) : DEFAULT_REPORTS;
  });

  // Global State for Active Alerts
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('ecopulse_alerts');
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });

  // Global State for Cities Data
  const [citiesData, setCitiesData] = useState(() => {
    const saved = localStorage.getItem('ecopulse_cities');
    return saved ? JSON.parse(saved) : CITIES;
  });

  // Synchronize with MongoDB Backend on Startup
  useEffect(() => {
    let isMounted = true;

    const syncWithBackend = async () => {
      try {
        const health = await getBackendHealth();
        if (isMounted) {
          setDbStatus({
            connected: Boolean(health?.database?.connected),
            loading: false,
            host: health?.database?.host || null,
            name: health?.database?.name || null,
          });
        }

        // Fetch reports from MongoDB backend
        const remoteReports = await fetchReports();
        if (isMounted && remoteReports && remoteReports.length > 0) {
          setCitizenReports(remoteReports);
        }

        // Fetch alerts from MongoDB backend
        const remoteAlerts = await fetchAlerts();
        if (isMounted && remoteAlerts && remoteAlerts.length > 0) {
          setAlerts(remoteAlerts);
        }
      } catch (err) {
        console.warn('Backend sync failed, using local/cached data:', err.message);
        if (isMounted) {
          setDbStatus({ connected: false, loading: false });
        }
      }
    };

    syncWithBackend();

    // Check backend health periodically (every 15s)
    const interval = setInterval(syncWithBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch real telemetry for the currently selected city / area
  useEffect(() => {
    if (!selectedCity) return;
    const lat = selectedCity._searchedLat || selectedCity.lat;
    const lng = selectedCity._searchedLng || selectedCity.lng;
    if (lat && lng) {
      fetchLiveTelemetry(lat, lng, selectedCity).then(live => {
        if (live) {
          setSelectedCity(prev => ({
            ...prev,
            aqi: live.aqi,
            pm25: live.pm25,
            pm10: live.pm10,
            no2: live.no2,
            so2: live.so2,
            o3: live.o3,
            co: live.co,
            temp: live.temp,
            humidity: live.humidity,
            wind: live.wind,
            mainPollutant: live.mainPollutant,
            status: live.status,
            _isRealLive: true,
          }));
        }
      });
    }
  }, [selectedCity?.name, selectedCity?._searchedLocation]);

  // Background fetch live telemetry for top major Indian cities to ensure actual numbers in rankings
  useEffect(() => {
    const topIndices = [0, 5, 14, 15, 4, 16, 1, 17, 6]; // Delhi, Mumbai, Hyderabad, Bengaluru, Kolkata, Chennai, Lucknow, Pune, Ahmedabad
    const fetchTop = async () => {
      for (const idx of topIndices) {
        const c = CITIES[idx];
        if (!c) continue;
        try {
          const live = await fetchLiveTelemetry(c.lat, c.lng, c);
          if (live) {
            setCitiesData(prev => prev.map(city => city.id === c.id ? {
              ...city,
              aqi: live.aqi,
              pm25: live.pm25,
              pm10: live.pm10,
              no2: live.no2,
              so2: live.so2,
              o3: live.o3,
              co: live.co,
              temp: live.temp,
              humidity: live.humidity,
              wind: live.wind,
              mainPollutant: live.mainPollutant,
              status: live.status,
            } : city));
          }
        } catch {
          // continue
        }
      }
    };
    fetchTop();
  }, []);

  // Persist to local storage as offline cache
  useEffect(() => {
    localStorage.setItem('ecopulse_citizen_reports', JSON.stringify(citizenReports));
  }, [citizenReports]);

  useEffect(() => {
    localStorage.setItem('ecopulse_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('ecopulse_cities', JSON.stringify(citiesData));
  }, [citiesData]);

  // Citizen Reporting Actions (MongoDB Synced)
  const addCitizenReport = (newReport) => {
    const reportWithMeta = {
      ...newReport,
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Just now',
      timestamp: new Date().toISOString(),
      upvotes: 1,
      status: 'Pending',
      actionNote: 'Submitted to Environmental Board queue'
    };

    // Immediate UI update
    setCitizenReports(prev => [reportWithMeta, ...prev]);

    // Send to MongoDB backend
    createReportApi(reportWithMeta).then(res => {
      if (res?.data) {
        console.log('✅ Report saved to MongoDB:', res.data.id);
      }
    });

    return reportWithMeta;
  };

  const upvoteReport = (reportId) => {
    setCitizenReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        return { ...rep, upvotes: (rep.upvotes || 0) + 1, userUpvoted: true };
      }
      return rep;
    }));

    // Sync upvote to MongoDB
    upvoteReportApi(reportId);
  };

  const updateReportStatus = (reportId, newStatus, actionNote) => {
    setCitizenReports(prev => prev.map(rep => {
      if (rep.id === reportId) {
        return {
          ...rep,
          status: newStatus,
          actionNote: actionNote || rep.actionNote
        };
      }
      return rep;
    }));

    // Sync status change to MongoDB
    updateReportStatusApi(reportId, newStatus, actionNote);
  };

  const deleteReport = (reportId) => {
    setCitizenReports(prev => prev.filter(r => r.id !== reportId));
    // Sync delete to MongoDB
    deleteReportApi(reportId);
  };

  // Alert Management Actions (MongoDB Synced)
  const addAlert = (newAlert) => {
    const fullAlert = {
      ...newAlert,
      id: Date.now(),
      time: new Date().toISOString(),
      active: true
    };
    setAlerts(prev => [fullAlert, ...prev]);
    createAlertApi(fullAlert);
    return fullAlert;
  };

  const toggleAlertActive = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, active: !a.active } : a));
    toggleAlertApi(alertId);
  };

  const deleteAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    deleteAlertApi(alertId);
  };

  // City Data Management
  const updateCityData = (cityId, updatedFields) => {
    setCitiesData(prev => prev.map(c => c.id === cityId ? { ...c, ...updatedFields } : c));
  };

  // Cart and Wishlist
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));

  const updateCartQty = (id, qty) => {
    if (qty === 0) return removeFromCart(id);
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty } : p));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => prev.some(p => p.id === product.id)
      ? prev.filter(p => p.id !== product.id)
      : [...prev, product]
    );
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const cartCount = cart.reduce((sum, p) => sum + p.qty, 0);

  return (
    <AppContext.Provider value={{
      selectedLocation, setSelectedLocation,
      selectedCity, setSelectedCity,
      cart, addToCart, removeFromCart, updateCartQty, cartTotal, cartCount,
      wishlist, toggleWishlist,
      savedLocations, setSavedLocations,
      notifications, setNotifications,
      user, setUser,
      login, logout,
      authModalOpen, setAuthModalOpen,
      authModalMode, setAuthModalMode,
      isLoggedIn: !!user,
      searchQuery, setSearchQuery,
      // Citizen Reports
      citizenReports, addCitizenReport, upvoteReport, updateReportStatus, deleteReport,
      // Alerts
      alerts, addAlert, toggleAlertActive, deleteAlert,
      // Cities
      citiesData, updateCityData,
      // MongoDB Status
      dbStatus,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  return ctx ?? defaultContext;
};
