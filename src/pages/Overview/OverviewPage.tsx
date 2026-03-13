import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { History, Eye, Edit3, Send, Copy, Plus, FileText, CheckCircle2, MessageSquare, Package, Hammer, Home, ArrowLeftRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { OrderVersion } from '../../types';
import { ROUTES } from '../../utils/constants';
import { tokens } from '../../design-tokens';
import { Header } from '../../components/Header';
import { getCurrentUser, logout } from '../../utils/authUtils';

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
  const location = useLocation();
  
  const project = location.state?.project || { name: '静安·云境公寓 (示例项目)', code: 'PRJT_R-070-A-00001' };
  const order = location.state?.order || { orderNumber: 'PSO-OD_LHJCF-00471', title: '瓷砖铺贴-公卫、次卫、厨房墙地铺贴' };

  const draftVersion = versions.find(v => v.status === 'draft');
  const otherVersions = versions.filter(v => v.status !== 'draft');
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        projectName={project.name}
        orderNumber={order.orderNumber}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onLogout={handleLogout}
      />

      <div className="max-w-5xl mx-auto py-24">
        <div className="mb-[96px] flex justify-between items-center">
          <div>
            <h1 className="text-[48px] font-[900] text-[#0A0A0A] mb-2 leading-tight" style={{ fontWeight: tokens.fontWeight.h1 }}>方案管理中心</h1>
            <p className="text-[#6B7280] text-[16px]">管理当前订单的所有交付版本</p>
          </div>
          <button
            onClick={onCreateVersion}
            className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
            style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
          >
            <Plus className="w-4 h-4" /> 新建方案
          </button>
        </div>

        {/* --- SECTION 1: SCHEME MANAGEMENT --- */}
        <section className="mb-[96px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
            <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>方案交付管理</h2>
          </div>

          {/* Draft Version */}
          {draftVersion && (
            <div className="mb-8">
              <div className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 relative overflow-hidden" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
                <div className="absolute top-0 right-0 bg-[#EF6B00]/10 text-[#EF6B00] px-4 py-1 rounded-bl-[16px] text-[12px] font-[700] tracking-wider">
                  当前工作版本 DRAFT
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
                      style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
                    >
                      <Edit3 className="w-4 h-4" /> 进入编辑
                    </button>
                    <button
                      onClick={() => onPublishVersion(draftVersion.id)}
                      className="px-6 py-4 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] hover:bg-slate-50 transition-colors flex items-center gap-2"
                      style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
                    >
                      <Send className="w-4 h-4" /> 发布给客户
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {draftVersion.pages.map((page, idx) => (
                    <div key={page.pageId} className="w-48 flex-shrink-0 group">
                      <div className="aspect-[4/3] bg-slate-100 rounded-[12px] overflow-hidden border border-[#E5E7EB] mb-2 relative" style={{ borderRadius: tokens.borderRadius.sm }}>
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-[#6B7280]" />
              <span className="text-[16px] font-bold text-[#6B7280]">历史与已发布版本</span>
            </div>
            {otherVersions.map(version => (
              <div key={version.id} className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 flex items-center justify-between hover:border-[#EF6B00]/30 transition-colors" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
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
        </section>

        {/* --- SECTION 2: ORDER QUOTATION --- */}
        <section className="mb-[96px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
            <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>订购报价管理</h2>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-8 flex items-center justify-between" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
            <div className="flex items-center gap-6">
              <div className="bg-[#EF6B00] p-4 rounded-[20px] shadow-lg shadow-[#EF6B00]/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-[24px] font-[900] text-[#0A0A0A] mb-1">订购报价单</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-[#EF6B00] rounded-full text-[12px] font-bold">待发布</span>
                  <p className="text-[#6B7280] text-[14px]">基于最新正式方案生成 · 包含设计、产品、施工明细</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(ROUTES.QUOTATION)}
                className="px-8 py-4 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
              >
                <Eye className="w-4 h-4" /> 预览报价单
              </button>
              <button
                className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
                style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
              >
                <Send className="w-4 h-4" /> 发布给客户
              </button>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: COMPLETION SETTLEMENT --- */}
        <section className="mb-[96px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
            <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>完工结算管理</h2>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-8 flex items-center justify-between opacity-60 grayscale-[0.5]" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
            <div className="flex items-center gap-6">
              <div className="bg-slate-800 p-4 rounded-[20px] shadow-lg">
                <Hammer className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-[24px] font-[900] text-[#0A0A0A] mb-1">完工结算单</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[12px] font-bold">开发中</span>
                  <p className="text-[#6B7280] text-[14px]">项目完工后生成 · 最终实测实量结算明细</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(ROUTES.SETTLEMENT)}
                className="px-8 py-4 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
              >
                <Eye className="w-4 h-4" /> 预览结算单
              </button>
              <button
                className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
                style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
              >
                <Send className="w-4 h-4" /> 发布给客户
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
