// EcoPulse India - MongoDB Backend API Client

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check backend and MongoDB connection status
 */
export async function getBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return { status: 'offline', database: { connected: false } };
  }
}

/**
 * Citizen Reports APIs
 */
export async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE}/reports`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('[API] Could not fetch reports from backend:', err.message);
    return null;
  }
}

export async function createReportApi(reportData) {
  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error('Failed to create report');
    return await res.json();
  } catch (err) {
    console.warn('[API] Backend report creation failed, saving locally:', err.message);
    return null;
  }
}

export async function upvoteReportApi(id) {
  try {
    const res = await fetch(`${API_BASE}/reports/${id}/upvote`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to upvote report');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not sync upvote to backend:', err.message);
    return null;
  }
}

export async function updateReportStatusApi(id, status, actionNote) {
  try {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actionNote }),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not sync status update to backend:', err.message);
    return null;
  }
}

export async function deleteReportApi(id) {
  try {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to delete report');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not sync report deletion to backend:', err.message);
    return null;
  }
}

/**
 * Environmental Alerts APIs
 */
export async function fetchAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch alerts');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('[API] Could not fetch alerts from backend:', err.message);
    return null;
  }
}

export async function createAlertApi(alertData) {
  try {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return await res.json();
  } catch (err) {
    console.warn('[API] Could not save alert to backend:', err.message);
    return null;
  }
}

export async function toggleAlertApi(id) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${id}/toggle`, {
      method: 'PATCH',
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to toggle alert');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function deleteAlertApi(id) {
  try {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('Failed to delete alert');
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Cities & States APIs
 */
export async function fetchCities() {
  try {
    const res = await fetch(`${API_BASE}/cities`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return null;
  }
}
