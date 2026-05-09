const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export function getToken() {
  return localStorage.getItem("fraudguard-token");
}

export function setToken(token) {
  localStorage.setItem("fraudguard-token", token);
}

export function clearToken() {
  localStorage.removeItem("fraudguard-token");
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  login: (payload) => request("/api/login", { method: "POST", body: JSON.stringify(payload) }),
  transactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/transactions${query ? `?${query}` : ""}`);
  },
  createTransaction: (payload) => request("/api/transactions", { method: "POST", body: JSON.stringify(payload) }),
  generate: () => request("/api/transactions/generate", { method: "POST" }),
  demo: () => request("/api/transactions/demo", { method: "POST" }),
  clear: () => request("/api/transactions", { method: "DELETE" }),
  analytics: () => request("/api/analytics"),
  updateStatus: (id, status) => request(`/api/transactions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }),
};

export function wsUrl() {
  return import.meta.env.VITE_WS_URL || `${API_BASE.replace(/^http/, "ws")}/ws/alerts`;
}
