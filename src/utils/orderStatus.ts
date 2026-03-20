export type OrderStatusColor = 'intention' | 'ordering' | 'delivery' | 'acceptance' | 'maintenance' | 'red' | 'gray';

export function getOrderStatusColor(status: string): OrderStatusColor {
  // 维保期
  if (status.startsWith('S11') || status.startsWith('S10')) {
    return 'maintenance';
  }
  // 验收期
  if (status.startsWith('S07') || status.startsWith('S09') || status.startsWith('S08')) {
    return 'acceptance';
  }
  // 交付期
  if (status.startsWith('S06') || status.startsWith('S13')) {
    return 'delivery';
  }
  // 订购期
  if (status.startsWith('S02') || status.startsWith('S03')) {
    return 'ordering';
  }
  // 意向期
  if (status.startsWith('S00') || status.startsWith('S01') || status.startsWith('S05')) {
    return 'intention';
  }
  // 异常/终止
  if (status.startsWith('S04') || status.startsWith('S12')) {
    return 'red';
  }
  
  return 'gray';
}

export const STATUS_BAR_COLORS: Record<OrderStatusColor, string> = {
  intention: 'bg-phase-intention',
  ordering: 'bg-phase-ordering',
  delivery: 'bg-phase-delivery',
  acceptance: 'bg-phase-acceptance',
  maintenance: 'bg-phase-maintenance',
  red: 'bg-red-500',
  gray: 'bg-gray-400',
};

export const STATUS_BADGE_COLORS: Record<OrderStatusColor, string> = {
  intention: 'bg-phase-intention/10 text-phase-intention border-phase-intention/20',
  ordering: 'bg-phase-ordering/10 text-phase-ordering border-phase-ordering/20',
  delivery: 'bg-phase-delivery/10 text-phase-delivery border-phase-delivery/20',
  acceptance: 'bg-phase-acceptance/10 text-phase-acceptance border-phase-acceptance/20',
  maintenance: 'bg-phase-maintenance/10 text-phase-maintenance border-phase-maintenance/20',
  red: 'bg-red-50 text-red-700 border-red-100',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};
