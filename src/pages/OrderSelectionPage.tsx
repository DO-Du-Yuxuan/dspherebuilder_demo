import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES, ORDER_STATUS_CONFIG } from '../utils/constants';
import { Search, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';

const MOCK_ORDERS = [
  {
    id: 'o1',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-001',
    title: '空间产品安装-家用电器',
    status: 'S00',
    price: '¥24,500',
  },
  {
    id: 'o2',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-002',
    title: '空间产品安装-移动家具',
    status: 'S01',
    price: '¥45,800',
  },
  {
    id: 'o3',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-003',
    title: '空间产品安装-软装摆件',
    status: 'S02',
    price: '¥12,000',
  },
  {
    id: 'o4',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-004',
    title: '空间产品安装-全屋床垫',
    status: 'S03',
    price: '¥18,900',
  },
  {
    id: 'o5',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-005',
    title: '空间产品安装-全屋窗帘',
    status: 'S04',
    price: '¥8,600',
  },
  {
    id: 'o6',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-006',
    title: '空间产品安装-木地板',
    status: 'S05',
    price: '¥32,000',
  },
  {
    id: 'o7',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-007',
    title: '全屋系统安装-卫浴产品安装',
    status: 'S06',
    price: '¥28,400',
  },
  {
    id: 'o8',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-008',
    title: '全屋系统安装-照明系统安装',
    status: 'S07',
    price: '¥15,200',
  },
  {
    id: 'o9',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-009',
    title: '全屋系统安装-智能系统安装',
    status: 'S08',
    price: '¥56,000',
  },
  {
    id: 'o10',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-010',
    title: '全屋系统安装-空调挂机系统安装',
    status: 'S09',
    price: '¥19,800',
  },
  {
    id: 'o11',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-011',
    title: '全屋系统安装-新风净化系统',
    status: 'S10',
    price: '¥22,000',
  },
  {
    id: 'o12',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-012',
    title: '空间产品安装-全屋定制橱柜',
    status: 'S11',
    price: '¥38,500',
  },
  {
    id: 'o13',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-013',
    title: '空间产品安装-全屋定制衣柜',
    status: 'S12',
    price: '¥64,000',
  },
  {
    id: 'o14',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-014',
    title: '全屋系统安装-地暖系统安装',
    status: 'S13',
    price: '¥31,200',
  },
];

export default function OrderSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' };
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = MOCK_ORDERS.filter(order => 
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-[30px] font-black text-[#0A0A0A] mb-8" style={{ fontFamily: tokens.fonts.title }}>
            订单管理
          </h1>

          {/* Search Bar */}
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
        </div>

        {/* Order List */}
        <div className="grid gap-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusInfo = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(ROUTES.OVERVIEW, { state: { order, project } })}
                  className="w-full bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#EF6B00]/30 transition-all text-left flex items-center justify-between group overflow-hidden"
                >
                  <div className="flex items-stretch h-full w-full">
                    {/* Status Color Bar */}
                    <div 
                      className="w-1.5 self-stretch" 
                      style={{ backgroundColor: statusInfo.color }}
                    />
                    
                    <div className="flex-1 p-6 flex items-center justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center">
                          <span 
                            className="px-3 py-1 rounded-lg text-[12px] font-bold"
                            style={{ 
                              backgroundColor: `${statusInfo.color}15`, 
                              color: statusInfo.color 
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

                      <div className="flex items-center gap-6">
                        <span className="text-[20px] font-black text-[#0A0A0A]">
                          {order.price}
                        </span>
                        <ChevronRight className="w-6 h-6 text-[#E5E7EB] group-hover:text-[#EF6B00] transition-colors" />
                      </div>
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
      </main>
    </div>
  );
}
