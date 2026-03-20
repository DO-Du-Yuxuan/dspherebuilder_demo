export type StatusGroup = '意向期' | '订购期' | '交付期' | '验收期' | '维保期'

export type SankeyOrderRuleInput = {
  status: string
  statusCode?: string
  statusName?: string
}

export const STATUS_COLORS: Record<StatusGroup, string> = {
  意向期: '#d0d7d6',
  订购期: '#4887ff',
  交付期: '#B300FA',
  验收期: '#ff9c3e',
  维保期: '#7BC80E',
}

export const STATUS_LIST: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']

export function normalizeOrderNumber(rawNumber: string): string {
  const raw = (rawNumber || '').trim()
  if (!raw) return raw

  // 兼容历史格式：PSO-OD-LHJCF-00001 / PSO-OD_LHJCF-00001
  const psoMatch = raw.match(/^PSO-OD[-_]([A-Z0-9]+)-(\d+)$/i)
  if (psoMatch) {
    const projectCode = psoMatch[1].toUpperCase()
    const seq = String(parseInt(psoMatch[2], 10)).padStart(5, '0')
    return `PSO-OD_${projectCode}-${seq}`
  }

  // 兼容 mock 格式：ORD-2026-0001 -> PSO-OD_LHJCF-00584（与现有主数据区间对齐）
  const ordMatch = raw.match(/^ORD-\d{4}-(\d+)$/i)
  if (ordMatch) {
    const seq = parseInt(ordMatch[1], 10) + 583
    return `PSO-OD_LHJCF-${String(seq).padStart(5, '0')}`
  }

  return raw
}

export function formatStatusDisplay(ord: SankeyOrderRuleInput): string {
  if (ord.statusCode && ord.statusName) return `${ord.statusCode} ${ord.statusName}`
  return ord.status
}

export function getOrderPhaseForColor(ord: SankeyOrderRuleInput): StatusGroup {
  const valid: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']
  if (valid.includes(ord.status as StatusGroup)) return ord.status as StatusGroup
  const code = ord.statusCode || String(ord.status)
  if (code.startsWith('S11') || code.startsWith('S10')) return '维保期'
  if (code.startsWith('S07') || code.startsWith('S09') || code.startsWith('S08')) return '验收期'
  if (code.startsWith('S06') || code.startsWith('S13')) return '交付期'
  if (code.startsWith('S02') || code.startsWith('S03')) return '订购期'
  if (code.startsWith('S00') || code.startsWith('S01') || code.startsWith('S05')) return '意向期'
  if (code.startsWith('S04') || code.startsWith('S12')) return '验收期'
  return '意向期'
}
