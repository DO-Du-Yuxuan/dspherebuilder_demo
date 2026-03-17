import { ORDER_STATUS_CONFIG } from './constants';

export interface Order {
  id: string;
  projectId: string;
  orderNumber: string;
  title: string;
  status: string;
  price: string;
  schemeVersions: any[];
  quotationVersions: any[];
  settlementVersions: any[];
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00001',
    title: '空间产品安装-家用电器',
    status: 'S00',
    price: '¥24,500',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o2',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00002',
    title: '空间产品安装-移动家具',
    status: 'S02-01',
    price: '¥45,800',
    schemeVersions: [
      {
        id: 'v-lhjcf-002-1',
        versionNumber: '1',
        name: '现代简约风格软装方案',
        status: 'reviewed',
        createdAt: '2026-03-15 10:30',
        publishedAt: '2026-03-15 14:20',
        pages: [
          {
            snapshotId: 's1',
            versionId: 'v-lhjcf-002-1',
            pageId: 'p1',
            order: 1,
            title: '餐厅设计方案',
            text: '这组设计呈现了极致的侘寂风美学。空间大量运用微水泥、粗犷的原木和原始陶艺，通过质朴的肌理传达岁月的沉静。错落排布的编织灯饰不仅是视觉焦点，更散发出柔和的暖光，构建出一个逃离城市喧嚣、回归自然本质的沉浸式禅意交流空间。',
            imageUrl: '/images/Gemini_Generated_Image_6gxyu16gxyu16gxy.png',
            annotations: [
              {
                id: 'anno-1',
                targetType: 'image_point',
                point: { x: 35, y: 45 },
                content: '建议选用耐磨科技布材质，方便后期打理。',
                createdAt: '2026-03-15 11:00',
                authorName: '杜宇轩'
              }
            ],
            comments: [
              {
                id: 'comm-1',
                targetType: 'image_point',
                point: { x: 65, y: 55 },
                content: '这里不要挂画。',
                createdAt: '2026-03-16 09:15',
                authorName: '业主 - 刘先生'
              },
              {
                id: 'comm-2',
                targetType: 'text_description',
                content: '沙发颜色注意不要太深。',
                createdAt: '2026-03-16 09:20',
                authorName: '业主 - 刘先生'
              }
            ],
            lock: { isLocked: true }
          },
          {
            snapshotId: 's2',
            versionId: 'v-lhjcf-002-1',
            pageId: 'p2',
            order: 2,
            title: '客餐厅方案',
            text: '该方案展现了充满建筑张力的现代设计。清水混凝土墙面与冷峻的大理石长桌奠定了空间的理性基调，而爱马仕橙皮质餐椅与精致的金属编织吊灯则巧妙地注入了温度与质感。冷暖材质的极致碰撞，在利落的几何线条下勾勒出低调、奢华且富有力量感的审美格调。',
            imageUrl: '/images/unwatermarked_Gemini_Generated_Image_uswrceuswrceuswr.png',
            annotations: [
              {
                id: 'anno-2',
                targetType: 'image_point',
                point: { x: 45, y: 30 },
                content: '吊灯高度建议距离桌面 75-85cm，光线最舒适。',
                createdAt: '2026-03-15 11:15',
                authorName: '杜宇轩'
              }
            ],
            comments: [
              {
                id: 'comm-3',
                targetType: 'image_point',
                point: { x: 55, y: 60 },
                content: '餐椅的皮质颜色可以换成深灰色吗？',
                createdAt: '2026-03-16 10:05',
                authorName: '业主 - 刘先生'
              }
            ],
            lock: { isLocked: true }
          },
          {
            snapshotId: 's3',
            versionId: 'v-lhjcf-002-1',
            pageId: 'p3',
            order: 3,
            title: '客厅设计方案',
            text: '该方案采用了奶油风与现代法式的融合。空间以低饱和度的暖白色为基调，圆润的弧形沙发配合有机造型吊灯，营造出温润的包裹感。鱼骨拼木地板与藤编屏风的运用，为室内增添了细腻的自然纹理与复古气息，展现出一种松弛、高级且富有艺术感的生活状态。',
            imageUrl: '/images/unwatermarked_Gemini_Generated_Image_a36zwca36zwca36z.png',
            annotations: [
              {
                id: 'anno-3',
                targetType: 'image_point',
                point: { x: 25, y: 50 },
                content: '这是个用来收纳工具的家政柜。',
                createdAt: '2026-03-15 11:30',
                authorName: '杜宇轩'
              }
            ],
            comments: [
              {
                id: 'comm-4',
                targetType: 'image_point',
                point: { x: 70, y: 40 },
                content: '我想要玻璃门。',
                createdAt: '2026-03-16 11:20',
                authorName: '业主 - 刘先生'
              }
            ],
            lock: { isLocked: true }
          }
        ]
      }
    ],
    quotationVersions: [
      {
        id: 'q-lhjcf-002-1',
        versionNumber: '1',
        name: '订购报价单 V1',
        status: 'signed',
        createdAt: '2026-03-16 14:00',
        publishedAt: '2026-03-16 15:30',
        signedAt: '2026-03-17 09:00',
        totalPrice: '¥45,800'
      }
    ],
    settlementVersions: [],
  },
  {
    id: 'o3',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00003',
    title: '空间产品安装-软装摆件',
    status: 'S02',
    price: '¥12,000',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o4',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00004',
    title: '空间产品安装-全屋床垫',
    status: 'S03',
    price: '¥18,900',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o5',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00005',
    title: '空间产品安装-全屋窗帘',
    status: 'S04',
    price: '¥8,600',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o6',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00006',
    title: '空间产品安装-木地板',
    status: 'S05',
    price: '¥32,000',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o7',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00007',
    title: '全屋系统安装-卫浴产品安装',
    status: 'S06-01',
    price: '¥28,400',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o8',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00008',
    title: '全屋系统安装-照明系统安装',
    status: 'S07',
    price: '¥15,200',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o9',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00009',
    title: '全屋系统安装-智能系统安装',
    status: 'S08',
    price: '¥56,000',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o10',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00010',
    title: '全屋系统安装-空调挂机系统安装',
    status: 'S09',
    price: '¥19,800',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o11',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00011',
    title: '全屋系统安装-新风净化系统',
    status: 'S10',
    price: '¥22,000',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o12',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00012',
    title: '空间产品安装-全屋定制橱柜',
    status: 'S11',
    price: '¥38,500',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o13',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00013',
    title: '空间产品安装-全屋定制衣柜',
    status: 'S12',
    price: '¥64,000',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o14',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00014',
    title: '全屋系统安装-地暖系统安装',
    status: 'S13',
    price: '¥31,200',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
];

// In-memory store that resets on page refresh
let memoryOrders: Order[] = [...INITIAL_ORDERS];

export const getOrders = (): Order[] => {
  return memoryOrders;
};

export const updateOrderStatus = (orderId: string, newStatus: string): Order | null => {
  const index = memoryOrders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    memoryOrders[index] = { ...memoryOrders[index], status: newStatus };
    return memoryOrders[index];
  }
  return null;
};

export const updateOrderVersions = (
  orderId: string, 
  type: 'scheme' | 'quotation' | 'settlement', 
  versions: any[]
): Order | null => {
  const index = memoryOrders.findIndex(o => o.id === orderId);
  if (index !== -1) {
    const key = type === 'scheme' ? 'schemeVersions' : type === 'quotation' ? 'quotationVersions' : 'settlementVersions';
    memoryOrders[index] = { ...memoryOrders[index], [key]: versions };
    return memoryOrders[index];
  }
  return null;
};

export const getOrderById = (orderId: string): Order | null => {
  return memoryOrders.find(o => o.id === orderId) || null;
};

export const findOrderByVersionId = (versionId: string) => {
  return memoryOrders.find(o => 
    o.schemeVersions?.some(v => v.id === versionId)
  );
};

export const findOrderByQuotationId = (quotationId: string) => {
  return memoryOrders.find(o => 
    o.quotationVersions?.some(v => v.id === quotationId)
  );
};

export const findOrderBySettlementId = (settlementId: string) => {
  return memoryOrders.find(o => 
    o.settlementVersions?.some(v => v.id === settlementId)
  );
};
