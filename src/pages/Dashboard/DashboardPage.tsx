import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, LayoutDashboard, ArrowRight, LogOut } from 'lucide-react'
import { getCurrentUser, logout } from '../../utils/authUtils'
import { ROUTES } from '../../utils/constants'
import { tokens } from '../../design-tokens'

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
)

const DashboardPage: React.FC = () => {
  const user = getCurrentUser()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleLogout = () => {
    logout()
    // In prototype, we just log it
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]" style={{ fontFamily: tokens.fonts.body }}>
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-md shadow-sm py-4 border-b border-gray-100">
        <PageContainer className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl"
              style={{ backgroundColor: tokens.colors.primary }}
            >
              O
            </div>
            <span className="text-xl font-black tracking-tighter" style={{ color: tokens.colors.textPrimary }}>
              ORANGE<span style={{ color: tokens.colors.primary }}>CMS</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                {user.name?.[0] || 'U'}
              </div>
              <span className="text-[#4B5563] text-sm font-medium">
                {user.name || user.username}
                <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-[#6B7280] text-sm hover:text-orange-600 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">退出</span>
            </button>
          </div>
        </PageContainer>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <PageContainer className="w-full">
          <div className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blog management card */}
            <div
              className="group relative bg-white rounded-[24px] shadow-sm hover:shadow-xl border border-gray-100 p-8 transition-all duration-300 flex flex-col items-start hover:-translate-y-1 cursor-not-allowed opacity-60"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Edit3 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">文章管理</h2>
              <p className="text-gray-500 text-sm leading-relaxed">管理您的博客内容与发布状态（模块开发中）</p>
              <div className="mt-8 text-orange-600 text-sm font-bold flex items-center gap-1">
                即将开放
              </div>
            </div>

            {/* Overview management card - NEW */}
            <Link
              to={ROUTES.OVERVIEW}
              className="group relative bg-white rounded-[24px] shadow-sm hover:shadow-xl border border-gray-100 p-8 transition-all duration-300 flex flex-col items-start hover:-translate-y-1"
              style={{ boxShadow: tokens.shadows.card }}
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white"
                style={{ backgroundColor: tokens.colors.primary }}
              >
                <LayoutDashboard className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">内容概览</h2>
              <p className="text-gray-500 text-sm leading-relaxed">查看所有方案版本，进行版本克隆与发布管理</p>
              <div className="mt-8 text-orange-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                立即进入 <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </PageContainer>
      </main>
    </div>
  )
}

export default DashboardPage
