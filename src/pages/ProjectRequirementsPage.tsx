import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokens } from '../design-tokens';
import { ROUTES } from '../utils/constants';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { getCurrentUser, logout } from '../utils/authUtils';
import { RequirementsDoc } from '../components/RequirementsDoc';
import { FormData, RequirementDocRevisionEntry } from '../types';
import { buildRevisionSnapshotFormData } from '../utils/requirementDocRevisionSnapshot';
import { formatRequirementPayloadAsDetail, requirementPayloadFromFormData } from '../utils/requirementRevisionDiff';
import { toast } from 'sonner';

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

// 初始化一条修订记录示例
const createInitialRevision = (): RequirementDocRevisionEntry => {
  const base = { ...INITIAL_MOCK_DATA, requirementDocRevisions: [] };
  const snapshot = buildRevisionSnapshotFormData(base as FormData, {});
  const payload = requirementPayloadFromFormData(base as FormData);
  return {
    id: 'rev-init',
    date: '2026-03-18',
    updater: '系统',
    summary: '初始化需求书',
    sectionNote: '项目概览、成员画像、空间需求',
    docSnapshotJson: JSON.stringify({ v: 2, formData: snapshot }),
    changeDetailAfter: formatRequirementPayloadAsDetail(payload),
  };
};

export default function ProjectRequirementsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const project = location.state?.project || { name: '龙湖璟宸府(示例项目)', code: 'PRJT_R-049-T4-LHJCF' };

  const initialWithRevisions = {
    ...INITIAL_MOCK_DATA,
    customerStatus: 'unread' as const,
    requirementDocRevisions: [createInitialRevision()],
  };
  const [formData, setFormData] = useState<FormData>(initialWithRevisions);
  const [publishedData, setPublishedData] = useState<FormData>(initialWithRevisions);
  const [isPublished, setIsPublished] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('2026-03-18 10:00');

  const handleUpdateData = (partial: Partial<FormData>) => {
    const hasChanges = Object.keys(partial).some(key => {
      const k = key as keyof FormData;
      return JSON.stringify(formData[k]) !== JSON.stringify(partial[k]);
    });
    if (hasChanges) {
      setFormData(prev => ({ ...prev, ...partial }));
      setHasUnpublishedChanges(true);
      setLastUpdated(new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'));
    }
  };

  const handleSetCustomerStatus = (status: 'unread' | 'agreed' | 'rejected') => {
    if (status === 'rejected') {
      // Revert to last published version and set status to rejected
      setFormData({ ...publishedData, customerStatus: 'rejected' });
      setHasUnpublishedChanges(false);
      toast.info('客户已拒绝，内容已恢复至上个发布版本');
    } else {
      setFormData(prev => ({ ...prev, customerStatus: status }));
    }
  };

  /** 仅执行发布逻辑（同步至 Home），不新增修订记录。用于「确认修改并发布至Home端」合并流程 */
  const handlePublishOnly = (dataToPublish?: FormData) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    setIsPublished(true);
    setHasUnpublishedChanges(false);
    setPublishedData(dataToPublish ?? formData);
    setLastUpdated(now);
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
            ownerDisplayName="杜宇轩"
            data={formData}
            updateData={handleUpdateData}
            onBackHome={() => navigate(ROUTES.PROJECTS)}
            onPublish={handlePublishOnly}
            mergeSaveAndPublish
            onSave={() => setHasUnpublishedChanges(true)}
            isPublished={isPublished}
            hasUnpublishedChanges={hasUnpublishedChanges}
            lastUpdated={lastUpdated}
            customerStatus={formData.customerStatus || 'unread'}
            onSetCustomerStatus={handleSetCustomerStatus}
          />
        </div>
      </main>
    </div>
  );
}
