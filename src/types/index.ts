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
