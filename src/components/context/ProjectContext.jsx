import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ProjectContext,
  DEFAULT_FILES as DEFAULT_FILES_FROM_STORE,
} from "./projectStore";

const DEFAULT_FILES = DEFAULT_FILES_FROM_STORE;

export function ProjectProvider({ children }) {
  const [projectId, setProjectId] = useState(() => {
    // try to get a last used projectId
    return localStorage.getItem("cipherstudio.lastProject") || uuidv4();
  });

  const [autosave, setAutosave] = useState(() => {
    const raw = localStorage.getItem("cipherstudio.autosave");
    return raw ? raw === "true" : true;
  });

  // persist autosave preference
  useEffect(() => {
    localStorage.setItem("cipherstudio.autosave", autosave ? "true" : "false");
  }, [autosave]);

  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem(`cipherstudio.project.${projectId}`);
    if (saved) {
      try {
        return JSON.parse(saved).files || DEFAULT_FILES;
      } catch {
        return DEFAULT_FILES;
      }
    }
    // New project uses default files
    return DEFAULT_FILES;
  });

  useEffect(() => {
    // keep last project id
    localStorage.setItem("cipherstudio.lastProject", projectId);
  }, [projectId]);

  const saveProject = (id = projectId) => {
    const payload = { id, files };
    localStorage.setItem(`cipherstudio.project.${id}`, JSON.stringify(payload));
  };

  const loadProject = (id) => {
    const raw = localStorage.getItem(`cipherstudio.project.${id}`);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      setFiles(parsed.files || DEFAULT_FILES);
      setProjectId(id);
      return true;
    } catch {
      return false;
    }
  };

  const createFile = (path, content = "") => {
    setFiles((prev) => {
      if (prev[path]) return prev;
      const next = { ...prev, [path]: { code: content } };
      return next;
    });
  };

  const deleteFile = (path) => {
    setFiles((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  };

  const updateFile = (path, code) => {
    setFiles((prev) => {
      if (!prev[path]) return prev;
      return { ...prev, [path]: { code } };
    });
  };

  const renameFile = (oldPath, newPath) => {
    setFiles((prev) => {
      if (!prev[oldPath]) return prev;
      if (prev[newPath]) return prev; // don't overwrite existing
      const next = { ...prev };
      next[newPath] = { ...next[oldPath] };
      delete next[oldPath];
      return next;
    });
  };

  const newProject = () => {
    const id = uuidv4();
    setFiles(DEFAULT_FILES);
    setProjectId(id);
    return id;
  };

  const exportProject = () => {
    const payload = { id: projectId, files };
    return JSON.stringify(payload, null, 2);
  };

  const importProject = (payload) => {
    // payload can be an object or JSON string
    let parsed = payload;
    if (typeof payload === "string") {
      try {
        parsed = JSON.parse(payload);
      } catch {
        return false;
      }
    }

    const filesToSet = parsed.files || DEFAULT_FILES;
    const idToUse = parsed.id || uuidv4();

    // Save to localStorage immediately with the chosen id
    localStorage.setItem(
      `cipherstudio.project.${idToUse}`,
      JSON.stringify({ id: idToUse, files: filesToSet })
    );

    // Update provider state
    setFiles(filesToSet);
    setProjectId(idToUse);

    return idToUse;
  };

  useEffect(() => {
    // autosave current project to localStorage when files or projectId changes
    // but only if autosave is enabled
    if (autosave) {
      localStorage.setItem(
        `cipherstudio.project.${projectId}`,
        JSON.stringify({ id: projectId, files })
      );
    }
  }, [files, projectId, autosave]);

  // when autosave is turned on, immediately persist the current project
  useEffect(() => {
    if (autosave) {
      localStorage.setItem(
        `cipherstudio.project.${projectId}`,
        JSON.stringify({ id: projectId, files })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosave]);

  const value = {
    projectId,
    setProjectId,
    files,
    createFile,
    deleteFile,
    updateFile,
    renameFile,
    saveProject,
    loadProject,
    importProject,
    newProject,
    exportProject,
    autosave,
    setAutosave,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
