import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES, ORDER_STATUS_CONFIG } from '../utils/constants';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';
import { getOrders, Order } from '../utils/orderStorage';
import { getOrderStatusColor } from '../utils/orderStatus';
import BudgetSankeyWorkbench from '../components/BudgetSankeyWorkbench';
import { buildBudgetSankeyFromDisplayOrders, type DisplayOrder } from '../utils/ordersToBudgetSankey';

export type ViewMode = 'sankey' | 'list';

const PHASE_OPTIONS = ['意向期', '订购期', '交付期', '验收期', '维保期'] as const;
type PhaseOption = (typeof PHASE_OPTIONS)[number];

const PHASE_TO_STATUS: Record<string, PhaseOption> = {
  intention: '意向期',
  ordering: '订购期',
  delivery: '交付期',
  acceptance: '验收期',
  maintenance: '维保期',
  red: '验收期',
  gray: '意向期',
};

function getOrderPhase(order: Order): PhaseOption {
  const color = getOrderStatusColor(order.status);
  return PHASE_TO_STATUS[color] ?? '意向期';
}

export default function OrderSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' };
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhases, setSelectedPhases] = useState<PhaseOption[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const baseFilteredOrders = useMemo(() => 
    orders.filter(order => 
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [orders, searchQuery]
  );

  const listFilteredOrders = useMemo(() => {
    if (selectedPhases.length === 0) return baseFilteredOrders;
    return baseFilteredOrders.filter(order => selectedPhases.includes(getOrderPhase(order)));
  }, [baseFilteredOrders, selectedPhases]);

  const displayOrders: DisplayOrder[] = useMemo(() => 
    baseFilteredOrders.map(o => ({
      id: o.id,
      title: o.title,
      status: ORDER_STATUS_CONFIG[o.status as keyof typeof ORDER_STATUS_CONFIG]?.label ?? o.status,
      date: undefined,
      amount: o.price,
    })),
    [baseFilteredOrders]
  );

  const sankeyData = useMemo(
    () => buildBudgetSankeyFromDisplayOrders(displayOrders),
    [displayOrders]
  );

  const togglePhase = (phase: PhaseOption) => {
    setSelectedPhases(prev => 
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        projectName={project.name}
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onProjectClick={() => navigate(ROUTES.PROJECTS)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button 
            onClick={() => navigate(ROUTES.PROJECTS)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF6B00] transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回项目选择
          </button>
          <h1 className="text-[30px] font-black text-[#0A0A0A] mb-8" style={{ fontFamily: tokens.fonts.title }}>
            项目销售订单
          </h1>

          {/* Tab Navigation */}
          <nav className="flex gap-6 border-b border-[#E5E7EB] mb-6">
            <button
              type="button"
              onClick={() => setViewMode('sankey')}
              className={`pb-3 font-semibold text-[14px] transition-colors border-b-2 -mb-px ${
                viewMode === 'sankey'
                  ? 'text-[#0A0A0A] border-[#0A0A0A]'
                  : 'text-[#9CA3AF] border-transparent hover:text-[#6B7280]'
              }`}
            >
              预算树（桑基图）
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`pb-3 font-semibold text-[14px] transition-colors border-b-2 -mb-px ${
                viewMode === 'list'
                  ? 'text-[#0A0A0A] border-[#0A0A0A]'
                  : 'text-[#9CA3AF] border-transparent hover:text-[#6B7280]'
              }`}
            >
              订单列表
            </button>
          </nav>

          {viewMode === 'sankey' ? (
            /* Sankey View: only show budget tree card */
            sankeyData ? (
              <div>
                <BudgetSankeyWorkbench
                  data={sankeyData}
                  title="订单预算树"
                  subtitle={`共 ${baseFilteredOrders.length} 笔订单`}
                />
              </div>
            ) : (
              <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-12 text-center">
                <p className="text-[#6B7280]">暂无订单数据，无法生成预算树</p>
              </div>
            )
          ) : (
            /* List View: search + phase filter + order list */
            <>
              <div className="space-y-4 mb-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-[#6B7280] group-focus-within:text-[#EF6B00] transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="搜索订单标题、订单编号"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#E5E7EB] rounded-[16px] py-5 pl-14 pr-6 text-[16px] outline-none focus:border-[#EF6B00] focus:ring-4 focus:ring-[#EF6B00]/5 transition-all shadow-sm"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] text-[#6B7280] font-medium">阶段筛选:</span>
                  {PHASE_OPTIONS.map(phase => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => togglePhase(phase)}
                      className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                        selectedPhases.includes(phase)
                          ? 'bg-[#EF6B00] text-white'
                          : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
          {listFilteredOrders.length > 0 ? (
            listFilteredOrders.map((order) => {
              const statusInfo = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG] ?? { label: order.status, color: '#94A3B8' };
              
              // Helper to get a darker version of the color for text
              const getDarkerColor = (hex: string) => {
                if (hex.toLowerCase() === '#d0d7d6') return '#5c6362';
                // For other colors, we can also darken them slightly for better contrast
                return hex; 
              };

              const textColor = getDarkerColor(statusInfo.color);

              return (
                <button
                  key={order.id}
                  onClick={() => navigate(ROUTES.OVERVIEW, { state: { order, project } })}
                  className="w-full bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#EF6B00]/30 transition-all text-left group overflow-hidden"
                >
                  <div className="p-6 flex items-center justify-between w-full">
                    <div className="flex items-center gap-6">
                      {/* Status Color Bar - Inset and Rounded */}
                      <div 
                        className="w-1.5 h-12 rounded-full shrink-0" 
                        style={{ backgroundColor: statusInfo.color }}
                      />
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center">
                          <span 
                            className="px-3 py-1 rounded-lg text-[12px] font-bold border"
                            style={{ 
                              backgroundColor: `${statusInfo.color}15`, 
                              color: textColor,
                              borderColor: `${statusInfo.color}40`
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[18px] font-bold text-[#0A0A0A]">
                            {order.orderNumber}
                          </span>
                          <span className="text-[18px] text-[#0A0A0A] opacity-40">·</span>
                          <span className="text-[18px] font-bold text-[#0A0A0A]">
                            {order.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-[20px] font-black text-[#0A0A0A]">
                        {order.price}
                      </span>
                      <ChevronRight className="w-6 h-6 text-[#E5E7EB] group-hover:text-[#EF6B00] transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-12 text-center">
              <p className="text-[#6B7280]">没有找到匹配的订单</p>
            </div>
          )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
