import React, { useState, useEffect } from "react";
import { ProjectProvider } from "./components/context/ProjectContext";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import Navbar from "./components/Navbar";
import { getToken, API_ROOT } from "./components/auth/auth";

async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_ROOT}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j.user;
  } catch {
    return null;
  }
}

export default function App() {
  const [activePath, setActivePath] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cipherstudio.theme") || "light"
  );
  const [user, setUser] = useState(null);
  const [boot, setBoot] = useState(true);

  useEffect(() => {
    localStorage.setItem("cipherstudio.theme", theme);
  }, [theme]);
  useEffect(() => {
    const cls = "theme-dark";
    const el = document.documentElement;
    if (theme === "dark") {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }
  }, [theme]);

  useEffect(() => {
    (async () => {
      const u = await fetchMe();
      setUser(u);
      setBoot(false);
    })();
  }, []);

  if (boot) return <div className="cs-container">Loading...</div>;

  if (!user) {
    return (
      <ProjectProvider>
        <div className="cs-container">
          <div className="cs-header cs-panel">
            <Navbar
              theme={theme}
              user={user}
              onAuth={(u) => setUser(u)}
              onToggleTheme={() =>
                setTheme((t) => (t === "dark" ? "light" : "dark"))
              }
            />
          </div>
        </div>
      </ProjectProvider>
    );
  }

  return (
    <ProjectProvider>
      <div className="cs-container">
        <div className="cs-header cs-panel">
          <Navbar
            theme={theme}
            user={user}
            onAuth={(u) => setUser(u)}
            onToggleTheme={() =>
              setTheme((t) => (t === "dark" ? "light" : "dark"))
            }
          />
        </div>

        <div className="cs-main">
          <div className="cs-activity cs-panel">
            <button className="act-btn active">🏠</button>
            <button className="act-btn">📁</button>
            <button className="act-btn">⚙️</button>
          </div>

          <div className="cs-explorer cs-panel">
            <FileExplorer onOpen={(p) => setActivePath(p)} />
          </div>

          <div className="cs-editor cs-panel">
            <CodeEditor
              activePath={activePath}
              onChangeActive={(p) => setActivePath(p)}
            />
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
}
