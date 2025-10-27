import React, { useState, useEffect } from "react";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { getToken, clearToken } from "./auth/auth";

export default function Navbar({
  onToggleTheme,
  theme,
  user: userProp,
  onAuth,
}) {
  const [show, setShow] = useState(null); // 'login' | 'register' | null
  const [user, setUser] = useState(userProp || null);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // naive presence check; for real app decode token or fetch /me
      setUser({});
    }
  }, []);

  function logout() {
    clearToken();
    setUser(null);
    onAuth && onAuth(null);
  }

  return (
    <div className="cs-header">
      <div className="cs-brand">CipherStudio</div>

      <div className="cs-navbar-actions">
        {user ? (
          <button className="cs-btn-ghost" onClick={logout}>
            Logout
          </button>
        ) : (
          <>
            <button className="cs-btn-ghost" onClick={() => setShow("login")}>
              Login
            </button>
            <button
              className="cs-btn-primary"
              onClick={() => setShow("register")}
            >
              Register
            </button>
          </>
        )}

        <button className="cs-btn cs-btn-ghost" onClick={onToggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>

      {/* centered modal overlay */}
      {show && (
        <div className="cs-auth-overlay" onClick={() => setShow(null)}>
          <div className="cs-auth-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="cs-auth-card">
              {show === "login" ? (
                <Login
                  onLogin={(u) => {
                    setUser(u);
                    onAuth && onAuth(u);
                    setShow(null);
                  }}
                />
              ) : (
                <Register
                  onRegister={(u) => {
                    setUser(u);
                    onAuth && onAuth(u);
                    setShow(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
