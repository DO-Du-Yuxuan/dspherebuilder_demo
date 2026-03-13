import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, Edit3, Send, Copy, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { OrderVersion } from '../../types';

// 1. Overview Page
export default function OverviewPage({
  versions,
  onPublishVersion,
  onCopyVersion,
  onCreateVersion
}: {
  versions: OrderVersion[],
  onPublishVersion: (id: string) => void,
  onCopyVersion: (id: string) => void,
  onCreateVersion: () => void
}) {
  const navigate = useNavigate();
  const draftVersion = versions.find(v => v.status === 'draft');
  const otherVersions = versions.filter(v => v.status !== 'draft');

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">方案管理中心</h1>
            <p className="text-slate-500">管理当前订单的所有交付版本</p>
          </div>
          <button
            onClick={onCreateVersion}
            className="px-6 py-3 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建方案
          </button>
        </div>

        {/* Draft Version */}
        {draftVersion && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 当前工作版本
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 px-4 py-1 rounded-bl-xl text-xs font-bold tracking-wider">
                草稿 DRAFT
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{draftVersion.name}</h3>
                  <p className="text-slate-500 text-sm">最后更新: {draftVersion.createdAt} · 包含 {draftVersion.pages.length} 个页面</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => navigate(`/editor/${draftVersion.id}`)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> 进入编辑
                  </button>
                  <button
                    onClick={() => onPublishVersion(draftVersion.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> 发布给客户
                  </button>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {draftVersion.pages.map((page, idx) => (
                  <div key={page.pageId} className="w-48 flex-shrink-0 group">
                    <div className="aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2 relative">
                      <img src={page.imageUrl} className="w-full h-full object-cover" alt={page.title} referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-slate-700 truncate">P{idx + 1} - {page.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Versions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> 历史与已发布版本
          </h2>
          <div className="space-y-4">
            {otherVersions.map(version => (
              <div key={version.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{version.name}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        version.status === 'published' ? "bg-emerald-100 text-emerald-700" :
                          version.status === 'completed' ? "bg-blue-100 text-blue-700" :
                            version.status === 'archived' ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-slate-600"
                      )}>
                        {version.status === 'published' ? '正式版 (客户可见)' :
                          version.status === 'completed' ? '已完成' :
                            version.status === 'archived' ? '已归档' :
                              '历史版'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm">{version.createdAt} · {version.pages.length} Pages</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/editor/${version.id}`)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="查看此版本详情"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onCopyVersion(version.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="复制为新版本"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
