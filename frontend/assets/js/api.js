/* ==========================================================================
   API.JS — centralized fetch wrapper for the backend REST API
   ========================================================================== */

// Ekhane Render er link er sheshe /api add kora hoyeche
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000/api'
  : 'https://my-portfolio-yxoz.onrender.com/api'; 

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

async function apiUpload(file) {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Upload failed with status ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  getMe: () => apiRequest('/auth/me', { auth: true }),
  getPublicProfile: () => apiRequest('/auth/profile'),
  updateProfile: (payload) => apiRequest('/auth/me', { method: 'PUT', body: payload, auth: true }),
  uploadFile: (file) => apiUpload(file),

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