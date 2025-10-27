import React, { useState } from "react";
import { login, saveToken } from "./auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    const res = await login({ email, password });
    if (res && res.token) {
      saveToken(res.token);
      onLogin && onLogin(res.user);
      try {
        window.history.replaceState({}, "", "/");
      } catch {
        console.debug("replaceState failed");
      }
    } else {
      setErr(res && res.error ? res.error : "Login failed");
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div className="cs-auth-title">Sign in</div>
      <div className="cs-auth-sub">
        Welcome back — sign in to continue to CipherStudio
      </div>
      <input
        className="cs-input"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="cs-input"
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="cs-form-row">
        <button className="cs-btn-primary" type="submit">
          Sign in
        </button>
        <button
          type="button"
          className="cs-btn"
          onClick={() => {
            setErr(null);
            setEmail("");
            setPassword("");
          }}
        >
          Reset
        </button>
      </div>
      {err && (
        <div style={{ color: "var(--muted)", marginTop: 6 }}>{String(err)}</div>
      )}
    </form>
  );
}
