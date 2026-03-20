export interface Point {
  x: number;
  y: number;
}

export type TargetType = 'image_point' | 'text_description';

export type VersionStatus = 
  | 'draft' 
  | 'published_unread' 
  | 'reviewing' 
  | 'reviewed' 
  | 'historical' 
  | 'archived';

export type LockAction = 'next' | 'satisfied';

export interface Annotation {
  id: string;
  targetType: TargetType;
  point?: Point;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
}

export interface Comment {
  id: string;
  targetType: TargetType;
  point?: Point;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
}

export interface PageLock {
  isLocked: boolean;
  lockedAt?: string;
  action?: LockAction;
}

export interface PageSnapshot {
  snapshotId: string;
  versionId: string;
  pageId: string;
  order: number;
  title: string;
  text: string;
  imageUrl: string;
  annotations: Annotation[];
  comments: Comment[];
  lock: PageLock;
}

export interface OrderVersion {
  id: string;
  versionNumber: string;
  name: string;
  status: VersionStatus;
  createdAt: string;
  publishedAt?: string;
  basedOnVersionId?: string;
  pages: PageSnapshot[];
}

export interface DesignOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  currentVersionId?: string;
  versions: OrderVersion[];
}

export interface Project {
  id: string;
  name: string;
  code: string;
}

export interface OrderItem {
  id: string;
  projectId: string;
  orderNumber: string;
  title: string;
  status: string;
  statusLabel: string;
  price: string;
  color: string;
}

export type DocumentStatus = 
  | 'draft'
  | 'unread'   // 未查看未签字
  | 'read'     // 已查看未签字
  | 'feedback' // 已查看已反馈
  | 'signed';   // 已查看已签字

export interface QuotationVersion {
  id: string;
  versionNumber: string;
  name: string;
  status: DocumentStatus;
  createdAt: string;
  publishedAt?: string;
  totalPrice: string;
  feedback?: string;
  feedbackAt?: string;
  signedAt?: string;
  signatureUrl?: string;
}

export interface SettlementVersion {
  id: string;
  versionNumber: string;
  name: string;
  status: DocumentStatus;
  createdAt: string;
  publishedAt?: string;
  totalPrice: string;
  feedback?: string;
  feedbackAt?: string;
  signedAt?: string;
  signatureUrl?: string;
}

export interface SettlementItem {
  id: number;
  epcCode: string;
  orderType: string;
  salesOrder: string;
  unit: string;
  quotationQuantity: number;
  quotationUnitPrice: number;
  quotationAmount: number;
  settlementQuantity: number;
  settlementAmount: number;
  settlementRemark: string;
}

export interface SettlementData {
  orderNumber: string;
  customer: {
    name: string;
    address: string;
  };
  pricing: {
    design: number;
    product: number;
    construction: number;
    total: number;
  };
  designItems: SettlementItem[];
  productItems: SettlementItem[];
  constructionItems: SettlementItem[];
}

export interface MemberSpaceItem {
  name: string;
  description?: string;
}

/** 项目需求书「变更与修订记录」单条（与 Home 端一致） */
export interface RequirementDocRevisionEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** 更新人 */
  updater: string;
  /** 变更概要 */
  summary: string;
  /** 涉及章节 / 备注 */
  sectionNote?: string;
  /** 本条保存后的需求书快照 JSON（RequirementDocSnapshotStored） */
  docSnapshotJson?: string;
  /** 变更前可读详情（与 Home 端一致，用于展开区兜底展示） */
  changeDetailBefore?: string;
  /** 变更后可读详情 */
  changeDetailAfter?: string;
}

/** 需求书成员画像：可添加/编辑成员，每个成员下可添加/编辑空间及描述 */
export interface RequirementsMember {
  id: string;
  /** 角色（男主人、女主人、女儿等），决定年龄段/职业/活动空间可选项 */
  name: string;
  /** 姓名或称呼，仅展示用，可与角色分开填写 */
  displayName?: string;
  age?: string;
  profession?: string;
  spaces?: MemberSpaceItem[];
  /** 主要活动及空间以外的其他说明 */
  otherActivityNote?: string;
}

/** 修订存档时的需求书快照（不含媒体 base64，仅文件名与文本字段） */
export interface RequirementDocSnapshotStored {
  smartHomeOptions: string[];
  devices: string[];
  otherNeeds: string;
  comfortSystems: string[];
  fengshui: string;
  storageFocus: string[];
  spaceOtherNote: string;
  livingRoomNote: string;
  diningNote: string;
  kitchenNote: string;
  bathroomNote: string;
  coreSpaces: string;
  customCoreSpaceOptions: string[];
  childGrowth: string;
  guestStay: string;
  futureChanges: string;
  requirementsMembers: RequirementsMember[];
  floorPlanImages: Array<{ name: string }>;
  siteMedia: Array<{ name: string; kind: string }>;
  customSpaceItems: Array<{ name: string; description?: string }>;
}

export interface FormData {
  projectLocation?: string;
  userCity?: string;
  projectType?: string;
  projectArea?: string;
  budgetStandard?: string;
  budgetSubStandard?: string;
  timeline?: string;
  houseUsage?: string;
  lighting?: string;
  ventilation?: string;
  ceilingHeight?: string;
  noise?: string;
  coreSpaces?: string;
  customCoreSpaceOptions?: string[];
  childGrowth?: string;
  guestStay?: string;
  futureChanges?: string;
  floorPlanImages?: Array<{ name: string; url: string }>;
  siteMedia?: Array<{ name: string; url: string; kind: 'image' | 'video' }>;
  smartHomeOptions?: string[];
  devices?: string[];
  otherNeeds?: string;
  comfortSystems?: string[];
  fengshui?: string;
  storageFocus?: string[];
  spaceOtherNote?: string;
  livingRoomNote?: string;
  diningNote?: string;
  kitchenNote?: string;
  bathroomNote?: string;
  livingRoomFeature?: string[];
  diningCount?: string;
  festivalDiningCount?: string;
  cookingHabit?: string;
  secondKitchen?: string;
  dryWetSeparation?: string;
  requirementsMembers?: RequirementsMember[];
  customSpaceItems?: Array<{ name: string; description?: string }>;
  role?: string;
  favoriteSpace?: string[];
  additionalMembers?: string[];
  daughterSpaces?: string[];
  sonSpaces?: string[];
  catSpaces?: string[];
  dogSpaces?: string[];
  styleName?: string;
  bottomLine?: string[];
  projectName?: string;
  ownerName?: string;
  customerStatus?: 'unread' | 'agreed' | 'rejected';
  /** 需求书修订历史，最新在前 */
  requirementDocRevisions?: RequirementDocRevisionEntry[];
}

/** 需求书快照/修订工具用最小初始值（Builder 不依赖 mockOrders） */
export const initialFormDataForSnapshot: Partial<FormData> = {
  smartHomeOptions: [],
  devices: [],
  otherNeeds: '',
  comfortSystems: [],
  fengshui: '',
  storageFocus: [],
  spaceOtherNote: '',
  livingRoomNote: '',
  diningNote: '',
  kitchenNote: '',
  bathroomNote: '',
  coreSpaces: '',
  customCoreSpaceOptions: [],
  childGrowth: '',
  guestStay: '',
  futureChanges: '',
  requirementsMembers: [],
  floorPlanImages: [],
  siteMedia: [],
  customSpaceItems: [],
  requirementDocRevisions: [],
};
