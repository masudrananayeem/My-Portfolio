/* ==========================================================================
   API.JS — Centralized API Service
   ========================================================================== */

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "https://my-portfolio-yxoz.onrender.com/api";

const getToken = () => localStorage.getItem("nayeem_admin_token");
const setToken = (token) => localStorage.setItem("nayeem_admin_token", token);
const clearToken = () => localStorage.removeItem("nayeem_admin_token");

async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body = null,
    auth = false,
  } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
}

async function apiUpload(file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }

  return data;
}

const api = {

  // ===========================
  // AUTH
  // ===========================

  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  getMe: () =>
    apiRequest("/auth/me", {
      auth: true,
    }),

  getPublicProfile: () =>
    apiRequest("/auth/profile"),

  updateProfile: (payload) =>
    apiRequest("/auth/me", {
      method: "PUT",
      body: payload,
      auth: true,
    }),

  uploadFile: apiUpload,

  // ===========================
  // PROJECTS
  // ===========================

  getProjects: (params = "") =>
    apiRequest(`/projects${params}`),

  getProject: (slug) =>
    apiRequest(`/projects/${slug}`),

  createProject: (payload) =>
    apiRequest("/projects", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  updateProject: (id, payload) =>
    apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: payload,
      auth: true,
    }),

  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // ===========================
  // CERTIFICATES
  // ===========================

  getCertificates: () =>
    apiRequest("/certificates"),

  createCertificate: (payload) =>
    apiRequest("/certificates", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  deleteCertificate: (id) =>
    apiRequest(`/certificates/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // ===========================
  // BLOGS
  // ===========================

  getBlogs: (params = "") =>
    apiRequest(`/blogs${params}`),

  getBlog: (slug) =>
    apiRequest(`/blogs/${slug}`),

  createBlog: (payload) =>
    apiRequest("/blogs", {
      method: "POST",
      body: payload,
      auth: true,
    }),

  deleteBlog: (id) =>
    apiRequest(`/blogs/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  addComment: (slug, payload) =>
    apiRequest(`/blogs/${slug}/comments`, {
      method: "POST",
      body: payload,
    }),

  // ===========================
  // CONTACT
  // ===========================

  sendMessage: (payload) =>
    apiRequest("/contact", {
      method: "POST",
      body: payload,
    }),

  getMessages: () =>
    apiRequest("/contact", {
      auth: true,
    }),

  deleteMessage: (id) =>
    apiRequest(`/contact/${id}`, {
      method: "DELETE",
      auth: true,
    }),

  // ===========================
  // STATS
  // ===========================

  logVisit: (page) =>
    apiRequest("/stats/visit", {
      method: "POST",
      body: { page },
    }).catch(() => {}),

  getSummary: () =>
    apiRequest("/stats/summary", {
      auth: true,
    }),
};

window.api = api;
window.API_BASE_URL = API_BASE_URL;
window.getToken = getToken;
window.setToken = setToken;
window.clearToken = clearToken;