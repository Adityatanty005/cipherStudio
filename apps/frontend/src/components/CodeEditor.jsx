import React, { useEffect, useMemo, useState } from "react";
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { useProject } from "./context/projectStore";

/*
This component provides a Sandpack-based editor+preview for simplicity.
The FileExplorer will control which file is active via props.
*/

export default function CodeEditor({ activePath, onChangeActive }) {
  const { files, updateFile } = useProject();
  const [theme, setTheme] = useState("light");

  const fileList = useMemo(() => Object.keys(files || {}), [files]);

  const filesForSandpack = useMemo(() => {
    // Sandpack expects an object keyed by file path without leading slash for some entries; it handles both
    const out = {};
    for (const [path, meta] of Object.entries(files)) {
      // Sandpack expects the project root to have package.json and public/index.html
      // keep the paths as-is
      out[path.replace(/^\//, "")] = meta.code;
    }
    return out;
  }, [files]);

  // default activePath
  useEffect(() => {
    if (!activePath) {
      const first = Object.keys(files)[0];
      if (first) onChangeActive(first);
    }
  }, [activePath, files, onChangeActive]);

  if (!activePath) return <div style={{ padding: 12 }}>No file selected.</div>;

  // create template config for sandpack
  const template = {
    files: filesForSandpack,
    template: "react",
    entry: "src/index.jsx",
  };

  const onEditorChange = (code) => {
    // update file in project context
    updateFile(activePath, code);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <SandpackProvider
        customSetup={{
          files: template.files,
          dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        }}
        template="react"
      >
        <div>
          <div className="cs-tabs">
            {fileList.map((f) => (
              <div
                key={f}
                className={`cs-tab ${f === activePath ? "active" : ""}`}
                onClick={() => onChangeActive(f)}
              >
                <span style={{ opacity: 0.9 }}>{f.replace(/^\//, "")}</span>
                {f === activePath ? (
                  <span className="close" onClick={(e) => e.stopPropagation()}>
                    ●
                  </span>
                ) : null}
              </div>
            ))}

            <div style={{ flex: 1 }} />

            <div style={{ paddingRight: 8 }}>
              <label style={{ marginRight: 8 }}>
                Theme
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <SandpackLayout style={{ height: "100%", minHeight: 0 }}>
          <div
            style={{
              width: "50%",
              borderRight: "1px solid var(--border)",
              overflow: "hidden",
              background: "var(--panel)",
            }}
          >
            <SandpackCodeEditor
              showLineNumbers
              wrapContent
              style={{ height: "100%" }}
              activeFile={activePath.replace(/^\//, "")}
              onChange={onEditorChange}
              showTabs={false}
            />
          </div>

          <div style={{ flex: 1, minWidth: 360 }}>
            <SandpackPreview />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
