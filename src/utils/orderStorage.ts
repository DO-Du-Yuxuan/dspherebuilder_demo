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
    orderNumber: 'PSO-OD_LHJCF-001',
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
    orderNumber: 'PSO-OD_LHJCF-002',
    title: '空间产品安装-移动家具',
    status: 'S01',
    price: '¥45,800',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o3',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-003',
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
    orderNumber: 'PSO-OD_LHJCF-004',
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
    orderNumber: 'PSO-OD_LHJCF-005',
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
    orderNumber: 'PSO-OD_LHJCF-006',
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
    orderNumber: 'PSO-OD_LHJCF-007',
    title: '全屋系统安装-卫浴产品安装',
    status: 'S06',
    price: '¥28,400',
    schemeVersions: [],
    quotationVersions: [],
    settlementVersions: [],
  },
  {
    id: 'o8',
    projectId: 'p1',
    orderNumber: 'PSO-OD_LHJCF-008',
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
    orderNumber: 'PSO-OD_LHJCF-009',
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
    orderNumber: 'PSO-OD_LHJCF-010',
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
    orderNumber: 'PSO-OD_LHJCF-011',
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
    orderNumber: 'PSO-OD_LHJCF-012',
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
    orderNumber: 'PSO-OD_LHJCF-013',
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
    orderNumber: 'PSO-OD_LHJCF-014',
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
