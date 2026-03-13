import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { MOCK_ORDERS } from '../mock';
import { Search, ChevronRight, Home, ArrowLeftRight } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';

export default function OrderSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '静安·云境公寓 (示例项目)', code: 'PRJT_R-070-A-00001' };
  
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
            filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(ROUTES.OVERVIEW, { state: { order, project } })}
                className="w-full bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#EF6B00]/30 transition-all text-left flex items-center justify-between group overflow-hidden"
              >
                <div className="flex items-stretch h-full w-full">
                  {/* Status Color Bar */}
                  <div 
                    className="w-1.5 self-stretch" 
                    style={{ backgroundColor: order.color }}
                  />
                  
                  <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center">
                        <span 
                          className="px-3 py-1 rounded-lg text-[12px] font-bold"
                          style={{ 
                            backgroundColor: `${order.color}15`, 
                            color: order.color 
                          }}
                        >
                          {order.statusLabel}
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
            ))
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
