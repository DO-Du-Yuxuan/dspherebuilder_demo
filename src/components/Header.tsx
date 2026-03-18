import { motion } from 'motion/react';

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
  onHomeClick,
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
      </div>
    </motion.header>
  );
}
