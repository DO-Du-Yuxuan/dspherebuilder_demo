import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Home, User, LogOut } from 'lucide-react';

export interface HeaderProps {
  /** 项目名称 */
  projectName?: string;
  /** 订单编号 */
  orderNumber?: string;
  /** 用户姓名 */
  userName?: string;
  /** 用户头像 URL (可选) */
  userAvatar?: string;
  /** 点击返回首页的回调 */
  onHomeClick?: () => void;
  /** 点击项目名称返回选择页的回调 */
  onProjectClick?: () => void;
  /** 点击订单编号返回选择页的回调 */
  onOrderClick?: () => void;
  /** 退出登录回调 */
  onLogout?: () => void;
}

export function Header({
  projectName,
  orderNumber,
  userName = '管理员',
  userAvatar,
  onHomeClick,
  onProjectClick,
  onOrderClick,
  onLogout
}: HeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
    >
      <div className="flex items-center justify-between h-16 px-6 max-w-7xl mx-auto">
        
        {/* 左侧：Logo */}
        <div className="flex items-center gap-6">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={onHomeClick}
          >
            {/* 居梦科技 Logo */}
            <div className="w-40 h-40 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </motion.div>
        </div>

        {/* 中间：面包屑导航 (项目名称 > 订单编号) */}
        {projectName && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <motion.div 
              className="flex items-center bg-white/60 px-4 py-1.5 rounded-full shadow-sm border border-gray-100"
              layout
            >
              <button 
                onClick={onProjectClick}
                className={`text-sm font-medium transition-colors truncate max-w-[150px] ${onProjectClick ? 'text-gray-700 hover:text-orange-600' : 'text-gray-700 cursor-default'}`}
                title={projectName}
              >
                {projectName}
              </button>
              
              {orderNumber && (
                <>
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                  <button 
                    onClick={onOrderClick}
                    className={`text-sm font-medium transition-colors truncate max-w-[200px] ${onOrderClick ? 'text-gray-700 hover:text-orange-600' : 'text-gray-500 cursor-default'}`}
                    title={orderNumber}
                  >
                    订单：{orderNumber}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* 右侧：用户信息 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-800">{userName}</span>
              <span className="text-xs text-gray-500">项目经理</span>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-100 flex items-center justify-center cursor-pointer"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </motion.div>
          </div>
          <div className="h-5 w-px bg-gray-300"></div>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            title="退出登录"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
