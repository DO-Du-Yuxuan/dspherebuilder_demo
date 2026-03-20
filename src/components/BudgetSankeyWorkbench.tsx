import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  STATUS_COLORS,
  STATUS_LIST,
  formatStatusDisplay,
  getOrderPhaseForColor,
  type StatusGroup,
} from './sankeyRules'

// 轻量替代：ai-studio 无 antd，用 console 模拟 message
const message = {
  info: (content: string, _duration?: number) => {
    // eslint-disable-next-line no-console
    console.log(content)
  },
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type { StatusGroup } from './sankeyRules'

export interface IncomeEntry {
  id: string
  date: string
  displayDate: string
  amount: number // 万元, 0 = date marker only
  status: StatusGroup
  isToday?: boolean
  isFuture?: boolean
  isUnpaid?: boolean
}

export interface Milestone {
  id: string
  name: string
  budgetMin: number
  budgetMax: number
  dueDate: string
}

export interface Order {
  id: string
  number: string
  title: string
  status: StatusGroup
  milestoneId: string
  budgetMin: number
  budgetMax: number
  /** 状态码，如 S01、S07 */
  statusCode?: string
  /** 状态名称，如 意向沟通中、订单验收中 */
  statusName?: string
  /** 用于组内日期排序 */
  date?: string
}

/** Optional data prop: when provided, Sankey uses this instead of built-in mock. */
export interface BudgetSankeyData {
  incomeEntries: IncomeEntry[]
  milestones: Milestone[]
  orders: Order[]
  totalBudget: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const UNPAID_COLOR = '#d0d7d6'
const INCOME_COLOR = '#FBBF24'

/** 演示用：已入金展示值固定 100w，用于总预算柱渐变与页脚，便于客户理解入金 vs 实际消耗 */
const PAID_DISPLAY_DEMO = 30

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INCOME_ENTRIES: IncomeEntry[] = [
  { id: 'inc1', date: '2026-01-10', displayDate: '2026.01.10', amount: 10.0, status: '验收期' },
  { id: 'inc2', date: '2026-02-15', displayDate: '2026.02.15', amount: 25.0, status: '维保期' },
  { id: 'inc3', date: '2026-03-01', displayDate: '2026.03.01', amount: 15.0, status: '交付期' },
  { id: 'inc-today', date: '2026-03-18', displayDate: '今天', amount: 0, status: '订购期', isToday: true },
  // 未入金：预计最晚入金时间
  { id: 'inc-unpaid1', date: '2026-06-30', displayDate: '预计最晚 2026.06.30', amount: 15.0, status: '意向期', isFuture: true, isUnpaid: true },
  { id: 'inc-unpaid2', date: '2026-09-15', displayDate: '预计最晚 2026.09.15', amount: 20.0, status: '意向期', isFuture: true, isUnpaid: true },
  { id: 'inc-unpaid3', date: '2026-12-31', displayDate: '预计最晚 2026.12.31', amount: 15.0, status: '意向期', isFuture: true, isUnpaid: true },
]

const MILESTONES: Milestone[] = [
  { id: 'ms00', name: '里程碑 00-设计意向协议签署', budgetMin: 15.0, budgetMax: 15.0, dueDate: '2026.01.10' },
  { id: 'ms01', name: '里程碑 01-意向方案成果交付', budgetMin: 8.0, budgetMax: 8.0, dueDate: '2026.02.15' },
  { id: 'ms02', name: '里程碑 02-全案框架协议签署', budgetMin: 5.0, budgetMax: 5.0, dueDate: '2026.03.01' },
  { id: 'ms03', name: '里程碑 03-全案设计选品确认', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.03.15' },
  { id: 'ms04', name: '里程碑 04-项目施工许可获批', budgetMin: 3.0, budgetMax: 3.0, dueDate: '2026.04.10' },
  { id: 'ms05', name: '里程碑 05-施工现场筹备完成', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms06', name: '里程碑 06-拆除工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms07', name: '里程碑 07-构建工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms08', name: '里程碑 08-水电工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms09', name: '里程碑 09-防水测试验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms10', name: '里程碑 10-泥水工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms11', name: '里程碑 11-木作工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms12', name: '里程碑 12-涂料工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms13', name: '里程碑 13-空间产品验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms14', name: '里程碑 14-全屋系统验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms15', name: '里程碑 15-表面处理验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms16', name: '里程碑 16-园林景观验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms17', name: '里程碑 17-全案项目交付完成', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms18', name: '里程碑 18-维保升级订单成交', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms19', name: '里程碑 19-维保升级验收完工', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms20', name: '里程碑 20-最终结项验收完毕', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
]

const ORDERS: Order[] = [
  // MS00: 15.0w，3 个订单分属 意向期/交付期/验收期，里程碑取最早 意向期
  { id: 'ord00-1', number: 'ORD-2026-0001', title: '核心机房核心交换机采购', status: '验收期', milestoneId: 'ms00', budgetMin: 12.0, budgetMax: 12.0, statusCode: 'S07', statusName: '订单验收中' },
  { id: 'ord00-2', number: 'ORD-2026-0002', title: '机房防静电地板铺设', status: '交付期', milestoneId: 'ms00', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S06-01', statusName: '交付设计中' },
  { id: 'ord00-3', number: 'ORD-2026-0003', title: '机柜标志标牌', status: '意向期', milestoneId: 'ms00', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S01', statusName: '意向沟通中' },

  // MS01: 8.0w，3 个订单分属 订购期/验收期/维保期，里程碑取最早 订购期
  { id: 'ord01-1', number: 'ORD-2026-0004', title: '智能化中央控制系统年度巡检', status: '维保期', milestoneId: 'ms01', budgetMin: 6.0, budgetMax: 6.0, statusCode: 'S10', statusName: '订单维保中' },
  { id: 'ord01-2', number: 'ORD-2026-0005', title: '摄像头支架更换', status: '验收期', milestoneId: 'ms01', budgetMin: 1.5, budgetMax: 1.5, statusCode: 'S09', statusName: '订单整改中' },
  { id: 'ord01-3', number: 'ORD-2026-0006', title: '系统软件小版本升级', status: '订购期', milestoneId: 'ms01', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S03', statusName: '订购确认中' },

  // MS02 (交付期): 5.0w
  { id: 'ord02-1', number: 'ORD-2026-0007', title: '暖通空调主机交付', status: '交付期', milestoneId: 'ms02', budgetMin: 3.5, budgetMax: 3.5, statusCode: 'S06-01', statusName: '交付设计中' },
  { id: 'ord02-2', number: 'ORD-2026-0008', title: '末端风口配送', status: '交付期', milestoneId: 'ms02', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S06-02', statusName: '方案汇报中' },
  { id: 'ord02-3', number: 'ORD-2026-0009', title: '辅材辅料打包', status: '交付期', milestoneId: 'ms02', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S06-03', statusName: '交付备货中' },

  // MS03 (订购期): 4.0w
  { id: 'ord03-1', number: 'ORD-2026-0010', title: '意向转提案合同', status: '订购期', milestoneId: 'ms03', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S03', statusName: '订购确认中' },
  { id: 'ord03-2', number: 'ORD-2026-0011', title: '材料样品打样', status: '订购期', milestoneId: 'ms03', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-01', statusName: '提案设计中' },
  { id: 'ord03-3', number: 'ORD-2026-0012', title: '初期选品会审', status: '订购期', milestoneId: 'ms03', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-02', statusName: '订购报价中' },

  // MS04 (订购期): 3.0w
  { id: 'ord04-1', number: 'ORD-2026-0013', title: '幕墙玻璃大样', status: '订购期', milestoneId: 'ms04', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S03', statusName: '订购确认中' },
  { id: 'ord04-2', number: 'ORD-2026-0014', title: '龙骨材料订购', status: '订购期', milestoneId: 'ms04', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-01', statusName: '提案设计中' },
  { id: 'ord04-3', number: 'ORD-2026-0015', title: '密封结构胶', status: '订购期', milestoneId: 'ms04', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-02', statusName: '订购报价中' },

  // MS05 - MS20 (意向期): 每组 3 个种子单项，模拟海量储备
  { id: 'ord05-1', number: 'ORD-2026-0016', title: '全案储备-基础施工', status: '意向期', milestoneId: 'ms05', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord05-2', number: 'ORD-2026-0017', title: '全案储备-水电改造', status: '意向期', milestoneId: 'ms05', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord05-3', number: 'ORD-2026-0018', title: '全案储备-地面找平', status: '意向期', milestoneId: 'ms05', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord06-1', number: 'ORD-2026-0019', title: '全案储备-木作吊顶', status: '意向期', milestoneId: 'ms06', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord06-2', number: 'ORD-2026-0020', title: '全案储备-内切封口', status: '意向期', milestoneId: 'ms06', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord06-3', number: 'ORD-2026-0021', title: '全案储备-表面打磨', status: '意向期', milestoneId: 'ms06', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord07-1', number: 'ORD-2026-0022', title: '全案储备-瓷砖铺贴', status: '意向期', milestoneId: 'ms07', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord07-2', number: 'ORD-2026-0023', title: '全案储备-填缝美缝', status: '意向期', milestoneId: 'ms07', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord07-3', number: 'ORD-2026-0024', title: '全案储备-阳角磨边', status: '意向期', milestoneId: 'ms07', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord08-1', number: 'ORD-2026-0025', title: '全案储备-油漆涂料', status: '意向期', milestoneId: 'ms08', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord08-2', number: 'ORD-2026-0026', title: '全案储备-底漆修补', status: '意向期', milestoneId: 'ms08', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord08-3', number: 'ORD-2026-0027', title: '全案储备-面刷滚刷', status: '意向期', milestoneId: 'ms08', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord09-1', number: 'ORD-2026-0028', title: '全案储备-卫浴洁具', status: '意向期', milestoneId: 'ms09', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord09-2', number: 'ORD-2026-0029', title: '全案储备-五金挂件', status: '意向期', milestoneId: 'ms09', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord09-3', number: 'ORD-2026-0030', title: '全案储备-打胶密封', status: '意向期', milestoneId: 'ms09', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord10-1', number: 'ORD-2026-0031', title: '全案储备-灯具选购', status: '意向期', milestoneId: 'ms10', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord10-2', number: 'ORD-2026-0032', title: '全案储备-开关插座', status: '意向期', milestoneId: 'ms10', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord10-3', number: 'ORD-2026-0033', title: '全案储备-布线校准', status: '意向期', milestoneId: 'ms10', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord11-1', number: 'ORD-2026-0034', title: '全案储备-软装窗帘', status: '意向期', milestoneId: 'ms11', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord11-2', number: 'ORD-2026-0035', title: '全案储备-窗轨安装', status: '意向期', milestoneId: 'ms11', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord11-3', number: 'ORD-2026-0036', title: '全案储备-垂挂调试', status: '意向期', milestoneId: 'ms11', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord12-1', number: 'ORD-2026-0037', title: '全案储备-全屋保洁', status: '意向期', milestoneId: 'ms12', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord12-2', number: 'ORD-2026-0038', title: '全案储备-甲醛检测', status: '意向期', milestoneId: 'ms12', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord12-3', number: 'ORD-2026-0039', title: '全案储备-异味清除', status: '意向期', milestoneId: 'ms12', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord13-1', number: 'ORD-2026-0040', title: '全案储备-智能安防', status: '意向期', milestoneId: 'ms13', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord13-2', number: 'ORD-2026-0041', title: '全案储备-报警系统', status: '意向期', milestoneId: 'ms13', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord13-3', number: 'ORD-2026-0042', title: '全案储备-中控调绘', status: '意向期', milestoneId: 'ms13', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord14-1', number: 'ORD-2026-0043', title: '全案储备-环境监测', status: '意向期', milestoneId: 'ms14', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord14-2', number: 'ORD-2026-0044', title: '全案储备-PM2.5监控', status: '意向期', milestoneId: 'ms14', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord14-3', number: 'ORD-2026-0045', title: '全案储备-过滤耗材', status: '意向期', milestoneId: 'ms14', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord15-1', number: 'ORD-2026-0046', title: '全案储备-净水系统', status: '意向期', milestoneId: 'ms15', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord15-2', number: 'ORD-2026-0047', title: '全案储备-滤芯预埋', status: '意向期', milestoneId: 'ms15', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord15-3', number: 'ORD-2026-0048', title: '全案储备-水路加压', status: '意向期', milestoneId: 'ms15', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord16-1', number: 'ORD-2026-0049', title: '全案储备-网络覆盖', status: '意向期', milestoneId: 'ms16', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord16-2', number: 'ORD-2026-0050', title: '全案储备-AP部署', status: '意向期', milestoneId: 'ms16', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord16-3', number: 'ORD-2026-0051', title: '全案储备-路由调优', status: '意向期', milestoneId: 'ms16', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord17-1', number: 'ORD-2026-0052', title: '全案储备-备用电源', status: '意向期', milestoneId: 'ms17', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord17-2', number: 'ORD-2026-0053', title: '全案储备-UPS安装', status: '意向期', milestoneId: 'ms17', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord17-3', number: 'ORD-2026-0054', title: '全案储备-续航测试', status: '意向期', milestoneId: 'ms17', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord18-1', number: 'ORD-2026-0055', title: '全案储备-维保协议', status: '意向期', milestoneId: 'ms18', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord18-2', number: 'ORD-2026-0056', title: '全案储备-权益细化', status: '意向期', milestoneId: 'ms18', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord18-3', number: 'ORD-2026-0057', title: '全案储备-客户回访', status: '意向期', milestoneId: 'ms18', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord19-1', number: 'ORD-2026-0058', title: '全案储备-结项报告', status: '意向期', milestoneId: 'ms19', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord19-2', number: 'ORD-2026-0059', title: '全案储备-手册编制', status: '意向期', milestoneId: 'ms19', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord19-3', number: 'ORD-2026-0060', title: '全案储备-流程归档', status: '意向期', milestoneId: 'ms19', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord20-1', number: 'ORD-2026-0061', title: '全案储备-尾款核算', status: '意向期', milestoneId: 'ms20', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord20-2', number: 'ORD-2026-0062', title: '全案储备-票据开具', status: '意向期', milestoneId: 'ms20', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord20-3', number: 'ORD-2026-0063', title: '全案储备-满意度调查', status: '意向期', milestoneId: 'ms20', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },
]


const TOTAL_BUDGET = 30 // 万元

// ─── Layout Config ────────────────────────────────────────────────────────────

const VB_W = 1200

const X = {
  // 移除入金层后，总预算从左侧起始
  budgetLeft: 30,
  get budgetRight() { return this.budgetLeft + 44 }, // 总预算柱子本身宽度固定44
  get allocLeft() { return this.budgetRight + UI_CONFIG.GAP_BUDGET_TO_MS },   // 预算分配柱（原里程碑位置）
  get allocRight() { return this.allocLeft + 44 },  // 预算分配柱宽度与总预算一致
  get ordLeft() { return this.allocRight + UI_CONFIG.GAP_MS_TO_ORD },
  get ordRight() { return this.ordLeft + 250  },      // 订单容器自身宽度固定184
}

const CHART_TOP_MARGIN = 72
const CHART_BOTTOM_MARGIN = 50

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rgba(hex: string, a: number): string {
  if (!hex) return `rgba(208,215,214,${a})`
  // 处理带 # 的色号
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function bandPath(
  x1: number,
  top1: number,
  bot1: number,
  x2: number,
  top2: number,
  bot2: number,
  curveRatio: number = 0.5
): string {
  const mx = x1 + (x2 - x1) * curveRatio
  return (
    `M${x1},${top1} C${mx},${top1} ${mx},${top2} ${x2},${top2}` +
    ` L${x2},${bot2} C${mx},${bot2} ${mx},${bot1} ${x1},${bot1} Z`
  )
}


// ─── 用户可见 UI 配置参数 ──────────────────────────────────────────────────
const UI_CONFIG = {
  /** 
   * 视觉缩放系数 (Height Scale Factor)
   * 如果觉得图表太臃肿，可调小此值（如 0.6）；如果觉得太扁平，可调大（如 1.2）。
   */
  HEIGHT_SCALE: 1.0,

  // TOTAL_HEIGHT: 1200, (已由倒推算法接管)
  /** 全部收起时每组球的最小高度（调小=更矮，调大=更高） */
  COLLAPSED_GROUP_MIN_H: 30,
  /** 收起态高度按组金额比例微调时的缩放系数（调小=更矮，调大=更高） */
  COLLAPSED_HEIGHT_SCALE: 0.09,
  // 调节指南：[订单物理高度底座] 每个订单板块的最低保底像素高度。
  ORDER_MIN_H: 40,
  // 调节指南：[订单垂直间距] 最右侧订单板块之间留出的纵向缝隙。
  ORD_GAP: 20,

  // 调节指南：[节点自身透明度] 里程碑与订单本身的高亮层级
  OPACITY_NODE_NORMAL: 1,    // 鼠标未悬停或聚焦自身时的正常透明度
  OPACITY_NODE_MUTED: 0.5,  // 鼠标聚焦在其他节点时的变暗弱化透明度

  // 调节指南：[右侧主线连线透明度] 里程碑与订单区域连流向的透明感
  OPACITY_BAND_NORMAL: 0.1, // 鼠标未悬停时的默认透明度
  OPACITY_BAND_HOVER: 0.3,   // 鼠标悬停聚焦时的透明度（高亮强调）
  OPACITY_BAND_MUTED: 0.1,  // 鼠标悬停在其他节点时，未被聚焦连线的透明度（变暗弱化）

  // 调节指南：[连线平滑曲率] 收紧/转弯的位置占比
  // 0.5 为默认（在中点折弯）；越靠近 1，连线会越晚折向右侧节点；靠近 0 则提早折弯
  FLOW_CURVE_RATIO: 0.5,

  // 调节指南：[各级大版块横向间距] 调整相邻两大容器版块之间的“水管/连线”的物理宽度
  GAP_BUDGET_TO_MS: 150,   // 总预算层 -> 里程碑层 的连线距离
  GAP_MS_TO_ORD: 160,      // 里程碑层 -> 订单追踪 的连线距离
}

// ─── Computed Layout ──────────────────────────────────────────────────────────

/** 兼容上游：优先 budgetMin/budgetMax，兜底旧字段 budget，防止布局塌陷 */
function getOrderBudgetMid(o: { budgetMin?: number; budgetMax?: number; budget?: number }): number {
  if (typeof o.budgetMin === 'number' && typeof o.budgetMax === 'number') return (o.budgetMin + o.budgetMax) / 2
  const b = (o as { budget?: number }).budget
  if (typeof b === 'number') return b
  return 0
}

// ─── 三类预算分组（意向 / 授权 / 结算，按 statusCode 映射）────────────────────────
export type AllocGroupId = 'groupA' | 'groupB' | 'groupC'

const ALLOC_GROUPS: { id: AllocGroupId; label: string; segmentLabel: string; codes: string[]; color: string }[] = [
  { id: 'groupA', label: '意向+订购', segmentLabel: '意向', codes: ['S00', 'S01', 'S02', 'S03', 'S05'], color: STATUS_COLORS['意向期'] },
  { id: 'groupB', label: '交付+验收', segmentLabel: '授权', codes: ['S06', 'S07', 'S08', 'S09', 'S13'], color: STATUS_COLORS['验收期'] },
  { id: 'groupC', label: '维保', segmentLabel: '结算', codes: ['S10', 'S11', 'S12'], color: STATUS_COLORS['维保期'] },
]

function getStatusCode(ord: Order): string | undefined {
  if (ord.statusCode) return ord.statusCode
  const m = String(ord.status || '').match(/^S\d{2}(-\d{2})?/)
  return m?.[0]
}

/** 按 statusCode 归组，S04 返回 null 表示排除 */
function getOrderAllocGroup(ord: Order): AllocGroupId | null {
  const code = getStatusCode(ord)
  if (!code || code.startsWith('S04')) return null
  for (const g of ALLOC_GROUPS) {
    if (g.codes.some((c) => code === c || code.startsWith(c + '-'))) return g.id
  }
  return null
}

function getOrderSortDate(ord: Order, milestones: Milestone[]): string {
  if (ord.date) return ord.date
  const ms = milestones.find((m) => m.id === ord.milestoneId)
  return ms?.dueDate ?? ord.id
}

function useLayout(
  incomeEntries: IncomeEntry[],
  milestones: Milestone[],
  orders: Order[],
  totalBudget: number,
  expandedGroupIds: AllocGroupId[]
) {
  return useMemo(() => {
    const ORD_GAP = 20
    const GROUP_GAP = 12

    // ---- 1. 过滤 S04 并按三类分组，组内按日期升序 ----
    const filteredOrders = orders.filter((o) => getOrderAllocGroup(o) !== null)
    const groupOrders: Record<AllocGroupId, Order[]> = { groupA: [], groupB: [], groupC: [] }
    for (const ord of filteredOrders) {
      const g = getOrderAllocGroup(ord)!
      groupOrders[g].push(ord)
    }
    for (const g of ALLOC_GROUPS) {
      groupOrders[g.id].sort((a, b) =>
        getOrderSortDate(a, milestones).localeCompare(getOrderSortDate(b, milestones)) || a.id.localeCompare(b.id)
      )
    }

    // ---- 2. 比例尺 ----
    const validOrders = filteredOrders.filter((o) => getOrderBudgetMid(o) > 0)
    const minOrderBudget = validOrders.length > 0 ? Math.min(...validOrders.map((o) => getOrderBudgetMid(o))) : 1
    const pxPerWan = (40 / minOrderBudget) * UI_CONFIG.HEIGHT_SCALE

    // ---- 3. 组布局与订单布局 ----
    const groupLayout: { id: AllocGroupId; y: number; h: number; budget: number; orders: Order[] }[] = []
    const ordLayout: (Order & { y: number; h: number; isExpanded: boolean; groupId: AllocGroupId })[] = []
    const collapsedLayout: { id: string; groupId: AllocGroupId; y: number; h: number; count: number; isExpanded: boolean }[] = []

    let currentY = CHART_TOP_MARGIN

    for (const g of ALLOC_GROUPS) {
      const ords = groupOrders[g.id]
      const isExpanded = expandedGroupIds.includes(g.id)
      const groupBudget = ords.reduce((s, o) => s + getOrderBudgetMid(o), 0)

      let groupH: number
      if (ords.length === 0) {
        groupH = 0
      } else if (isExpanded) {
        let innerY = currentY
        ords.forEach((ord) => {
          const h = Math.max(UI_CONFIG.ORDER_MIN_H, getOrderBudgetMid(ord) * pxPerWan)
          ordLayout.push({ ...ord, y: innerY, h, isExpanded: true, groupId: g.id })
          innerY += h + ORD_GAP
        })
        groupH = innerY - ORD_GAP - currentY
      } else {
        const proportionalH = groupBudget * pxPerWan * UI_CONFIG.COLLAPSED_HEIGHT_SCALE
        groupH = Math.max(UI_CONFIG.COLLAPSED_GROUP_MIN_H, proportionalH)
        ords.forEach((ord) => {
          const ballY = currentY + groupH / 2
          ordLayout.push({ ...ord, y: ballY - 2, h: 4, isExpanded: false, groupId: g.id })
        })
      }

      if (ords.length > 0) {
        groupLayout.push({ id: g.id, y: currentY, h: groupH, budget: groupBudget, orders: ords })
        collapsedLayout.push({
          id: `col_${g.id}`,
          groupId: g.id,
          y: currentY,
          h: Math.max(40, groupH),
          count: ords.length,
          isExpanded: isExpanded,
        })
      }

      if (groupH > 0) currentY += groupH + GROUP_GAP
    }

    const budgetBot = currentY - GROUP_GAP
    const budgetTotalH = budgetBot - CHART_TOP_MARGIN

    // ---- 4. 预算分配柱三段（按组金额占比） ----
    const totalOrderBudget = filteredOrders.reduce((s, o) => s + getOrderBudgetMid(o), 0) || 1
    let allocAccumY = CHART_TOP_MARGIN
    const allocSegments = ALLOC_GROUPS.map((g) => {
      const budget = groupOrders[g.id].reduce((s, o) => s + getOrderBudgetMid(o), 0)
      const ratio = budget / totalOrderBudget
      const h = Math.max(4, budgetTotalH * ratio)
      const seg = { id: g.id, y: allocAccumY, h, color: g.color, segmentLabel: g.segmentLabel }
      allocAccumY += h
      return seg
    })

    return {
      groupLayout,
      ordLayout,
      collapsedLayout,
      allocSegments,
      budgetTop: CHART_TOP_MARGIN,
      budgetH: budgetTotalH,
      VB_H: budgetBot + CHART_BOTTOM_MARGIN,
      totalBudget,
      pxPerWan,
    }
  }, [incomeEntries, milestones, orders, totalBudget, expandedGroupIds])
}

// ─── Legend Component ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {STATUS_LIST.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className="shrink-0 rounded-full inline-block"
            style={{ width: 8, height: 8, background: STATUS_COLORS[s] }}
          />
          <span className="text-gray-500" style={{ fontSize: 12 }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface BudgetSankeyWorkbenchProps {
  /** When provided, use this data instead of built-in mock. */
  data?: BudgetSankeyData | null
  /** Optional subtitle (e.g. project name). */
  subtitle?: string
  /** Override main heading (e.g. 订单预算树). */
  title?: string
  /** 外层已由面板包卡片时去掉内层白底卡片 */
  unstyled?: boolean
  /** 仅在需要时启用：SVG 宽度 100% 自适应（会联动高度） */
  responsive?: boolean
}

const ANIM_MS = 400
const ANIM_EASE = [0.4, 0, 0.2, 1] as const
const animStyle = { transition: `all ${ANIM_MS}ms cubic-bezier(${ANIM_EASE.join(',')})` }

function BudgetSankeyWorkbench({ data, subtitle, title, unstyled, responsive = true }: BudgetSankeyWorkbenchProps = {}) {
  const incomeEntries = data?.incomeEntries ?? INCOME_ENTRIES
  const rawMilestones = data?.milestones ?? MILESTONES
  const orders = data?.orders ?? ORDERS
  const totalBudget = data?.totalBudget ?? TOTAL_BUDGET

  // 动态向上汇总：里程碑的金额区间 100% 由子订单推导而来，确保绝对守恒
  const milestones = useMemo(() => {
    return rawMilestones.map((ms) => {
      const children = orders.filter((o) => o.milestoneId === ms.id)
      if (children.length === 0) return ms
      const budgetMin = children.reduce((s, o) => s + (o.budgetMin ?? (o as { budget?: number }).budget ?? 0), 0)
      const budgetMax = children.reduce((s, o) => s + (o.budgetMax ?? (o as { budget?: number }).budget ?? 0), 0)
      return {
        ...ms,
        budgetMin: Number(budgetMin.toFixed(2)),
        budgetMax: Number(budgetMax.toFixed(2))
      }
    })
  }, [rawMilestones, orders])

  const navigate = useNavigate()
  const [expandedGroupIds, setExpandedGroupIds] = useState<AllocGroupId[]>(['groupA', 'groupB', 'groupC'])
  const [hovered, setHovered] = useState<string | null>(null)

  const layout = useLayout(incomeEntries, milestones, orders, totalBudget, expandedGroupIds)
  const {
    groupLayout,
    ordLayout,
    collapsedLayout,
    allocSegments,
    budgetTop,
    budgetH,
    VB_H,
    totalBudget: layoutTotalBudget,
  } = layout

  const isLit = useCallback(
    (id: string): boolean => {
      if (!hovered) return true
      if (hovered === id) return true
      if (hovered.startsWith('ord')) {
        const ord = ordLayout.find((o) => o.id === hovered)
        if (!ord) return false
        return id === hovered || id === ord.groupId
      }
      if (hovered.startsWith('col-')) {
        const gId = hovered.replace('col-', '') as AllocGroupId
        return id === gId || id === hovered
      }
      return true
    },
    [hovered, ordLayout]
  )

  const handleBudgetClick = useCallback(() => {
    message.info(`预计总预算：¥${layoutTotalBudget}w`, 3)
  }, [layoutTotalBudget])

  const handleOrderClick = useCallback(
    (ord: Order) => {
      const orderId = ord.id.startsWith('ord_') ? ord.number : ord.id
      navigate(`/order/${orderId}`)
    },
    [navigate]
  )

  const allExpanded = expandedGroupIds.length === 3
  const toggleAll = () => {
    if (allExpanded) setExpandedGroupIds([])
    else setExpandedGroupIds(['groupA', 'groupB', 'groupC'])
  }

  const budgetGradientStops = useMemo(() => {
    const incomeRatio = layoutTotalBudget > 0 ? (PAID_DISPLAY_DEMO / layoutTotalBudget) : 0
    const boundary = (1 - incomeRatio) * 100
    return [
      { offset: '0%', color: UNPAID_COLOR },
      { offset: `${boundary}%`, color: UNPAID_COLOR },
      { offset: `${boundary}%`, color: INCOME_COLOR },
      { offset: '100%', color: INCOME_COLOR },
    ]
  }, [layoutTotalBudget, budgetH])

  const chartBg = '#F9FAFB'

  const outerCls = unstyled
    ? 'w-full overflow-hidden'
    : 'w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
  const headCls = unstyled
    ? 'flex flex-wrap items-center justify-between gap-3 pb-3 mb-1'
    : 'flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100'
  const footCls = unstyled
    ? 'px-0 pt-3 mt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2'
    : 'px-5 py-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2'

  return (
    <div className={outerCls}>
      {/* Header */}
      <div className={headCls}>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-gray-800 leading-tight font-bold">{title ?? "项目预算桑基图"}</h2>
            <p className="text-gray-400 leading-snug mt-0.5" style={{ fontSize: 12 }}>
              {subtitle ?? "Design Voyage"} · 总预算 {layoutTotalBudget}w
            </p>
          </div>
          <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100 ml-2">
            <button
              onClick={toggleAll}
              className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${allExpanded ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:text-blue-600 hover:bg-white"
                }`}
            >
              {allExpanded ? "全部收起" : "全部展开"}
            </button>
          </div>
        </div>
        <Legend />
      </div>


      {/* 2. SVG Chart Area */}
      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: VB_W }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={responsive ? '100%' : VB_W}
            className={responsive ? 'block h-auto max-w-none' : undefined}
            preserveAspectRatio={responsive ? 'xMidYMid meet' : undefined}
            style={responsive ? undefined : { display: 'block' }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              {/* Main Budget Column Gradient (Dynamic Rainbow + Gray) */}
              <linearGradient id="gradBudget" x1="0" y1="0" x2="0" y2="1">
                {budgetGradientStops.map((stop, idx) => (
                  <stop key={idx} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
              <clipPath id="alloc-col-clip">
                <rect
                  x={X.allocLeft}
                  y={budgetTop}
                  width={X.allocRight - X.allocLeft}
                  height={budgetH}
                  rx={7}
                />
              </clipPath>
              {/* Flow gradients: alloc segment color → order/ball color */}
              {ordLayout.map((ord) => {
                const g = ALLOC_GROUPS.find((x) => x.id === ord.groupId)!
                const ordColor = STATUS_COLORS[getOrderPhaseForColor(ord)]
                return (
                  <linearGradient key={`ofg-${ord.id}`} id={`ofg-${ord.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={g.color} />
                    <stop offset="100%" stopColor={ordColor} />
                  </linearGradient>
                )
              })}
            </defs>

            {/* Background */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill={chartBg} />

            {/* Column labels */}
            {[
              { cx: (X.budgetLeft + X.budgetRight) / 2, label: '总预算' },
              { cx: (X.allocLeft + X.allocRight) / 2, label: '预算进度' },
              { cx: (X.ordLeft + X.ordRight) / 2, label: '订单追踪' },
            ].map(({ cx, label }) => (
              <text key={label} x={cx} y={50} textAnchor="middle" fill="#6B7280" fontSize={14} fontWeight={600}>{label}</text>
            ))}

            {/* Main Budget Column: Single layer with gradient for Paid-to-Unpaid transition */}
            <g
              style={{ cursor: 'pointer' }}
              onClick={handleBudgetClick}
              onMouseEnter={() => setHovered('budget')}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={X.budgetLeft}
                y={budgetTop}
                width={X.budgetRight - X.budgetLeft}
                height={budgetH}
                rx={7}
                fill="url(#gradBudget)"
                style={animStyle}
              />
              <text
                x={(X.budgetLeft + X.budgetRight) / 2}
                y={budgetTop - 8}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
                fontWeight={600}
              >
                ¥{layoutTotalBudget}w
              </text>
            </g>

            {/* Flow: 总预算柱彩色部分 → 预算进度柱（入金流向） */}
            {(() => {
              const incomeRatio = layoutTotalBudget > 0 ? PAID_DISPLAY_DEMO / layoutTotalBudget : 0
              const coloredTop = budgetTop + (1 - incomeRatio) * budgetH
              const coloredBot = budgetTop + budgetH
              if (coloredBot <= coloredTop + 4) return null
              return (
                <path
                  d={bandPath(X.budgetRight, coloredTop, coloredBot, X.allocLeft, coloredTop, coloredBot, UI_CONFIG.FLOW_CURVE_RATIO)}
                  fill={INCOME_COLOR}
                  opacity={0.15}
                  style={{ ...animStyle, cursor: 'pointer' }}
                  onMouseEnter={() => setHovered('budget')}
                  onClick={toggleAll}
                />
              )
            })()}

            {/* 预算分配柱：三段色块（意向+订购 / 交付+验收 / 维保） */}
            <g
              style={{ cursor: 'pointer' }}
              onClick={handleBudgetClick}
              onMouseEnter={() => setHovered('alloc')}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={X.allocLeft}
                y={budgetTop}
                width={X.allocRight - X.allocLeft}
                height={budgetH}
                rx={7}
                fill="#F8FAFC"
              />
              <g clipPath="url(#alloc-col-clip)">
                {allocSegments.map((seg) => (
                  <g key={seg.id}>
                    <rect
                      x={X.allocLeft}
                      y={seg.y}
                      width={X.allocRight - X.allocLeft}
                      height={seg.h}
                      fill={seg.color}
                      opacity={0.85}
                      style={animStyle}
                    />
                    <text
                      x={(X.allocLeft + X.allocRight) / 2}
                      y={seg.y + seg.h / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#374151"
                      fontSize={12}
                      fontWeight={600}
                    >
                      {seg.segmentLabel}
                    </text>
                  </g>
                ))}
              </g>
              <rect
                x={X.allocLeft}
                y={budgetTop}
                width={X.allocRight - X.allocLeft}
                height={budgetH}
                rx={7}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={1}
              />
            </g>

            {/* Flow: 预算分配柱 → 订单（展开）或组球（收起，漏斗形收束） */}
            {groupLayout.flatMap((grp) => {
              const seg = allocSegments.find((s) => s.id === grp.id)
              if (!seg || grp.orders.length === 0) return []
              const isExpanded = expandedGroupIds.includes(grp.id)
              const g = ALLOC_GROUPS.find((x) => x.id === grp.id)!
              const bandMuted = hovered && hovered !== 'alloc' && !hovered.startsWith('ord') && !hovered.startsWith('col-')
                ? UI_CONFIG.OPACITY_BAND_MUTED
                : UI_CONFIG.OPACITY_BAND_NORMAL

              if (isExpanded) {
                let acc = 0
                const totalB = grp.budget || 1
                return grp.orders.map((ord) => {
                  const segTop = seg.y + (acc / totalB) * seg.h
                  const segBot = seg.y + ((acc + getOrderBudgetMid(ord)) / totalB) * seg.h
                  acc += getOrderBudgetMid(ord)
                  const ol = ordLayout.find((o) => o.id === ord.id)
                  if (!ol) return null
                  const ordLit = !hovered || hovered === ord.id || hovered === grp.id
                  return (
                    <path
                      key={`flow-${grp.id}-${ord.id}`}
                      style={{ ...animStyle, cursor: 'pointer' }}
                      d={bandPath(X.allocRight, segTop, segBot, X.ordLeft, ol.y, ol.y + ol.h, UI_CONFIG.FLOW_CURVE_RATIO)}
                      fill={`url(#ofg-${ord.id})`}
                      opacity={ordLit ? UI_CONFIG.OPACITY_BAND_HOVER : bandMuted}
                      onMouseEnter={() => setHovered(ord.id)}
                      onClick={toggleAll}
                    />
                  )
                }).filter((x): x is React.ReactElement => x != null)
              }
              const col = collapsedLayout.find((c) => c.groupId === grp.id)
              if (!col || col.isExpanded) return []
              const centerY = col.y + col.h / 2
              const colLit = !hovered || hovered === `col-${grp.id}` || hovered === grp.id
              return [
                <path
                  key={`flow-${grp.id}`}
                  style={{ ...animStyle, cursor: 'pointer' }}
                  d={bandPath(X.allocRight, seg.y, seg.y + seg.h, X.ordLeft, centerY - 1, centerY + 1, UI_CONFIG.FLOW_CURVE_RATIO)}
                  fill={g.color}
                  opacity={colLit ? 0.3 : 0.05}
                  onMouseEnter={() => setHovered(`col-${grp.id}`)}
                  onClick={toggleAll}
                />,
              ]
            })}

            {ordLayout.map((ord) => {
              const c = STATUS_COLORS[getOrderPhaseForColor(ord)]
              const lit = isLit(ord.id)
              const bw = X.ordRight - X.ordLeft
              const h = ord.h

              return (
                <motion.g
                  key={`ogroup-${ord.id}`}
                  initial={false}
                  animate={{
                    opacity: ord.isExpanded ? (lit ? UI_CONFIG.OPACITY_NODE_NORMAL : UI_CONFIG.OPACITY_NODE_MUTED) : 0,
                  }}
                  transition={{ duration: ANIM_MS / 1000, ease: [...ANIM_EASE] }}
                  style={{ cursor: 'pointer', pointerEvents: ord.isExpanded ? 'auto' : 'none' }}
                  onMouseEnter={() => setHovered(ord.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleOrderClick(ord)}
                >
                  <rect
                    style={animStyle}
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill={rgba(c, 0.07)}
                  />
                  <rect
                    style={animStyle}
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill="none"
                    stroke={rgba(c, 0.3)}
                    strokeWidth={1}
                  />
                  <rect
                    style={animStyle}
                    x={X.ordRight - 4}
                    y={ord.y}
                    width={4}
                    height={h}
                    rx={2}
                    fill={c}
                    opacity={0.8}
                  />

                  <circle
                    style={animStyle}
                    cx={X.ordLeft + 11}
                    cy={ord.y + 14}
                    r={3.5}
                    fill={c}
                    opacity={0.7}
                  />

                  <text
                    style={animStyle}
                    x={X.ordLeft + 20}
                    y={ord.y + 19}
                    fill="#1F2937"
                    fontSize={13}
                    fontWeight={600}
                  >
                    {ord.title}
                  </text>
                  <text
                    style={animStyle}
                    x={X.ordLeft + 20}
                    y={ord.y + 36}
                    fill="#6B7280"
                    fontSize={11}
                    fontWeight={400}
                  >
                    ¥{ord.budgetMin === ord.budgetMax ? ord.budgetMin : ord.budgetMin + '~' + ord.budgetMax}w · {ord.statusCode && ord.statusName ? `${ord.statusCode}-${ord.statusName}` : (ord.statusName ?? formatStatusDisplay(ord))}
                  </text>
                </motion.g>
              )
            })}

            {collapsedLayout.map((col) => {
              const g = ALLOC_GROUPS.find((x) => x.id === col.groupId)!
              const c = g.color
              const centerY = col.y + col.h / 2
              const lit = isLit(col.groupId) && isLit(`col-${col.groupId}`)
              return (
                <motion.g
                  key={col.id}
                  initial={false}
                  animate={{
                    opacity: col.isExpanded ? 0 : lit ? 1 : 0.35,
                  }}
                  transition={{ duration: ANIM_MS / 1000, ease: [...ANIM_EASE] }}
                  style={{
                    cursor: 'pointer',
                    pointerEvents: col.isExpanded ? 'none' : 'auto',
                  }}
                  onClick={() => (col.isExpanded ? undefined : toggleAll())}
                  onMouseEnter={() => setHovered(`col-${col.groupId}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle style={animStyle} cx={X.ordLeft + 26} cy={centerY} r={20} fill={c} opacity={0.15} />
                  <circle style={animStyle} cx={X.ordLeft + 26} cy={centerY} r={14} fill={c} />
                  <text style={animStyle} x={X.ordLeft + 26} y={centerY + 4} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
                    {col.count}
                  </text>
                  <text style={animStyle} x={X.ordLeft + 56} y={centerY + 4} fill="#6B7280" fontSize={13} fontWeight={500}>
                    {col.isExpanded ? '' : `${g.label} · 展开 ${col.count} 个订单`}
                  </text>
                </motion.g>
              )
            })}

          </svg>
        </div>
      </div>

      <div className={footCls}>
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          横向滑动查看完整图表 · 点击节点查看详情
        </span>
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          已入金 ¥{PAID_DISPLAY_DEMO}w / 总预算 ¥{layoutTotalBudget}w
        </span>
      </div>
    </div>
  )
}

export default BudgetSankeyWorkbench
