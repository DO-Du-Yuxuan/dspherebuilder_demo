import type {
  BudgetSankeyData,
  IncomeEntry,
  Milestone,
  Order as SankeyOrder,
  StatusGroup,
} from '../components/BudgetSankeyWorkbench'
import { getOrderStatusColor } from './orderStatus'
import type { OrderStatusColor } from './orderStatus'

/** 将列表中的金额文案解析为「万元」，与列表展示同源（区间取中值，待定给占位值） */
export function parseOrderAmountToWan(amountStr: string): number {
  if (!amountStr || /待定/.test(amountStr)) return 0.5
  const nums =
    amountStr.match(/[\d,]+/g)?.map((s) => parseInt(s.replace(/,/g, ''), 10)).filter((n) => !Number.isNaN(n)) ??
    []
  if (nums.length === 0) return 0.5
  const yuan = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0]
  return Math.max(0.01, yuan / 10000)
}

const PHASE_TO_STATUS: Record<OrderStatusColor, StatusGroup> = {
  intention: '意向期',
  ordering: '订购期',
  delivery: '交付期',
  acceptance: '验收期',
  maintenance: '维保期',
  red: '验收期',
  gray: '意向期',
}

function safeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_')
}

/** 从列表 status（如 S07-订单验收中、S06-02 方案汇报中）解析 statusCode 与 statusName */
function parseStatusFromDisplay(status: string): { statusCode?: string; statusName?: string } {
  const s = (status || '').trim()
  if (!s) return {}
  // 格式1: "S06-02 方案汇报中"（空格分隔）
  const spaceParts = s.split(/\s+/)
  if (spaceParts.length >= 2) {
    return { statusCode: spaceParts[0], statusName: spaceParts[1] }
  }
  // 格式2: "S07-订单验收中"（首个 - 分隔 code 与 name）
  const dashIdx = s.indexOf('-')
  if (dashIdx > 0) {
    return { statusCode: s.slice(0, dashIdx), statusName: s.slice(dashIdx + 1) }
  }
  return {}
}

export type DisplayOrder = {
  id: string
  title: string
  status: string
  date?: string
  amount: string
}

/**
 * 由当前订单列表（与筛选后列表同一批）生成 BudgetSankey 数据，保证与列表条目一一对应。
 */
export function buildBudgetSankeyFromDisplayOrders(orders: DisplayOrder[]): BudgetSankeyData | null {
  if (!orders.length) return null

  const sorted = [...orders].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id))

  const milestones: Milestone[] = []
  const sankeyOrders: SankeyOrder[] = []
  const incomeEntries: IncomeEntry[] = []
  let total = 0

  sorted.forEach((o, i) => {
    const wan = parseOrderAmountToWan(o.amount)
    total += wan
    const msId = `ms_${safeId(o.id)}`
    const phase = getOrderStatusColor(o.status)
    const sg = PHASE_TO_STATUS[phase] ?? '意向期'
    const { statusCode, statusName } = parseStatusFromDisplay(o.status)

    milestones.push({
      id: msId,
      name: o.title.length > 28 ? `${o.title.slice(0, 26)}…` : o.title,
      budgetMin: wan,
      budgetMax: wan,
      dueDate: o.date || '—',
    })

    sankeyOrders.push({
      id: `ord_${safeId(o.id)}`,
      number: o.id,
      title: o.title,
      status: sg,
      milestoneId: msId,
      budgetMin: wan,
      budgetMax: wan,
      statusCode: statusCode || undefined,
      statusName: statusName || undefined,
      date: o.date,
    })

    const displayDate = o.date ? o.date.replace(/-/g, '.') : `·${i + 1}`
    incomeEntries.push({
      id: `inc_${safeId(o.id)}`,
      date: o.date || `2026-03-${String((i % 28) + 1).padStart(2, '0')}`,
      displayDate,
      amount: wan,
      status: sg,
      isToday: i === sorted.length - 1,
    })
  })

  return {
    incomeEntries,
    milestones,
    orders: sankeyOrders,
    totalBudget: Math.max(Number(total.toFixed(4)), 0.01),
  }
}
