import { DesignOrder, OrderVersion, Project, OrderItem, SettlementData } from '../types';

export const MOCK_SETTLEMENT_DATA: SettlementData = {
  orderNumber: "EPC-2026-0115-001",
  customer: {
    name: "张先生",
    address: "上海市浦东新区世纪大道1000号",
  },
  pricing: {
    design: 36000,
    product: 156000,
    construction: 88000,
    total: 280000,
  },
  designItems: [
    {
      id: 1,
      epcCode: "E-1001",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 8000,
      quotationAmount: 8000,
      settlementQuantity: 1,
      settlementAmount: 8000,
      settlementRemark: "按原方案交付",
    },
    {
      id: 2,
      epcCode: "E-1002",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "张",
      quotationQuantity: 4,
      quotationUnitPrice: 3000,
      quotationAmount: 12000,
      settlementQuantity: 4,
      settlementAmount: 12000,
      settlementRemark: "加急渲染已完成",
    },
    {
      id: 3,
      epcCode: "E-1003",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 12000,
      quotationAmount: 12000,
      settlementQuantity: 1,
      settlementAmount: 12000,
      settlementRemark: "全套图纸已存档",
    },
    {
      id: 4,
      epcCode: "E-1004",
      orderType: "PSO-E 高端设计",
      salesOrder: "SO2026031301",
      unit: "套",
      quotationQuantity: 1,
      quotationUnitPrice: 4000,
      quotationAmount: 4000,
      settlementQuantity: 1,
      settlementAmount: 4000,
      settlementRemark: "选样已确认",
    },
  ],
  productItems: [
    {
      id: 1,
      epcCode: "P-2001",
      orderType: "PSO-P 严选精品",
      salesOrder: "SO2026031302",
      unit: "㎡",
      quotationQuantity: 40,
      quotationUnitPrice: 280,
      quotationAmount: 11200,
      settlementQuantity: 40,
      settlementAmount: 11200,
      settlementRemark: "型号：马可波罗M123",
    },
    {
      id: 2,
      epcCode: "P-2002",
      orderType: "PSO-P 严选精品",
      salesOrder: "SO2026031302",
      unit: "㎡",
      quotationQuantity: 60,
      quotationUnitPrice: 380,
      quotationAmount: 22800,
      settlementQuantity: 60,
      settlementAmount: 22800,
      settlementRemark: "型号：圣象S456",
    },
  ],
  constructionItems: [
    {
      id: 1,
      epcCode: "C-3001",
      orderType: "PSO-C 匠心施工",
      salesOrder: "SO2026031303",
      unit: "㎡",
      quotationQuantity: 25,
      quotationUnitPrice: 180,
      quotationAmount: 4500,
      settlementQuantity: 25,
      settlementAmount: 4500,
      settlementRemark: "已完工验收",
    },
    {
      id: 2,
      epcCode: "C-3002",
      orderType: "PSO-C 匠心施工",
      salesOrder: "SO2026031303",
      unit: "㎡",
      quotationQuantity: 120,
      quotationUnitPrice: 150,
      quotationAmount: 18000,
      settlementQuantity: 120,
      settlementAmount: 18000,
      settlementRemark: "强弱电布线完成",
    },
  ],
};

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

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: '静安·云境公寓 (示例项目)', code: 'PRJT_R-070-A-00001' },
  { id: 'p2', name: '徐汇·滨江壹号', code: 'PRJT_R-070-A-00002' },
  { id: 'p3', name: '黄浦·外滩公馆', code: 'PRJT_R-070-A-00003' },
];

export const MOCK_ORDERS: OrderItem[] = [
  {
    id: 'o1',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00471',
    title: '瓷砖铺贴-公卫、次卫、厨房墙地铺贴',
    status: 'delivered',
    statusLabel: 'S11-订单已交付',
    price: '¥57,500',
    color: '#10B981', // Green
  },
  {
    id: 'o2',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00567',
    title: '全屋-石材安装',
    status: 'quoting',
    statusLabel: 'S00-意向报价中',
    price: '待定',
    color: '#94A3B8', // Gray
  },
  {
    id: 'o3',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00612',
    title: '橱柜柜体定制',
    status: 'deciding',
    statusLabel: 'S05-客户决策中',
    price: '¥32,800',
    color: '#F97316', // Orange
  },
  {
    id: 'o4',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-00623',
    title: '一层、负一层-天花吊顶',
    status: 'working',
    statusLabel: 'S06-04 交付施工中',
    price: '¥18,900',
    color: '#3B82F6', // Blue
  },
];
