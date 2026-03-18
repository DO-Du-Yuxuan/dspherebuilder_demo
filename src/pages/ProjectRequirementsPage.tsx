import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { History, Clock, ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';
import { RequirementsDoc } from '../components/RequirementsDoc';
import { FormData } from '../types';
import { toast } from 'sonner';

interface HistoryLog {
  id: string;
  action: 'publish' | 'edit';
  user: string;
  time: string;
  desc: string;
  details?: string;
}

// Initial Mock Data based on the original "Showcase" example
const INITIAL_MOCK_DATA: FormData = {
  projectName: '龙湖璟宸府(示例项目)',
  ownerName: '杜先生',
  houseUsage: '自住',
  role: 'owner',
  favoriteSpace: ['客厅', '书房'],
  additionalMembers: ['spouse', 'child'],
  requirementsMembers: [
    {
      id: 'role',
      name: '杜先生 (业主)',
      age: '35',
      profession: '互联网高管',
      spaces: [{ name: '书房', description: '需要独立的办公空间，隔音要好' }]
    },
    {
      id: 'spouse',
      name: '太太',
      age: '32',
      profession: '自由职业',
      spaces: [{ name: '衣帽间', description: '希望能有充足的包包和长裙收纳位' }]
    }
  ],
  smartHomeOptions: ['智能灯光', '智能窗帘', '全屋智能'],
  devices: ['净水系统', '新风系统', '中央空调'],
  comfortSystems: ['地暖', '新风'],
  storageFocus: ['衣物收纳', '书籍收纳', '杂物收纳'],
  otherNeeds: '希望儿童房预留成长空间。\n\n底线与妥协：\n• 绝对要环保（哪怕多花钱，也要进场就能住，没味儿、没甲醛）\n• 收纳够强大（空间利用率要高，东西放得下、找得到）',
  fengshui: '不介意',
  coreSpaces: '客厅:1,餐厅:1,厨房:1,主卧:1,次卧:1,书房:1,卫生间:2',
  livingRoomNote: '希望客厅能兼顾观影和亲子互动。',
  diningNote: '餐厅需要一张大圆桌，偶尔会有朋友聚餐。',
  kitchenNote: '开放式厨房，但油烟控制要好。',
  bathroomNote: '主卫需要浴缸。',
};

// Mock History Data
// (Removed in favor of dynamic history state)

export default function ProjectRequirementsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' };

  const [formData, setFormData] = useState<FormData>({ ...INITIAL_MOCK_DATA, customerStatus: 'unread' });
  const [publishedData, setPublishedData] = useState<FormData>({ ...INITIAL_MOCK_DATA, customerStatus: 'unread' });
  const [isPublished, setIsPublished] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('2026-03-18 10:00');
  const [history, setHistory] = useState<HistoryLog[]>([
    { id: '1', action: 'publish', user: '系统', time: '2026-03-18 10:00', desc: '初始化需求书' },
  ]);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      projectName: '项目名称',
      ownerName: '业主姓名',
      houseUsage: '房屋用途',
      budgetStandard: '预算范围',
      projectArea: '实际面积',
      timeline: '入住周期',
      lighting: '采光',
      ventilation: '通风',
      ceilingHeight: '层高',
      noise: '噪音',
      coreSpaces: '核心空间',
      otherNeeds: '其他需求',
      livingRoomNote: '客厅备注',
      diningNote: '餐厅备注',
      kitchenNote: '厨房备注',
      bathroomNote: '卫生间备注',
    };
    return labels[key] || key;
  };

  const handleUpdateData = (partial: Partial<FormData>) => {
    const changes: string[] = [];
    Object.keys(partial).forEach(key => {
      const k = key as keyof FormData;
      if (JSON.stringify(formData[k]) !== JSON.stringify(partial[k])) {
        changes.push(getFieldLabel(k));
      }
    });

    if (changes.length > 0) {
      setFormData(prev => ({ ...prev, ...partial }));
      setHasUnpublishedChanges(true);
      setLastUpdated(new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'));
      setPendingChanges(prev => {
        const newSet = new Set([...prev, ...changes]);
        return Array.from(newSet);
      });
    }
  };

  const handleSetCustomerStatus = (status: 'unread' | 'agreed' | 'rejected') => {
    if (status === 'rejected') {
      // Revert to last published version and set status to rejected
      setFormData({ ...publishedData, customerStatus: 'rejected' });
      setHasUnpublishedChanges(false);
      setPendingChanges([]);
      toast.info('客户已拒绝，内容已恢复至上个发布版本');
    } else {
      setFormData(prev => ({ ...prev, customerStatus: status }));
    }
  };

  const handlePublish = () => {
    if (!hasUnpublishedChanges) {
      toast.error('内容未发生变更，无需发布');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    setIsPublished(true);
    setHasUnpublishedChanges(false);
    
    const updatedData: FormData = { ...formData, customerStatus: 'unread' };
    setFormData(updatedData);
    setPublishedData(updatedData);
    setLastUpdated(now);

    // Add to history
    const newLog: HistoryLog = {
      id: Date.now().toString(),
      action: 'publish',
      user: user.name || user.username,
      time: now,
      desc: '发布了新版本至 Home 端',
      details: pendingChanges.length > 0 ? `修改内容: ${pendingChanges.join(', ')}` : undefined
    };
    setHistory(prev => [newLog, ...prev]);
    setPendingChanges([]);
    toast.success('发布成功');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: tokens.fonts.body }}>
      <Header 
        userName={user.name || user.username}
        onHomeClick={() => navigate(ROUTES.HOME)}
        onLogout={() => logout()}
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate(ROUTES.PROJECTS)}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#EF6B00] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> 返回项目列表
          </button>
        </div>
        <div className="overflow-hidden">
          <RequirementsDoc 
            projectName={project.name}
            ownerDisplayName={formData.ownerName || '用户'}
            data={formData}
            updateData={handleUpdateData}
            onBackHome={() => navigate(ROUTES.PROJECTS)}
            onShowHistory={() => setShowHistory(true)}
            onPublish={handlePublish}
            onSave={() => setHasUnpublishedChanges(true)}
            isPublished={isPublished}
            hasUnpublishedChanges={hasUnpublishedChanges}
            lastUpdated={lastUpdated}
            customerStatus={formData.customerStatus || 'unread'}
            onSetCustomerStatus={handleSetCustomerStatus}
          />
        </div>
      </main>

      {/* History Drawer/Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#EF6B00]" />
                修改历史记录
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
              >
                关闭
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                {history.map((log) => (
                  <div key={log.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                      log.action === 'publish' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`} />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-gray-900">{log.user}</span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.time}
                        </span>
                      </div>
                      <div className={`text-sm mt-1 p-3 rounded-xl ${
                        log.action === 'publish' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                          : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}>
                        <div className="font-medium">{log.desc}</div>
                        {log.details && (
                          <div className="mt-1 text-xs opacity-80">{log.details}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
