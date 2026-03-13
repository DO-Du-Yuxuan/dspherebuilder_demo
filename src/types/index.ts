export interface Point {
  x: number;
  y: number;
}

export type TargetType = 'image_point' | 'text_description';

export type VersionStatus = 'draft' | 'published' | 'completed' | 'archived';

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
