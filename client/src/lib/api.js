const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, { method = "GET", body, auth = false } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include" // send/receive cookie
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export const Auth = {
  login: (email, password) => api("/api/auth/login", { method: "POST", body: { email, password } }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  me: () => api("/api/auth/me")
};

export const Products = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/products${q ? `?${q}` : ""}`);
  },
  get: (slug) => api(`/api/products/${slug}`),
  create: (data) => api("/api/products", { method: "POST", body: data }),
  update: (id, data) => api(`/api/products/${id}`, { method: "PUT", body: data }),
  remove: (id) => api(`/api/products/${id}`, { method: "DELETE" })
};
