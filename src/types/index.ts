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

export const MOCK_DESIGN_ORDER: DesignOrder = {
  id: "order-1",
  orderNumber: "ORD-20260308",
  clientName: "某某客户",
  currentVersionId: "v-draft-001",
  versions: [
    {
      id: "v-draft-001",
      versionNumber: "1.0",
      name: "初始草稿",
      status: "draft",
      createdAt: "2026-03-08T10:00:00Z",
      pages: [
        {
          snapshotId: "s1", versionId: "v-draft-001", pageId: "p1", order: 1, title: "首页", text: "首页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
          annotations: [{ id: "a1", targetType: "image_point", point: { x: 10, y: 20 }, content: "标注1", createdAt: "2026-03-08T10:00:00Z" }],
          comments: [],
          lock: { isLocked: false }
        },
        {
          snapshotId: "s2", versionId: "v-draft-001", pageId: "p2", order: 2, title: "详情页", text: "详情页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
          annotations: [],
          comments: [{ id: "c1", targetType: "text_description", content: "这里需要调整", createdAt: "2026-03-08T10:00:00Z", authorName: "客户" }],
          lock: { isLocked: false }
        }
      ]
    },
    {
      id: "v-pub-001",
      basedOnVersionId: "v-draft-001",
      versionNumber: "0.9",
      name: "发布版本",
      status: "published",
      createdAt: "2026-03-01T10:00:00Z",
      publishedAt: "2026-03-01T12:00:00Z",
      pages: [{
        snapshotId: "s3", versionId: "v-pub-001", pageId: "p1", order: 1, title: "首页", text: "首页描述", imageUrl: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=2000&q=80",
        annotations: [], comments: [], lock: { isLocked: false }
      }]
    }
  ]
};

export const INITIAL_MOCK_VERSIONS: OrderVersion[] = MOCK_DESIGN_ORDER.versions;
