/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OverviewPage from './pages/Overview';
import EditorPage from './pages/Editor';
import { INITIAL_MOCK_VERSIONS, OrderVersion } from './types';

export default function App() {
  const [versions, setVersions] = useState<OrderVersion[]>(INITIAL_MOCK_VERSIONS);

  const handleUpdateVersion = (updatedVersion: OrderVersion) => {
    setVersions(prev => prev.map(v => v.id === updatedVersion.id ? updatedVersion : v));
  };

  const handlePublishVersion = (id: string) => {
    setVersions(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, status: 'published', publishedAt: new Date().toISOString() };
      }
      return v;
    }));
  };

  const handleCopyVersion = (id: string) => {
    const source = versions.find(v => v.id === id);
    if (!source) return;

    const newVersion: OrderVersion = {
      ...source,
      id: `v-draft-${Date.now()}`,
      versionNumber: (parseFloat(source.versionNumber) + 0.1).toFixed(1),
      name: `${source.name} (副本)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      publishedAt: undefined,
      basedOnVersionId: source.id,
    };

    // If there's already a draft, we might want to archive it or just add this one
    // For simplicity in prototype, we just add it
    setVersions(prev => [newVersion, ...prev]);
  };

  const handleCreateVersion = () => {
    const newVersion: OrderVersion = {
      id: `v-draft-${Date.now()}`,
      versionNumber: "1.0",
      name: "新方案",
      status: 'draft',
      createdAt: new Date().toISOString(),
      pages: []
    };
    setVersions(prev => [newVersion, ...prev]);
  };

  return (
    <Routes>
      <Route 
        path="/overview" 
        element={
          <OverviewPage 
            versions={versions} 
            onPublishVersion={handlePublishVersion}
            onCopyVersion={handleCopyVersion}
            onCreateVersion={handleCreateVersion}
          />
        } 
      />
      <Route 
        path="/editor/:versionId" 
        element={
          <EditorPage 
            versions={versions} 
            onUpdateVersion={handleUpdateVersion}
            onPublishVersion={handlePublishVersion}
          />
        } 
      />
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
