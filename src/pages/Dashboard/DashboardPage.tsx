import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Edit3, LayoutDashboard, ArrowRight, LogOut } from 'lucide-react'
import { getCurrentUser, logout } from '../../utils/authUtils'
import { ROUTES } from '../../utils/constants'
import { tokens } from '../../design-tokens'
import { Header } from '../../components/Header'

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
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        userName={user.name || user.username}
        onHomeClick={() => window.location.href = ROUTES.HOME}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <PageContainer className="w-full">
          <div className="max-w-xl mx-auto w-full">
            {/* Overview management card - NEW */}
            <Link
              to={ROUTES.PROJECTS}
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
