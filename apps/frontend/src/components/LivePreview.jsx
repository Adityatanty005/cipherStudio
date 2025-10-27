import React from 'react';
import { SandpackPreview } from '@codesandbox/sandpack-react';

export default function LivePreview() {
  return (
    <div style={{ flex: 1 }}>
      <SandpackPreview />
    </div>
  );
}