import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Eye, Edit3, Send, Copy, Plus, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { OrderVersion } from '../../types';
import { ROUTES } from '../../utils/constants';

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
    <div className="min-h-screen bg-white px-6 py-24 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-[96px] flex justify-between items-center">
          <div>
            <h1 className="text-[48px] font-[900] text-[#0A0A0A] mb-2 leading-tight">方案管理中心</h1>
            <p className="text-[#6B7280] text-[16px]">管理当前订单的所有交付版本</p>
          </div>
          <button
            onClick={onCreateVersion}
            className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新建方案
          </button>
        </div>

        {/* Draft Version */}
        {draftVersion && (
          <div className="mb-[96px]">
            <h2 className="text-[30px] font-[900] text-[#0A0A0A] mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF6B00]"></span> 当前工作版本
            </h2>
            <div className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#EF6B00]/10 text-[#EF6B00] px-4 py-1 rounded-bl-[16px] text-[12px] font-[700] tracking-wider">
                草稿 DRAFT
              </div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[30px] font-[900] text-[#0A0A0A] mb-2">{draftVersion.name}</h3>
                  <p className="text-[#6B7280] text-[16px]">最后更新: {draftVersion.createdAt} · 包含 {draftVersion.pages.length} 个页面</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => navigate(`/editor/${draftVersion.id}`)}
                    className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> 进入编辑
                  </button>
                  <button
                    onClick={() => onPublishVersion(draftVersion.id)}
                    className="px-6 py-4 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> 发布给客户
                  </button>
                </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {draftVersion.pages.map((page, idx) => (
                  <div key={page.pageId} className="w-48 flex-shrink-0 group">
                    <div className="aspect-[4/3] bg-slate-100 rounded-[12px] overflow-hidden border border-[#E5E7EB] mb-2 relative">
                      <img src={page.imageUrl} className="w-full h-full object-cover" alt={page.title} referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <p className="text-[12px] font-[500] text-[#6B7280] truncate">P{idx + 1} - {page.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* History Versions */}
        <div>
          <h2 className="text-[30px] font-[900] text-[#0A0A0A] mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-[#6B7280]" /> 历史与已发布版本
          </h2>
          <div className="space-y-4">
            {otherVersions.map(version => (
              <div key={version.id} className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 flex items-center justify-between hover:border-[#EF6B00]/30 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[16px] font-[900] text-[#0A0A0A]">{version.name}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-[12px] text-[12px] font-[500]",
                        version.status === 'published' ? "bg-emerald-100 text-emerald-700" :
                          version.status === 'completed' ? "bg-blue-100 text-blue-700" :
                            version.status === 'archived' ? "bg-red-100 text-red-700" :
                              "bg-slate-100 text-[#6B7280]"
                      )}>
                        {version.status === 'published' ? '正式版 (客户可见)' :
                          version.status === 'completed' ? '已完成' :
                            version.status === 'archived' ? '已归档' :
                              '历史版'}
                      </span>
                    </div>
                    <p className="text-[#6B7280] text-[16px]">{version.createdAt} · {version.pages.length} Pages</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  {version.status === 'published' && (
                    <button
                      onClick={() => navigate(ROUTES.QUOTATION)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-[12px] text-[14px] font-[700] hover:bg-emerald-100 transition-colors mr-2"
                    >
                      <FileText className="w-4 h-4" /> 查看结算单
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/editor/${version.id}`)}
                    className="p-3 text-[#6B7280] hover:text-[#EF6B00] hover:bg-[#EF6B00]/5 rounded-[12px] transition-colors"
                    title="查看此版本详情"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onCopyVersion(version.id)}
                    className="p-3 text-[#6B7280] hover:text-[#EF6B00] hover:bg-[#EF6B00]/5 rounded-[12px] transition-colors"
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
