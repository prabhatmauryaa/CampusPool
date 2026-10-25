const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Universal fetch wrapper for CampusPool API
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach token from localStorage if available in browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('campuspool_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or CORS error
    const netErr = new Error(
      'Could not connect to CampusPool server. Please ensure the backend server is running on port 5000.'
    );
    netErr.status = 503;
    throw netErr;
  }
}

// Auth API
export const authApi = {
  register: (payload) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (payload) =>
    apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  submitIdVerification: (payload) =>
    apiRequest('/auth/verify-id', { method: 'POST', body: JSON.stringify(payload) }),
};

// Rides API
export const ridesApi = {
  getRides: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiRequest(`/rides${queryString ? `?${queryString}` : ''}`);
  },
  getRideById: (id) => apiRequest(`/rides/${id}`),
  createRide: (payload) =>
    apiRequest('/rides', { method: 'POST', body: JSON.stringify(payload) }),
  joinRide: (id, payload) =>
    apiRequest(`/rides/${id}/join`, { method: 'POST', body: JSON.stringify(payload) }),
  cancelRide: (id, payload) =>
    apiRequest(`/rides/${id}/cancel`, { method: 'POST', body: JSON.stringify(payload) }),
  cancelBooking: (bookingId, payload) =>
    apiRequest(`/rides/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCancellationStatus: () => apiRequest('/rides/cancellation-status'),
};

// Bookings & Dashboard API
export const bookingsApi = {
  getMyCreatedRides: () => apiRequest('/bookings/my-created'),
  getMyJoinedRides: () => apiRequest('/bookings/my-joined'),
  getDashboardSummary: () => apiRequest('/bookings/dashboard-summary'),
};

// Notifications API
export const notificationsApi = {
  getNotifications: () => apiRequest('/notifications'),
  markAsRead: (id = 'all') => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
};

// Reports API (Incident Reporting & Admin Moderation)
export const reportsApi = {
  createReport: (payload) =>
    apiRequest('/reports', { method: 'POST', body: JSON.stringify(payload) }),
  getAllReports: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiRequest(`/reports${queryString ? `?${queryString}` : ''}`);
  },
  updateReportStatus: (id, payload) =>
    apiRequest(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  getAdminOverview: () => apiRequest('/reports/overview'),
};

// Admin Moderation API
export const adminApi = {
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiRequest(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  verifyUser: (id, payload) =>
    apiRequest(`/admin/users/${id}/verify`, { method: 'PUT', body: JSON.stringify(payload) }),
  reinstateUser: (id, payload) =>
    apiRequest(`/admin/users/${id}/reinstate`, { method: 'POST', body: JSON.stringify(payload) }),
  suspendUser: (id, payload) =>
    apiRequest(`/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify(payload) }),
  getSuspendedUsers: () => apiRequest('/admin/suspended-users'),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),
  getCancellationLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiRequest(`/admin/cancellations${queryString ? `?${queryString}` : ''}`);
  },
};

// Private Ride Chat API
export const chatApi = {
  getMyConversations: () => apiRequest('/chat'),
  getConversationById: (id) => apiRequest(`/chat/${id}`),
  getConversationByBooking: (bookingId) => apiRequest(`/chat/booking/${bookingId}`),
  getMessages: (conversationId) => apiRequest(`/chat/${conversationId}/messages`),
  sendMessage: (conversationId, payload) =>
    apiRequest(`/chat/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  markAsRead: (conversationId) =>
    apiRequest(`/chat/${conversationId}/read`, {
      method: 'PUT',
    }),
};
