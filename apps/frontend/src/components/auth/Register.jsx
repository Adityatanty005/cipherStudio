import React, { useState } from "react";
import { register, saveToken } from "./auth";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    const res = await register({ email, password, name });
    if (res && res.token) {
      saveToken(res.token);
      onRegister && onRegister(res.user);
      try {
        window.history.replaceState({}, "", "/");
      } catch {
        console.debug("replaceState failed");
      }
    } else {
      setErr(res && res.error ? res.error : "Register failed");
    }
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div className="cs-auth-title">Create account</div>
      <div className="cs-auth-sub">
        Quick setup — create your CipherStudio account
      </div>
      <input
        className="cs-input"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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
          Create
        </button>
        <button
          type="button"
          className="cs-btn"
          onClick={() => {
            setErr(null);
            setEmail("");
            setPassword("");
            setName("");
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
