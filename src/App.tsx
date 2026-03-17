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

const INITIAL_MOCK_VERSIONS_O2: OrderVersion[] = [
  {
    id: 'v-lhjcf-002-1',
    versionNumber: '1',
    name: '现代简约风格软装方案',
    status: 'reviewed',
    createdAt: '2026-03-15 10:30',
    publishedAt: '2026-03-15 14:20',
    pages: [
      {
        snapshotId: 's1',
        versionId: 'v-lhjcf-002-1',
        pageId: 'p1',
        order: 1,
        title: '餐厅设计方案',
        text: '这组设计呈现了极致的侘寂风美学。空间大量运用微水泥、粗犷的原木和原始陶艺，通过质朴的肌理传达岁月的沉静。错落排布的编织灯饰不仅是视觉焦点，更散发出柔和的暖光，构建出一个逃离城市喧嚣、回归自然本质的沉浸式禅意交流空间。',
        imageUrl: '/images/Gemini_Generated_Image_6gxyu16gxyu16gxy.png',
        annotations: [
          {
            id: 'anno-1',
            targetType: 'image_point',
            point: { x: 35, y: 45 },
            content: '建议选用耐磨科技布材质，方便后期打理。',
            createdAt: '2026-03-15 11:00',
            authorName: '杜宇轩'
          }
        ],
        comments: [
          {
            id: 'comm-1',
            targetType: 'image_point',
            point: { x: 65, y: 55 },
            content: '这里不要挂画。',
            createdAt: '2026-03-16 09:15',
            authorName: '业主 - 刘先生'
          },
          {
            id: 'comm-2',
            targetType: 'text_description',
            content: '沙发颜色注意不要太深。',
            createdAt: '2026-03-16 09:20',
            authorName: '业主 - 刘先生'
          }
        ],
        lock: { isLocked: true }
      },
      {
        snapshotId: 's2',
        versionId: 'v-lhjcf-002-1',
        pageId: 'p2',
        order: 2,
        title: '客餐厅方案',
        text: '该方案展现了充满建筑张力的现代设计。清水混凝土墙面与冷峻的大理石长桌奠定了空间的理性基调，而爱马仕橙皮质餐椅与精致的金属编织吊灯则巧妙地注入了温度与质感。冷暖材质的极致碰撞，在利落的几何线条下勾勒出低调、奢华且富有力量感的审美格调。',
        imageUrl: '/images/unwatermarked_Gemini_Generated_Image_uswrceuswrceuswr.png',
        annotations: [
          {
            id: 'anno-2',
            targetType: 'image_point',
            point: { x: 45, y: 30 },
            content: '吊灯高度建议距离桌面 75-85cm，光线最舒适。',
            createdAt: '2026-03-15 11:15',
            authorName: '杜宇轩'
          }
        ],
        comments: [
          {
            id: 'comm-3',
            targetType: 'image_point',
            point: { x: 55, y: 60 },
            content: '餐椅的皮质颜色可以换成深灰色吗？',
            createdAt: '2026-03-16 10:05',
            authorName: '业主 - 刘先生'
          }
        ],
        lock: { isLocked: true }
      },
      {
        snapshotId: 's3',
        versionId: 'v-lhjcf-002-1',
        pageId: 'p3',
        order: 3,
        title: '客厅设计方案',
        text: '该方案采用了奶油风与现代法式的融合。空间以低饱和度的暖白色为基调，圆润的弧形沙发配合有机造型吊灯，营造出温润的包裹感。鱼骨拼木地板与藤编屏风的运用，为室内增添了细腻的自然纹理与复古气息，展现出一种松弛、高级且富有艺术感的生活状态。',
        imageUrl: '/images/unwatermarked_Gemini_Generated_Image_a36zwca36zwca36z.png',
        annotations: [
          {
            id: 'anno-3',
            targetType: 'image_point',
            point: { x: 25, y: 50 },
            content: '这是个用来收纳工具的家政柜。',
            createdAt: '2026-03-15 11:30',
            authorName: '杜宇轩'
          }
        ],
        comments: [
          {
            id: 'comm-4',
            targetType: 'image_point',
            point: { x: 70, y: 40 },
            content: '我想要玻璃门。',
            createdAt: '2026-03-16 11:20',
            authorName: '业主 - 刘先生'
          }
        ],
        lock: { isLocked: true }
      }
    ]
  }
];

export default function App() {
  // Isolate data by orderId
  const [versionsMap, setVersionsMap] = useState<Record<string, OrderVersion[]>>({
    'o1': INITIAL_MOCK_VERSIONS,
    'o2': INITIAL_MOCK_VERSIONS_O2
  });
  const [quotationsMap, setQuotationsMap] = useState<Record<string, QuotationVersion[]>>({
    'o2': [
      {
        id: 'q-lhjcf-002-1',
        versionNumber: '1',
        name: '订购报价单 V1',
        status: 'signed',
        createdAt: '2026-03-16 14:00',
        publishedAt: '2026-03-16 15:30',
        signedAt: '2026-03-17 09:00',
        totalPrice: '¥45,800'
      }
    ]
  });
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
          comments: p.comments || []
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
