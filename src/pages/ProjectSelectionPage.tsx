import React from 'react';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';

const MOCK_PROJECTS = [
  { id: 'p1', name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' },
  { id: 'p2', name: '晓月澄庐102', code: 'PRJT_R-056-T-XYCL102' },
  { id: 'p3', name: '季景铭郡', code: 'PRJT_R-058-A-JJMJ' },
];

export default function ProjectSelectionPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-[48px] font-black text-[#0A0A0A] mb-2" style={{ fontFamily: tokens.fonts.title }}>
            项目选择
          </h1>
          <p className="text-[#6B7280] text-[16px]">请选择您要管理的装修项目</p>
        </div>

        <div className="grid gap-6">
          {MOCK_PROJECTS.map((project) => (
            <button
              key={project.id}
              onClick={() => navigate(ROUTES.ORDERS, { state: { project } })}
              className="w-full bg-white p-8 rounded-[24px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#EF6B00]/30 transition-all text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className="bg-orange-50 p-4 rounded-2xl group-hover:bg-[#EF6B00] transition-colors">
                  <LayoutGrid className="w-8 h-8 text-[#EF6B00] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="text-[24px] font-black text-[#0A0A0A] mb-1" style={{ fontFamily: tokens.fonts.title }}>
                    {project.name}
                  </h3>
                  <p className="text-[#6B7280] text-[14px] font-medium font-mono">
                    {project.code}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 text-[#E5E7EB] group-hover:text-[#EF6B00] transition-colors" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
