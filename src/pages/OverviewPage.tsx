import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { History, Eye, Edit3, Send, Copy, Plus, FileText, CheckCircle2, MessageSquare, Package, Hammer, Home, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../utils/cn';
import { OrderVersion, QuotationVersion, SettlementVersion, DocumentStatus } from '../types';
import { ROUTES, ORDER_STATUS_CONFIG } from '../utils/constants';
import { tokens } from '../design-tokens';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';
import { getOrderById, updateOrderStatus, Order } from '../utils/orderStorage';
import { formatDateTime } from '../utils/dateUtils';

// 1. Overview Page
export default function OverviewPage({
  versions,
  quotationVersions,
  setQuotationVersions,
  settlementVersions,
  setSettlementVersions,
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
}: {
  versions: OrderVersion[],
  quotationVersions: QuotationVersion[],
  setQuotationVersions: React.Dispatch<React.SetStateAction<QuotationVersion[]>>,
  settlementVersions: SettlementVersion[],
  setSettlementVersions: React.Dispatch<React.SetStateAction<SettlementVersion[]>>,
  onPublishVersion: (id: string) => void,
  onStartReview: (id: string) => void,
  onCompleteReview: (id: string) => void,
  onCreateVersion: () => { id: string, versionNumber: string, isCopy: boolean },
  onUpdateVersion: (version: OrderVersion) => void,
  onPublishQuotation: (id: string) => void,
  onViewQuotation: (id: string) => void,
  onFeedbackQuotation: (id: string, feedback: string) => void,
  onSignQuotation: (id: string) => void,
  onPublishSettlement: (id: string) => void,
  onViewSettlement: (id: string) => void,
  onFeedbackSettlement: (id: string, feedback: string) => void,
  onSignSettlement: (id: string) => void
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const project = location.state?.project || { name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' };
  const initialOrder = location.state?.order || { id: 'o1', orderNumber: 'PSO-OD_LHJCF-001', title: '空间产品安装-家用电器', status: 'S00' };

  const [currentOrder, setCurrentOrder] = useState<Order | any>(initialOrder);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (initialOrder.id) {
      const latest = getOrderById(initialOrder.id);
      if (latest) {
        setCurrentOrder(latest);
      }
    }
  }, [initialOrder.id]);

  const handlePublishScheme = (versionId: string) => {
    onPublishVersion(versionId);
    toast.success('方案已发布给客户');
  };

  const hasDraft = versions.some(v => v.status === 'draft');

  const isTerminalStatus = ['S04', 'S08', 'S11'].includes(currentOrder.status);
  const isS04orS08 = ['S04', 'S08'].includes(currentOrder.status);

  const handleCreateVersion = () => {
    if (isTerminalStatus) return;
    if (hasDraft) {
      toast('温馨提示', {
        description: '检测到您当前有一份尚未发布的草稿。为了保持版本链路清晰，请先完成当前草稿的发布，再开启新的设计篇章。',
        style: {
          background: '#FFF7ED',
          border: '1px solid #FFEDD5',
          color: '#9A3412',
        },
        duration: 5000,
      });
      return;
    }
    const result = onCreateVersion();
    if (result) {
      if (result.isCopy) {
        toast.success(`新方案已创建（内部版本 ${result.versionNumber}）。已自动继承上一版本的所有设计页面及标注。`);
      } else {
        toast.success(`新方案已创建（内部版本 ${result.versionNumber}）。`);
      }
    }
  };

  const handleUpdateName = (version: OrderVersion) => {
    if (tempName.trim() && tempName !== version.name) {
      onUpdateVersion({ ...version, name: tempName.trim() });
      toast.success('方案名称已更新');
    }
    setEditingNameId(null);
  };

  const handleCreateQuotation = () => {
    if (quotationVersions.some(v => v.status === 'draft')) {
      toast.error('已存在待发布的报价单草稿');
      return;
    }
    const newQuotation = {
      id: `q-${Date.now()}`,
      name: `订购报价单 V${quotationVersions.length + 1}.0`,
      createdAt: new Date().toLocaleString(),
      status: 'draft',
      totalPrice: `¥${(Math.random() * 50000 + 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    };
    setQuotationVersions([newQuotation, ...quotationVersions]);
    toast.success('新建报价单成功');
  };

  const handlePublishQuotation = (id: string) => {
    if (currentOrder.status === 'S00' && !versions.some(v => v.status !== 'draft')) {
      toast.error('请先发布方案设计，再发布报价单');
      return;
    }

    setQuotationVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'unread' as DocumentStatus, publishedAt: new Date().toLocaleString() } : v));
    onPublishQuotation(id);

    const publishedCount = quotationVersions.filter(v => v.status !== 'draft').length + 1;

    if (currentOrder.status === 'S00' && publishedCount === 1) {
      const updated = updateOrderStatus(currentOrder.id, 'S01');
      if (updated) {
        setCurrentOrder(updated);
        toast.success('发布成功！订单状态已更新为 S01-意向沟通中');
      }
    } else if (currentOrder.status.startsWith('S02') && publishedCount >= 2) {
      const updated = updateOrderStatus(currentOrder.id, 'S03');
      if (updated) {
        setCurrentOrder(updated);
        toast.success('发布成功！订单状态已更新为 S03-订购确认中');
      }
    } else {
      toast.success('报价单已发布给客户');
    }
  };

  const handleViewQuotationLocal = (id: string) => {
    setQuotationVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'read' as DocumentStatus } : v));
    onViewQuotation(id);
    toast.info('模拟客户已查看报价单');
  };

  const handleFeedbackQuotationLocal = (id: string) => {
    const feedback = "希望调整一下部分产品的品牌";
    setQuotationVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'feedback' as DocumentStatus, feedback, feedbackAt: new Date().toLocaleString() } : v));
    onFeedbackQuotation(id, feedback);
    toast.info('模拟客户已提交反馈');
  };

  const handleSignQuotationLocal = (id: string) => {
    setQuotationVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'signed' as DocumentStatus, signedAt: new Date().toLocaleString() } : v));
    onSignQuotation(id);
    toast.success('模拟客户已完成签字');

    // Handle order status transitions
    if (currentOrder.status === 'S01') {
      const updated = updateOrderStatus(currentOrder.id, 'S02');
      if (updated) {
        setCurrentOrder(updated);
        toast.success('订单状态已更新为 S02-订单深化中');
      }
    } else if (currentOrder.status === 'S03') {
      const updated = updateOrderStatus(currentOrder.id, 'S06-01');
      if (updated) {
        setCurrentOrder(updated);
        toast.success('订单状态已更新为 S06-01-交付设计中');
      }
    }
  };

  const handleCreateSettlement = () => {
    if (settlementVersions.some(v => v.status === 'draft')) {
      toast.error('已存在待确认的结算单草稿');
      return;
    }
    const newSettlement = {
      id: `s-${Date.now()}`,
      name: `完工结算单 V${settlementVersions.length + 1}.0`,
      createdAt: new Date().toLocaleString(),
      status: 'draft',
      totalPrice: `¥${(Math.random() * 50000 + 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    };
    setSettlementVersions([newSettlement, ...settlementVersions]);
    toast.success('新建结算单成功');
  };

  const handlePublishSettlement = (id: string) => {
    setSettlementVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'unread' as DocumentStatus, publishedAt: new Date().toLocaleString() } : v));
    onPublishSettlement(id);
    toast.success('结算单已发布给客户');
  };

  const handleViewSettlementLocal = (id: string) => {
    setSettlementVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'read' as DocumentStatus } : v));
    onViewSettlement(id);
    toast.info('模拟客户已查看结算单');
  };

  const handleFeedbackSettlementLocal = (id: string) => {
    const feedback = "结算金额与预期有出入，请核对";
    setSettlementVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'feedback' as DocumentStatus, feedback, feedbackAt: new Date().toLocaleString() } : v));
    onFeedbackSettlement(id, feedback);
    toast.info('模拟客户已提交反馈');
  };

  const handleSignSettlementLocal = (id: string) => {
    setSettlementVersions(prev => prev.map(v => v.id === id ? { ...v, status: 'signed' as DocumentStatus, signedAt: new Date().toLocaleString() } : v));
    onSignSettlement(id);
    toast.success('模拟客户已完成签字');

    if (currentOrder.status === 'S07') {
      const updated = updateOrderStatus(currentOrder.id, 'S11');
      if (updated) {
        setCurrentOrder(updated);
        toast.success('订单状态已更新为 S11-订单已交付');
      }
    }
  };

  const activeVersion = versions[0]; // The first one is always the active one in our logic
  const historyVersions = versions.slice(1);

  const activeQuotation = quotationVersions[0];
  const historyQuotations = quotationVersions.slice(1);

  const activeSettlement = settlementVersions[0];
  const historySettlements = settlementVersions.slice(1);

  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  const statusInfo = ORDER_STATUS_CONFIG[currentOrder.status as keyof typeof ORDER_STATUS_CONFIG] || ORDER_STATUS_CONFIG['S00'];

  const getDarkerColor = (hex: string) => {
    if (hex.toLowerCase() === '#d0d7d6') return '#5c6362';
    return hex; 
  };

  const textColor = getDarkerColor(statusInfo.color);
  const statusBase = currentOrder.status.split('-')[0];
  const statusNum = parseInt(statusBase.substring(1));
  const isReadOnly = isS04orS08 || currentOrder.status === 'S11';

  const getDocStatusBadge = (status: DocumentStatus) => {
    const baseClass = "px-3 py-1 rounded-[12px] text-[12px] font-[500]";
    switch (status) {
      case 'draft':
        return <span className={cn(baseClass, "bg-slate-100 text-[#6B7280]")}>待发布</span>;
      case 'unread':
        return <span className={cn(baseClass, "bg-blue-100 text-blue-700")}>未查看未签字</span>;
      case 'read':
        return <span className={cn(baseClass, "bg-emerald-100 text-emerald-700")}>已查看未签字</span>;
      case 'feedback':
        return <span className={cn(baseClass, "bg-orange-100 text-orange-700")}>已查看已反馈</span>;
      case 'signed':
        return <span className={cn(baseClass, "bg-emerald-100 text-emerald-700")}>已查看已签字</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string, isHistory: boolean = false) => {
    const baseClass = "px-3 py-1 rounded-[12px] text-[12px] font-[500]";
    const historyClass = "bg-slate-100 text-[#6B7280]";
    
    if (isHistory) {
      let label = '';
      switch (status) {
        case 'draft': label = '草稿版本'; break;
        case 'published_unread': label = '已发布(未读)'; break;
        case 'reviewing': label = '客户审阅中'; break;
        case 'reviewed': label = '客户已完成审阅'; break;
        case 'historical': label = '历史版本'; break;
        case 'archived': label = '历史存档'; break;
        default: label = status;
      }
      return <span className={cn(baseClass, historyClass)}>{label}</span>;
    }

    switch (status) {
      case 'draft':
        return <span className={cn(baseClass, "bg-slate-100 text-[#6B7280]")}>草稿版本</span>;
      case 'published_unread':
        return <span className={cn(baseClass, "bg-emerald-100 text-emerald-700")}>已发布(未读)</span>;
      case 'reviewing':
        return <span className={cn(baseClass, "bg-blue-100 text-blue-700")}>客户审阅中</span>;
      case 'reviewed':
        return <span className={cn(baseClass, "bg-emerald-100 text-emerald-700")}>客户已完成审阅</span>;
      case 'historical':
        return <span className={cn(baseClass, "bg-slate-100 text-[#6B7280]")}>历史版本</span>;
      case 'archived':
        return <span className={cn(baseClass, "bg-red-100 text-red-700")}>历史存档</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        projectName={project.name}
        orderNumber={currentOrder.orderNumber}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onOrderClick={() => navigate(ROUTES.ORDERS, { state: { project } })}
        onLogout={handleLogout}
      />

      <div className="max-w-5xl mx-auto py-24">
        <div className="mb-[96px] flex justify-between items-center">
          <div>
            <button 
              onClick={() => navigate(ROUTES.ORDERS, { state: { project } })}
              className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF6B00] transition-colors mb-6 font-medium"
              title="返回订单列表"
            >
              <ArrowLeft className="w-4 h-4" /> 返回项目销售订单
            </button>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-[48px] font-[900] text-[#0A0A0A] leading-tight" style={{ fontWeight: tokens.fontWeight.h1 }}>方案管理中心</h1>
              <span 
                className="px-4 py-1.5 rounded-full text-[14px] font-bold border"
                style={{ 
                  backgroundColor: `${statusInfo.color}15`, 
                  color: textColor,
                  borderColor: `${statusInfo.color}40`
                }}
                title={`当前订单状态: ${statusInfo.label}`}
              >
                {statusInfo.label}
              </span>
            </div>
            <p className="text-[#6B7280] text-[20px] font-mono tracking-wider">{currentOrder.orderNumber}</p>
          </div>
          {!isTerminalStatus && (
            <button
              onClick={handleCreateVersion}
              className={cn(
                "px-8 py-4 rounded-[16px] text-[16px] font-[700] transition-all flex items-center gap-2 shadow-sm",
                hasDraft 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-[#EF6B00] text-white hover:bg-[#CC5B00]"
              )}
              style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
              title={hasDraft ? "当前已有草稿，请先发布" : "基于最新版本创建新方案"}
            >
              <Plus className="w-4 h-4" /> 新建方案
            </button>
          )}
        </div>

        {/* --- SECTION 1: SCHEME MANAGEMENT --- */}
        <section className="mb-[96px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
            <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>方案设计管理</h2>
          </div>

          {/* Active Version */}
          {activeVersion && (
            <div className="mb-8">
              <div className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 relative overflow-hidden" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
                <div className="absolute top-0 right-0 bg-[#EF6B00] text-white px-4 py-1 rounded-bl-[16px] text-[12px] font-[700] tracking-wider flex items-center gap-2">
                  当前版本
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-3 mb-1">
                      {editingNameId === activeVersion.id ? (
                        <input
                          autoFocus
                          className="text-[30px] font-[900] text-[#0A0A0A] border-b-2 border-[#EF6B00] outline-none bg-transparent w-full"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onBlur={() => handleUpdateName(activeVersion)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateName(activeVersion)}
                        />
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <h3 className="text-[30px] font-[900] text-[#0A0A0A]">{activeVersion.name}</h3>
                          {activeVersion.status === 'draft' && !isReadOnly && (
                            <button 
                              onClick={() => {
                                setEditingNameId(activeVersion.id);
                                setTempName(activeVersion.name);
                              }}
                              className="p-2 text-[#6B7280] opacity-0 group-hover:opacity-100 hover:text-[#EF6B00] transition-all"
                              title="重命名方案"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                      {getStatusBadge(activeVersion.status)}
                    </div>
                    <p className="text-[#EF6B00] text-[16px] font-bold mb-2">内部版本 {activeVersion.versionNumber}</p>
                    <p className="text-[#6B7280] text-[16px]">最后更新: {formatDateTime(activeVersion.createdAt)} · 包含 {activeVersion.pages.length} 个页面</p>
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex gap-3">
                      {activeVersion.status === 'draft' && !isReadOnly ? (
                        <button
                          onClick={() => navigate(`/editor/${activeVersion.id}`, { state: { project, order: currentOrder } })}
                          className="px-8 py-4 bg-[#EF6B00] text-white rounded-[16px] text-[16px] font-[700] hover:bg-[#CC5B00] transition-colors flex items-center gap-2 shadow-sm"
                          style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
                          title="进入编辑器修改方案"
                        >
                          <Edit3 className="w-4 h-4" /> 进入编辑
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/editor/${activeVersion.id}`, { state: { project, order: currentOrder } })}
                          className="px-8 py-4 bg-slate-800 text-white rounded-[16px] text-[16px] font-[700] hover:bg-slate-900 transition-colors flex items-center gap-2 shadow-sm"
                          style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
                          title="查看方案详情（已发布不可编辑）"
                        >
                          <Eye className="w-4 h-4" /> 查看方案
                        </button>
                      )}
                      
                      {activeVersion.status === 'draft' && !isReadOnly && (
                        <button
                          onClick={() => handlePublishScheme(activeVersion.id)}
                          className="px-6 py-4 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[16px] text-[16px] font-[700] hover:bg-slate-50 transition-colors flex items-center gap-2"
                          style={{ borderRadius: tokens.borderRadius.button, fontWeight: tokens.fontWeight.button }}
                          title="将方案发布给客户审阅"
                        >
                          <Send className="w-4 h-4" /> 发布给客户
                        </button>
                      )}
                    </div>
                    
                    {/* Simulation Buttons */}
                    <div className="flex gap-2">
                      {activeVersion.status === 'published_unread' && (
                        <button
                          onClick={() => onStartReview(activeVersion.id)}
                          className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-[12px] text-[12px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                          title="模拟客户点击开始审阅"
                        >
                          开始审阅 (模拟)
                        </button>
                      )}
                      {activeVersion.status === 'reviewing' && (
                        <button
                          onClick={() => onCompleteReview(activeVersion.id)}
                          className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-[12px] text-[12px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          title="模拟客户点击审阅完成"
                        >
                          审阅完成 (模拟)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {activeVersion.pages.map((page, idx) => (
                    <div key={page.pageId} className="w-48 flex-shrink-0 group">
                      <div className="aspect-[4/3] bg-slate-100 rounded-[12px] overflow-hidden border border-[#E5E7EB] mb-2 relative" style={{ borderRadius: tokens.borderRadius.sm }}>
                        {page.imageUrl ? (
                          <img src={page.imageUrl} className="w-full h-full object-cover" alt={page.title} referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                            <Plus className="w-6 h-6" />
                          </div>
                        )}
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
            {historyVersions.length > 0 ? historyVersions.map(version => (
              <div key={version.id} className="bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-[#E5E7EB] p-6 flex items-center justify-between hover:border-[#EF6B00]/30 transition-colors" style={{ borderRadius: tokens.borderRadius.card, boxShadow: tokens.shadows.card }}>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-[16px] font-[900] text-[#0A0A0A]">{version.name}</h3>
                      <span className="text-[#6B7280] text-[14px] font-mono">内部版本 {version.versionNumber}</span>
                      {getStatusBadge(version.status, true)}
                    </div>
                    <p className="text-[#6B7280] text-[16px]">{formatDateTime(version.createdAt)} · {version.pages.length} Pages</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => navigate(`/editor/${version.id}`, { state: { project, order: currentOrder } })}
                    className="p-3 text-[#6B7280] hover:text-[#EF6B00] hover:bg-[#EF6B00]/5 rounded-[12px] transition-colors"
                    title="查看此历史版本详情"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center bg-slate-50 rounded-[24px] border-2 border-dashed border-slate-200">
                <p className="text-[#6B7280]">暂无历史版本</p>
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION 2: ORDER QUOTATION --- */}
        <section className="mb-[96px]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
              <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>订购报价管理</h2>
            </div>
            {!isS04orS08 && (
              <button
                onClick={handleCreateQuotation}
                className="px-6 py-3 bg-white text-[#EF6B00] border border-[#EF6B00] rounded-[16px] text-[14px] font-[700] hover:bg-[#EF6B00]/5 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                style={{ borderRadius: tokens.borderRadius.button }}
              >
                <Plus className="w-4 h-4" /> 新建报价单
              </button>
            )}
          </div>

          {activeQuotation ? (
            <div className="mb-8">
              <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E5E7EB] p-10 flex items-center justify-between relative overflow-hidden group hover:border-[#EF6B00]/20 transition-all" style={{ borderRadius: tokens.borderRadius.card }}>
                <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-[20px] text-[12px] font-[800] tracking-widest uppercase bg-[#EF6B00] text-white">
                  当前版本
                </div>
                <div className="flex items-center gap-8">
                  <div className="bg-[#EF6B00] p-5 rounded-[24px] shadow-xl shadow-[#EF6B00]/30 transform group-hover:scale-105 transition-transform">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[32px] font-[900] text-[#0A0A0A] mb-2">{activeQuotation.name}</h3>
                    <div className="flex items-center gap-3">
                      {getDocStatusBadge(activeQuotation.status)}
                      <p className="text-[#6B7280] text-[16px] font-medium">
                        总额: <span className="text-[#0A0A0A] font-bold">{activeQuotation.totalPrice}</span> · 基于最新正式方案生成
                      </p>
                    </div>
                    
                    {/* Simulation Buttons for Active Quotation */}
                    <div className="flex gap-2 mt-4">
                      {activeQuotation.status === 'unread' && (
                        <button
                          onClick={() => handleViewQuotationLocal(activeQuotation.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-[12px] text-[12px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          模拟客户查看
                        </button>
                      )}
                      {activeQuotation.status === 'read' && (
                        <>
                          <button
                            onClick={() => handleSignQuotationLocal(activeQuotation.id)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-[12px] text-[12px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          >
                            模拟客户签字
                          </button>
                          <button
                            onClick={() => handleFeedbackQuotationLocal(activeQuotation.id)}
                            className="px-4 py-2 bg-orange-50 text-orange-700 rounded-[12px] text-[12px] font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                          >
                            模拟客户反馈
                          </button>
                        </>
                      )}
                      {activeQuotation.status === 'feedback' && (
                        <div className="text-[14px] text-orange-600 bg-orange-50 px-4 py-2 rounded-[12px] border border-orange-100 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          已收到客户反馈
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-4">
                      <button
                        onClick={() => navigate(ROUTES.QUOTATION, { state: { project, order: currentOrder, quotation: activeQuotation } })}
                        className="px-10 py-5 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[20px] text-[18px] font-[700] hover:bg-slate-50 transition-all flex items-center gap-3 shadow-md hover:shadow-lg active:scale-95"
                        style={{ borderRadius: tokens.borderRadius.button }}
                      >
                        <Eye className="w-5 h-5" /> {activeQuotation.status === 'draft' ? '预览报价单' : '查看报价单'}
                      </button>
                      {activeQuotation.status === 'draft' && !isReadOnly && (
                        <button
                          onClick={() => handlePublishQuotation(activeQuotation.id)}
                          className="px-10 py-5 bg-[#EF6B00] text-white rounded-[20px] text-[18px] font-[700] transition-all flex items-center gap-3 shadow-md hover:shadow-xl active:scale-95"
                          style={{ borderRadius: tokens.borderRadius.button }}
                        >
                          <Send className="w-5 h-5" /> 发布给客户
                        </button>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center mb-8">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-6 opacity-50" />
              <p className="text-slate-500 text-[18px] font-medium">暂无待发布的报价单，请点击上方按钮新建</p>
            </div>
          )}

          {/* History Quotations */}
          {historyQuotations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-[#6B7280]" />
                <span className="text-[18px] font-bold text-[#6B7280]">历史与已发布版本</span>
              </div>
              {historyQuotations.map(q => (
                <div key={q.id} className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] p-8 flex items-center justify-between hover:border-[#EF6B00]/30 hover:shadow-md transition-all group" style={{ borderRadius: tokens.borderRadius.card }}>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-[20px] font-[900] text-[#0A0A0A]">{q.name}</h3>
                        {getDocStatusBadge(q.status)}
                      </div>
                      <p className="text-[#6B7280] text-[16px] font-medium">{formatDateTime(q.createdAt)} · 总额: <span className="text-[#0A0A0A] font-bold">{q.totalPrice}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.QUOTATION, { state: { project, order: currentOrder, quotation: q } })}
                    className="p-4 text-[#6B7280] hover:text-[#EF6B00] hover:bg-[#EF6B00]/5 rounded-[16px] transition-all group-hover:scale-110"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECTION 3: COMPLETION SETTLEMENT --- */}
        <section className={cn("mb-[96px]", statusNum < 7 && "opacity-50 grayscale pointer-events-none select-none")}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#EF6B00] rounded-full"></div>
              <h2 className="text-[30px] font-[900] text-[#0A0A0A]" style={{ fontWeight: tokens.fontWeight.sectionTitle }}>
                完工结算管理 {statusNum < 7 && <span className="text-[14px] font-normal text-slate-400 ml-2">(订单进入验收阶段后开启)</span>}
              </h2>
            </div>
            {!isS04orS08 && statusNum >= 7 && (
              <button
                onClick={handleCreateSettlement}
                className="px-6 py-3 bg-white text-[#EF6B00] border border-[#EF6B00] rounded-[16px] text-[14px] font-[700] hover:bg-[#EF6B00]/5 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                style={{ borderRadius: tokens.borderRadius.button }}
              >
                <Plus className="w-4 h-4" /> 新建结算单
              </button>
            )}
          </div>

          {activeSettlement ? (
            <div className="mb-8">
              <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E5E7EB] p-10 flex items-center justify-between relative overflow-hidden group hover:border-[#EF6B00]/20 transition-all" style={{ borderRadius: tokens.borderRadius.card }}>
                <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-[20px] text-[12px] font-[800] tracking-widest uppercase bg-[#EF6B00] text-white">
                  当前版本
                </div>
                <div className="flex items-center gap-8">
                  <div className="bg-slate-800 p-5 rounded-[24px] shadow-xl transform group-hover:scale-105 transition-transform">
                    <Hammer className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[32px] font-[900] text-[#0A0A0A] mb-2">{activeSettlement.name}</h3>
                    <div className="flex items-center gap-3">
                      {getDocStatusBadge(activeSettlement.status)}
                      <p className="text-[#6B7280] text-[16px] font-medium">
                        总额: <span className="text-[#0A0A0A] font-bold">{activeSettlement.totalPrice}</span> · 项目已进入验收阶段
                      </p>
                    </div>

                    {/* Simulation Buttons for Active Settlement */}
                    <div className="flex gap-2 mt-4">
                      {activeSettlement.status === 'unread' && (
                        <button
                          onClick={() => handleViewSettlementLocal(activeSettlement.id)}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-[12px] text-[12px] font-bold border border-blue-100 hover:bg-blue-100 transition-colors"
                        >
                          模拟客户查看
                        </button>
                      )}
                      {activeSettlement.status === 'read' && (
                        <>
                          <button
                            onClick={() => handleSignSettlementLocal(activeSettlement.id)}
                            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-[12px] text-[12px] font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          >
                            模拟客户签字
                          </button>
                          <button
                            onClick={() => handleFeedbackSettlementLocal(activeSettlement.id)}
                            className="px-4 py-2 bg-orange-50 text-orange-700 rounded-[12px] text-[12px] font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                          >
                            模拟客户反馈
                          </button>
                        </>
                      )}
                      {activeSettlement.status === 'feedback' && (
                        <div className="text-[14px] text-orange-600 bg-orange-50 px-4 py-2 rounded-[12px] border border-orange-100 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          已收到客户反馈
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(ROUTES.SETTLEMENT, { state: { project, order: currentOrder, settlement: activeSettlement } })}
                    className="px-10 py-5 bg-white text-[#0A0A0A] border border-[#E5E7EB] rounded-[20px] text-[18px] font-[700] hover:bg-slate-50 transition-all flex items-center gap-3 shadow-md hover:shadow-lg active:scale-95"
                    style={{ borderRadius: tokens.borderRadius.button }}
                  >
                    <Eye className="w-5 h-5" /> {activeSettlement.status === 'draft' ? '预览结算单' : '查看结算单'}
                  </button>
                  {activeSettlement.status === 'draft' && statusNum >= 7 && (
                    <button
                      onClick={() => handlePublishSettlement(activeSettlement.id)}
                      className="px-10 py-5 bg-[#EF6B00] text-white rounded-[20px] text-[18px] font-[700] hover:bg-[#CC5B00] transition-all flex items-center gap-3 shadow-md hover:shadow-xl active:scale-95"
                      style={{ borderRadius: tokens.borderRadius.button }}
                    >
                      <Send className="w-5 h-5" /> 发布给客户
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-16 text-center mb-8">
              <Hammer className="w-16 h-16 text-slate-300 mx-auto mb-6 opacity-50" />
              <p className="text-slate-500 text-[18px] font-medium">
                {statusNum < 7 ? "结算功能尚未开启" : "暂无待确认的结算单，请点击上方按钮新建"}
              </p>
            </div>
          )}

          {/* History Settlements */}
          {historySettlements.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-[#6B7280]" />
                <span className="text-[18px] font-bold text-[#6B7280]">历史与已发布版本</span>
              </div>
              {historySettlements.map(s => (
                <div key={s.id} className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] p-8 flex items-center justify-between hover:border-[#EF6B00]/30 hover:shadow-md transition-all group" style={{ borderRadius: tokens.borderRadius.card }}>
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-[20px] font-[900] text-[#0A0A0A]">{s.name}</h3>
                        {getDocStatusBadge(s.status)}
                      </div>
                      <p className="text-[#6B7280] text-[16px] font-medium">{formatDateTime(s.createdAt)} · 总额: <span className="text-[#0A0A0A] font-bold">{s.totalPrice}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.SETTLEMENT, { state: { project, order: currentOrder, settlement: s } })}
                    className="p-4 text-[#6B7280] hover:text-[#EF6B00] hover:bg-[#EF6B00]/5 rounded-[16px] transition-all group-hover:scale-110"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
