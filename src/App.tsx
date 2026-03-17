/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ProjectSelectionPage from './pages/ProjectSelectionPage';
import OrderSelectionPage from './pages/OrderSelectionPage';
import OverviewPage from './pages/OverviewPage';
import EditorPage from './pages/EditorPage';
import QuotationPage from './pages/QuotationPage';
import SettlementPage from './pages/SettlementPage';
import { Toaster } from 'sonner';
import { OrderVersion, QuotationVersion, SettlementVersion } from './types';
const INITIAL_MOCK_VERSIONS: OrderVersion[] = [
  {
    id: "v-draft-001",
    versionNumber: "1",
    name: "初始方案",
    status: "draft",
    createdAt: "2026-03-08T10:00:00Z",
    pages: [
      {
        snapshotId: "s1", versionId: "v-draft-001", pageId: "p1", order: 1, title: "首页", text: "首页描述", imageUrl: "https://picsum.photos/seed/design1/1920/1080",
        annotations: [{ id: "a1", targetType: "image_point", point: { x: 10, y: 20 }, content: "标注1", createdAt: "2026-03-08T10:00:00Z" }],
        comments: [],
        lock: { isLocked: false }
      }
    ]
  }
];

export default function App() {
  // Isolate data by orderId
  const [versionsMap, setVersionsMap] = useState<Record<string, OrderVersion[]>>({
    'o1': INITIAL_MOCK_VERSIONS
  });
  const [quotationsMap, setQuotationsMap] = useState<Record<string, QuotationVersion[]>>({});
  const [settlementsMap, setSettlementsMap] = useState<Record<string, SettlementVersion[]>>({});

  const handleUpdateVersion = (orderId: string, updatedVersion: OrderVersion) => {
    setVersionsMap(prev => {
      const versions = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: versions.map(v => v.id === updatedVersion.id ? updatedVersion : v)
      };
    });
  };

  const handlePublishVersion = (orderId: string, id: string) => {
    setVersionsMap(prev => {
      const versions = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: versions.map(v => {
          if (v.id === id) {
            return { ...v, status: 'published_unread', publishedAt: new Date().toISOString() };
          }
          return v;
        })
      };
    });
  };

  const handleStartReview = (orderId: string, id: string) => {
    setVersionsMap(prev => {
      const versions = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: versions.map(v => v.id === id ? { ...v, status: 'reviewing' } : v)
      };
    });
  };

  const handleCompleteReview = (orderId: string, id: string) => {
    setVersionsMap(prev => {
      const versions = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: versions.map(v => v.id === id ? { ...v, status: 'reviewed' } : v)
      };
    });
  };

  const handleCreateVersion = (orderId: string) => {
    const versions = versionsMap[orderId] || [];
    const latestVersion = versions[0];
    const maxVersionNumber = Math.max(...versions.map(v => parseInt(v.versionNumber)), 0);
    const newVersionNumber = (maxVersionNumber + 1).toString();
    const newId = `v-${Date.now()}`;

    let newVersion: OrderVersion;

    if (latestVersion) {
      newVersion = {
        ...latestVersion,
        id: newId,
        versionNumber: newVersionNumber,
        name: `${latestVersion.name.replace(/ 副本$/, '')} 副本`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        publishedAt: undefined,
        pages: latestVersion.pages.map(p => ({
          ...p,
          snapshotId: `s-${Date.now()}-${Math.random()}`,
          versionId: newId,
          comments: []
        }))
      };
    } else {
      newVersion = {
        id: newId,
        versionNumber: newVersionNumber,
        name: "新方案",
        status: 'draft',
        createdAt: new Date().toISOString(),
        pages: []
      };
    }

    setVersionsMap(prev => ({
      ...prev,
      [orderId]: [newVersion, ...(prev[orderId] || [])]
    }));

    return { id: newId, versionNumber: newVersionNumber, isCopy: !!latestVersion };
  };

  // Quotation Handlers
  const handlePublishQuotation = (orderId: string, id: string) => {
    setQuotationsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'unread', publishedAt: new Date().toISOString() } : v)
      };
    });
  };

  const handleViewQuotation = (orderId: string, id: string) => {
    setQuotationsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id && v.status === 'unread' ? { ...v, status: 'read' } : v)
      };
    });
  };

  const handleFeedbackQuotation = (orderId: string, id: string, feedback: string) => {
    setQuotationsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'feedback', feedback, feedbackAt: new Date().toISOString() } : v)
      };
    });
  };

  const handleSignQuotation = (orderId: string, id: string) => {
    setQuotationsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'signed', signedAt: new Date().toISOString(), signatureUrl: 'https://ais-pre-l74ktpnqjf3ojqhok23elc-355399745607.us-east1.run.app/signature.png' } : v)
      };
    });
  };

  // Settlement Handlers
  const handlePublishSettlement = (orderId: string, id: string) => {
    setSettlementsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'unread', publishedAt: new Date().toISOString() } : v)
      };
    });
  };

  const handleViewSettlement = (orderId: string, id: string) => {
    setSettlementsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id && v.status === 'unread' ? { ...v, status: 'read' } : v)
      };
    });
  };

  const handleFeedbackSettlement = (orderId: string, id: string, feedback: string) => {
    setSettlementsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'feedback', feedback, feedbackAt: new Date().toISOString() } : v)
      };
    });
  };

  const handleSignSettlement = (orderId: string, id: string) => {
    setSettlementsMap(prev => {
      const list = prev[orderId] || [];
      return {
        ...prev,
        [orderId]: list.map(v => v.id === id ? { ...v, status: 'signed', signedAt: new Date().toISOString(), signatureUrl: 'https://ais-pre-l74ktpnqjf3ojqhok23elc-355399745607.us-east1.run.app/signature.png' } : v)
      };
    });
  };

  return (
    <>
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            borderRadius: '16px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'HonorSans, sans-serif',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
            border: 'none',
          },
          className: 'my-toast-class',
        }}
      />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectSelectionPage />} />
        <Route path="/orders" element={<OrderSelectionPage />} />
        <Route 
          path="/overview" 
          element={
            <OverviewWrapper 
              versionsMap={versionsMap}
              quotationsMap={quotationsMap}
              setQuotationsMap={setQuotationsMap}
              settlementsMap={settlementsMap}
              setSettlementsMap={setSettlementsMap}
              onPublishVersion={handlePublishVersion}
              onStartReview={handleStartReview}
              onCompleteReview={handleCompleteReview}
              onCreateVersion={handleCreateVersion}
              onUpdateVersion={handleUpdateVersion}
              onPublishQuotation={handlePublishQuotation}
              onViewQuotation={handleViewQuotation}
              onFeedbackQuotation={handleFeedbackQuotation}
              onSignQuotation={handleSignQuotation}
              onPublishSettlement={handlePublishSettlement}
              onViewSettlement={handleViewSettlement}
              onFeedbackSettlement={handleFeedbackSettlement}
              onSignSettlement={handleSignSettlement}
            />
          } 
        />
        <Route 
          path="/editor/:versionId" 
          element={
            <EditorWrapper 
              versionsMap={versionsMap}
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

// Wrapper to inject orderId from location state
function OverviewWrapper({ 
  versionsMap, 
  quotationsMap, 
  setQuotationsMap, 
  settlementsMap, 
  setSettlementsMap,
  onPublishVersion,
  onStartReview,
  onCompleteReview,
  onCreateVersion,
  onUpdateVersion,
  onPublishQuotation,
  onViewQuotation,
  onFeedbackQuotation,
  onSignQuotation,
  onPublishSettlement,
  onViewSettlement,
  onFeedbackSettlement,
  onSignSettlement
}: any) {
  const location = useLocation();
  const orderId = location.state?.order?.id || 'o1';

  return (
    <OverviewPage 
      versions={versionsMap[orderId] || []} 
      quotationVersions={quotationsMap[orderId] || []}
      setQuotationVersions={(val: any) => {
        if (typeof val === 'function') {
          setQuotationsMap((prev: any) => ({ ...prev, [orderId]: val(prev[orderId] || []) }));
        } else {
          setQuotationsMap((prev: any) => ({ ...prev, [orderId]: val }));
        }
      }}
      settlementVersions={settlementsMap[orderId] || []}
      setSettlementVersions={(val: any) => {
        if (typeof val === 'function') {
          setSettlementsMap((prev: any) => ({ ...prev, [orderId]: val(prev[orderId] || []) }));
        } else {
          setSettlementsMap((prev: any) => ({ ...prev, [orderId]: val }));
        }
      }}
      onPublishVersion={(id: string) => onPublishVersion(orderId, id)}
      onStartReview={(id: string) => onStartReview(orderId, id)}
      onCompleteReview={(id: string) => onCompleteReview(orderId, id)}
      onCreateVersion={() => onCreateVersion(orderId)}
      onUpdateVersion={(v: OrderVersion) => onUpdateVersion(orderId, v)}
      onPublishQuotation={(id: string) => onPublishQuotation(orderId, id)}
      onViewQuotation={(id: string) => onViewQuotation(orderId, id)}
      onFeedbackQuotation={(id: string, feedback: string) => onFeedbackQuotation(orderId, id, feedback)}
      onSignQuotation={(id: string) => onSignQuotation(orderId, id)}
      onPublishSettlement={(id: string) => onPublishSettlement(orderId, id)}
      onViewSettlement={(id: string) => onViewSettlement(orderId, id)}
      onFeedbackSettlement={(id: string, feedback: string) => onFeedbackSettlement(orderId, id, feedback)}
      onSignSettlement={(id: string) => onSignSettlement(orderId, id)}
    />
  );
}

// Wrapper for Editor to find which order the version belongs to
function EditorWrapper({ versionsMap, onUpdateVersion, onPublishVersion }: any) {
  const { versionId } = useParams();
  
  // Find orderId
  let orderId = 'o1';
  for (const [id, versions] of Object.entries(versionsMap)) {
    if ((versions as OrderVersion[]).some(v => v.id === versionId)) {
      orderId = id;
      break;
    }
  }

  return (
    <EditorPage 
      versions={versionsMap[orderId] || []} 
      onUpdateVersion={(v: OrderVersion) => onUpdateVersion(orderId, v)}
      onPublishVersion={(id: string) => onPublishVersion(orderId, id)}
    />
  );
}
