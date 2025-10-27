// Prefer explicit VITE API root (set VITE_API_ROOT in .env), then window override, then default to localhost:3000
export const API_ROOT =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_ROOT
    ? import.meta.env.VITE_API_ROOT
    : window.__API_ROOT__ || "http://localhost:3000";

export async function register({ email, password, name }) {
  try {
    const res = await fetch(`${API_ROOT}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!res.ok) return body || { error: res.statusText || "request failed" };
    return body;
  } catch (err) {
    console.error("register fetch error", err);
    return { error: "network", details: err.message };
  }
}

export async function login({ email, password }) {
  try {
    const res = await fetch(`${API_ROOT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    if (!res.ok) return body || { error: res.statusText || "request failed" };
    return body;
  } catch (err) {
    console.error("login fetch error", err);
    return { error: "network", details: err.message };
  }
}

export function saveToken(token) {
  localStorage.setItem("cipherstudio.token", token);
}
export function getToken() {
  return localStorage.getItem("cipherstudio.token");
}
export function clearToken() {
  localStorage.removeItem("cipherstudio.token");
}
