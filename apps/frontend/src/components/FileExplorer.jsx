import React, { useState } from "react";
import { useProject } from "./context/projectStore";

export default function FileExplorer({ onOpen }) {
  const {
    files,
    createFile,
    deleteFile,
    projectId,
    saveProject,
    newProject,
    loadProject,
    exportProject,
    importProject,
    renameFile,
    autosave,
    setAutosave,
  } = useProject();
  const [newPath, setNewPath] = useState("");

  const filePaths = Object.keys(files).sort();
  const [active, setActive] = useState(null);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="explorer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div>
          <div className="explorer-title" style={{ fontWeight: 700 }}>Project</div>
          <div className="explorer-id cs-small">id: {projectId}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="cs-btn" onClick={() => { saveProject(); alert('Project saved.'); }}>Save</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          className="cs-input"
          placeholder="/src/NewFile.jsx"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
        />
        <button
          className="cs-btn-primary"
          onClick={() => {
            if (!newPath) return;
            createFile(newPath, "");
            setNewPath("");
          }}
        >
          Add
        </button>
      </div>

      <div className="explorer-list">
        {filePaths.map((p) => (
          <div
            key={p}
            className={`file-row ${active === p ? "file-active" : ""}`}
            onClick={() => {
              setActive(p);
              onOpen(p);
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6 }}
          >
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 20, textAlign: 'center', color: 'var(--muted)' }}>{p.endsWith('/') ? '▸' : 'ƒ'}</div>
              <div className="file-name" style={{ fontSize: 13 }}>{p}</div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="cs-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("Rename file", p);
                  if (!newName || newName === p) return;
                  if (files[newName]) {
                    alert("A file with that name already exists");
                    return;
                  }
                  renameFile(p, newName);
                }}
                title="Rename"
              >
                ✎
              </button>
              <button
                className="cs-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${p}?`)) deleteFile(p);
                }}
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={!!autosave}
            onChange={(e) => setAutosave(!!e.target.checked)}
          />
          Autosave
        </label>

        <button
          className="cs-btn"
          onClick={() => {
            const input = document.getElementById("import-file");
            if (input) input.click();
          }}
        >
          Import
        </button>
        <button
          className="cs-btn"
          onClick={() => {
            const id = prompt("Enter project id to load:");
            if (!id) return;
            const ok = loadProject(id);
            if (!ok) alert("Project not found");
          }}
        >
          Load
        </button>
        <button
          className="cs-btn"
          onClick={() => {
            const id = newProject();
            alert("Created new project: " + id);
          }}
        >
          New
        </button>
        <button
          className="cs-btn"
          onClick={() => {
            const payload = exportProject();
            const blob = new Blob([payload], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `cipherstudio-project-${projectId}.json`;
            a.click();
          }}
        >
          Export
        </button>

        <input
          id="import-file"
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const text = reader.result;
                const id = importProject(text);
                alert("Imported project: " + id);
              } catch {
                alert("Failed to import project");
              }
            };
            reader.readAsText(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
