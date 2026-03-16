export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  ORDERS: '/orders',
  OVERVIEW: '/overview',
  EDITOR: '/editor',
  ADMIN: '/admin',
  ADMIN_DOBLOG_MANAGE: '/admin/doblog/manage',
  QUOTATION: '/quotation',
  SETTLEMENT: '/settlement',
};

export const ORDER_STATUS_CONFIG = {
  S00: { label: 'S00-意向报价中', color: '#d0d7d6' },
  S01: { label: 'S01-意向沟通中', color: '#d0d7d6' },
  S02: { label: 'S02-订单深化中', color: '#4887ff' },
  S03: { label: 'S03-订购确认中', color: '#4887ff' },
  S04: { label: 'S04-客户已婉拒', color: '#d0d7d6' },
  S05: { label: 'S05-客户决策中', color: '#d0d7d6' },
  S06: { label: 'S06-订单交付中', color: '#B300FA' },
  S07: { label: 'S07-订单验收中', color: '#ff9C3e' },
  S08: { label: 'S08-订单终止中', color: '#ff9C3e' },
  S09: { label: 'S09-订单整改中', color: '#ff9C3e' },
  S10: { label: 'S10-订单维保中', color: '#7BC80E' },
  S11: { label: 'S11-订单已交付', color: '#7BC80E' },
  S12: { label: 'S12-订单已结束', color: '#d0d7d6' },
  S13: { label: 'S13-订单休眠中', color: '#B300FA' },
};
