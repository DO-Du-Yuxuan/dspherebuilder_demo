import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { ArrowLeft, History, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';
import { RequirementsDoc } from '../components/RequirementsDoc';

// Mock History Data
const MOCK_HISTORY = [
  { id: '1', action: 'publish', user: '杜宇轩', time: '2026-03-18 10:00', desc: '发布了初始版本至 Home 端' },
  { id: '2', action: 'edit', user: '杜宇轩', time: '2026-03-18 09:30', desc: '修改了预算范围 (30w -> 50-80w)' },
  { id: '3', action: 'edit', user: '杜宇轩', time: '2026-03-17 15:00', desc: '创建了需求书草稿' },
];

export default function ProjectRequirementsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '未知项目', code: 'UNKNOWN' };

  const [isEditing, setIsEditing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);

  const toggleEditing = (val: boolean) => {
    if (!val && isEditing) {
      // We are saving
      setHasUnpublishedChanges(true);
      // In real app, add to history log here
    }
    setIsEditing(val);
  };

  const handlePublish = () => {
    setIsPublished(true);
    setHasUnpublishedChanges(false);
    // In real app, add publish event to history log
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onLogout={() => logout()}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Top Navigation */}
        <button 
          onClick={() => navigate(ROUTES.PROJECTS)}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF6B00] transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> 返回项目列表
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="min-w-0">
            <div className="text-xs text-gray-500 font-medium mb-1">项目交付 · 需求书</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: tokens.fonts.title }}>
              项目需求书
            </h1>
            <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <span className="font-semibold text-gray-900">{project.name}</span>
              <span className="text-gray-300">/</span>
              <span className="font-mono text-gray-500">{project.code}</span>
            </div>

            {/* Status Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {isPublished ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已发布至 Home 端
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  <FileText className="w-3.5 h-3.5" />
                  草稿 (未发布)
                </div>
              )}

              {hasUnpublishedChanges && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  有未发布的更改
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white border border-gray-100 rounded-[24px] shadow-sm p-8 md:p-10">
          {isEditing && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-xl border border-[#EF6B00]/20 bg-[#EF6B00]/10 px-4 py-2.5 text-sm font-semibold text-[#EF6B00]">
              <span className="w-2 h-2 rounded-full bg-[#EF6B00] animate-pulse" />
              编辑模式已开启，修改后请记得保存并重新发布。
            </div>
          )}

          <RequirementsDoc 
            isShowcase={!isEditing} 
            isEditing={isEditing}
            setIsEditing={toggleEditing}
            projectName={project.name}
            ownerDisplayName={project.owner || '用户'}
            onBackHome={() => navigate(ROUTES.PROJECTS)}
            onShowHistory={() => setShowHistory(true)}
            onPublish={handlePublish}
            isPublished={isPublished}
            hasUnpublishedChanges={hasUnpublishedChanges}
          />
        </div>
      </main>

      {/* History Drawer/Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#EF6B00]" />
                修改历史记录
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                {MOCK_HISTORY.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                      log.action === 'publish' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-900">{log.user}</span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </span>
                      </div>
                      <div className={`text-sm mt-1 p-3 rounded-xl ${
                        log.action === 'publish' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                          : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}>
                        {log.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
