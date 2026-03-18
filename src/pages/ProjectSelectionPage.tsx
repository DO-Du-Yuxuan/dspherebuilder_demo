import { useNavigate } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { LayoutGrid, ChevronRight, ArrowLeft } from 'lucide-react';
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
          <button 
            onClick={() => navigate(ROUTES.HOME)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF6B00] transition-colors mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </button>
          <h1 className="text-[48px] font-black text-[#0A0A0A] mb-2" style={{ fontFamily: tokens.fonts.title }}>
            项目选择
          </h1>
          <p className="text-[#6B7280] text-[16px]">请选择您要管理的装修项目</p>
        </div>

        <div className="grid gap-6">
          {MOCK_PROJECTS.map((project) => (
            <div
              key={project.id}
              className="w-full bg-white p-8 rounded-[24px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#EF6B00]/30 transition-all text-left flex items-center justify-between group cursor-pointer"
              onClick={() => navigate(ROUTES.ORDERS, { state: { project } })}
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
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigating to orders
                    navigate(ROUTES.PROJECT_REQUIREMENTS, { state: { project } });
                  }}
                  className="px-4 py-2 text-[14px] font-bold text-[#EF6B00] bg-orange-50 hover:bg-[#EF6B00] hover:text-white rounded-[12px] transition-colors"
                >
                  修改项目需求
                </button>
                <ChevronRight className="w-8 h-8 text-[#E5E7EB] group-hover:text-[#EF6B00] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
