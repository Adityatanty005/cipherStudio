import { createContext, useContext } from "react";

export const ProjectContext = createContext();

export function useProject() {
  return useContext(ProjectContext);
}

export const DEFAULT_FILES = {
  "/src/App.jsx": {
    code: `import React from 'react';

export default function App() {
  return (
    <div style={{padding:20}}>
      <h1 style={{fontFamily:'sans-serif'}}>CipherStudio — Hello World</h1>
      <p>Edit files in the explorer to the left and see the preview update live.</p>
    </div>
  );
}
`,
  },
  "/src/index.jsx": {
    code: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);`,
  },
  "/src/index.css": {
    code: `body { margin: 0; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }`,
  },
  "package.json": {
    code: `{
  "name": "cipherstudio-sandbox",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,
  },
  "/public/index.html": {
    code: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>CipherStudio Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  },
};
