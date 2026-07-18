/* ==========================================================================
   API.JS — centralized fetch wrapper for the backend REST API
   Change API_BASE_URL when you deploy the backend (e.g. Render URL)
   ========================================================================== */

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://your-backend.onrender.com/api'; // <-- replace after deploying to Render

const getToken = () => localStorage.getItem('nayeem_admin_token');
const setToken = (token) => localStorage.setItem('nayeem_admin_token', token);
const clearToken = () => localStorage.removeItem('nayeem_admin_token');

async function apiRequest(endpoint, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  getMe: () => apiRequest('/auth/me', { auth: true }),

  // Projects
  getProjects: (params = '') => apiRequest(`/projects${params}`),
  getProject: (slug) => apiRequest(`/projects/${slug}`),
  createProject: (payload) => apiRequest('/projects', { method: 'POST', body: payload, auth: true }),
  updateProject: (id, payload) => apiRequest(`/projects/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, { method: 'DELETE', auth: true }),

  // Certificates
  getCertificates: () => apiRequest('/certificates'),
  createCertificate: (payload) => apiRequest('/certificates', { method: 'POST', body: payload, auth: true }),
  deleteCertificate: (id) => apiRequest(`/certificates/${id}`, { method: 'DELETE', auth: true }),

  // Blogs
  getBlogs: (params = '') => apiRequest(`/blogs${params}`),
  getBlog: (slug) => apiRequest(`/blogs/${slug}`),
  createBlog: (payload) => apiRequest('/blogs', { method: 'POST', body: payload, auth: true }),
  deleteBlog: (id) => apiRequest(`/blogs/${id}`, { method: 'DELETE', auth: true }),
  addComment: (slug, payload) => apiRequest(`/blogs/${slug}/comments`, { method: 'POST', body: payload }),

  // Contact
  sendMessage: (payload) => apiRequest('/contact', { method: 'POST', body: payload }),
  getMessages: () => apiRequest('/contact', { auth: true }),
  deleteMessage: (id) => apiRequest(`/contact/${id}`, { method: 'DELETE', auth: true }),

  // Stats
  logVisit: (page) => apiRequest('/stats/visit', { method: 'POST', body: { page } }).catch(() => {}),
  getSummary: () => apiRequest('/stats/summary', { auth: true }),
};
