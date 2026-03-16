/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ProjectSelectionPage from './pages/ProjectSelectionPage';
import OrderSelectionPage from './pages/OrderSelectionPage';
import OverviewPage from './pages/OverviewPage';
import EditorPage from './pages/EditorPage';
import QuotationPage from './pages/QuotationPage';
import SettlementPage from './pages/SettlementPage';
import { Toaster } from 'sonner';
import { OrderVersion } from './types';
const INITIAL_MOCK_VERSIONS: OrderVersion[] = [
  {
    id: "v-draft-001",
    versionNumber: "1.0",
    name: "初始草稿",
    status: "draft",
    createdAt: "2026-03-08T10:00:00Z",
    pages: [
      {
        snapshotId: "s1", versionId: "v-draft-001", pageId: "p1", order: 1, title: "首页", text: "首页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
        annotations: [{ id: "a1", targetType: "image_point", point: { x: 10, y: 20 }, content: "标注1", createdAt: "2026-03-08T10:00:00Z" }],
        comments: [],
        lock: { isLocked: false }
      },
      {
        snapshotId: "s2", versionId: "v-draft-001", pageId: "p2", order: 2, title: "详情页", text: "详情页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
        annotations: [],
        comments: [{ id: "c1", targetType: "text_description", content: "这里需要调整", createdAt: "2026-03-08T10:00:00Z", authorName: "客户" }],
        lock: { isLocked: false }
      }
    ]
  },
  {
    id: "v-pub-001",
    basedOnVersionId: "v-draft-001",
    versionNumber: "0.9",
    name: "发布版本",
    status: "published",
    createdAt: "2026-03-01T10:00:00Z",
    publishedAt: "2026-03-01T12:00:00Z",
    pages: [{
      snapshotId: "s3", versionId: "v-pub-001", pageId: "p1", order: 1, title: "首页", text: "首页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
      annotations: [], comments: [], lock: { isLocked: false }
    }]
  }
];

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
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectSelectionPage />} />
        <Route path="/orders" element={<OrderSelectionPage />} />
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
        <Route path="/quotation" element={<QuotationPage />} />
        <Route path="/settlement" element={<SettlementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
