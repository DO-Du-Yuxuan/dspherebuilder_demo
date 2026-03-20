/**
 * 需求书修订：指纹、payload 对比、详情文本（与 Home WorkbenchPage 对齐）
 */
import type { FormData, RequirementsMember } from '../types'

const COMFORT_SYSTEM_LABEL_ALIASES: Record<string, string> = {
  全屋地暖: '地暖系统',
  全屋净水软水: '全屋净水',
}

/** 与 Home `normalizeComfortSystemLabels` 一致，保证指纹/详情与选项文案对齐 */
export function normalizeComfortSystemLabels(labels: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const l of labels) {
    const c = COMFORT_SYSTEM_LABEL_ALIASES[l] ?? l
    if (!seen.has(c)) {
      seen.add(c)
      out.push(c)
    }
  }
  return out
}

export type RequirementDocPayloadShape = {
  projectLocation?: string
  projectType?: string
  projectArea?: string
  budgetStandard?: string
  timeline?: string
  houseUsage?: string
  lighting?: string
  ceilingHeight?: string
  ventilation?: string
  noise?: string
  smartHomeOptions?: string[]
  devices?: string[]
  otherNeeds?: string
  comfortSystems?: string[]
  fengshui?: string
  storageFocus?: string[]
  spaceOtherNote?: string
  livingRoomNote?: string
  diningNote?: string
  kitchenNote?: string
  bathroomNote?: string
  coreSpaces?: string
  customCoreSpaceOptions?: string[]
  childGrowth?: string
  guestStay?: string
  futureChanges?: string
  requirementsMembers?: RequirementsMember[]
  floorPlanImages?: Array<{ name: string; url?: string }>
  siteMedia?: Array<{ name: string; url?: string; kind?: string }>
  customSpaceItems?: Array<{ name: string; description?: string }>
}

export function fingerprintRequirementDocPayload(p: RequirementDocPayloadShape): Record<string, string> {
  const trim = (x?: string) => String(x ?? '').trim()
  return {
    projectOverview: [
      trim(p.projectLocation),
      trim(p.projectType),
      trim(p.projectArea),
      trim(p.budgetStandard),
      trim(p.timeline),
      trim(p.houseUsage),
      trim(p.lighting),
      trim(p.ceilingHeight),
      trim(p.ventilation),
      trim(p.noise),
    ].join('\u0001'),
    spacePlanning: [
      trim(p.coreSpaces),
      JSON.stringify([...(p.customCoreSpaceOptions ?? [])].map((s) => String(s ?? '').trim()).sort()),
      trim(p.childGrowth),
      trim(p.guestStay),
      trim(p.futureChanges),
    ].join('\u0002'),
    smartHome: [...(p.smartHomeOptions ?? [])].sort().join('\u0001'),
    devices: [...(p.devices ?? [])].sort().join('\u0001'),
    otherNeeds: p.otherNeeds ?? '',
    comfort: [...(p.comfortSystems ?? [])].sort().join('\u0001'),
    fengshui: p.fengshui ?? '',
    storage: JSON.stringify([...(p.storageFocus ?? [])].sort()),
    spaceOther: p.spaceOtherNote ?? '',
    living: p.livingRoomNote ?? '',
    dining: p.diningNote ?? '',
    kitchen: p.kitchenNote ?? '',
    bath: p.bathroomNote ?? '',
    coreSpaces: p.coreSpaces ?? '',
    customCore: JSON.stringify([...(p.customCoreSpaceOptions ?? [])].sort()),
    child: p.childGrowth ?? '',
    guest: p.guestStay ?? '',
    future: p.futureChanges ?? '',
    members: JSON.stringify(
      (p.requirementsMembers ?? []).map((m) => ({
        id: m.id,
        n: m.name,
        age: m.age ?? '',
        prof: m.profession ?? '',
        o: m.otherActivityNote ?? '',
        sp: (m.spaces ?? []).map((s) => ({ n: s.name, d: s.description ?? '' })),
      })),
    ),
    fpMeta: `${(p.floorPlanImages ?? []).length}\u0002${[...(p.floorPlanImages ?? []).map((x) => x.name)].sort().join('\u0001')}`,
    smMeta: `${(p.siteMedia ?? []).length}\u0002${[...(p.siteMedia ?? []).map((x) => x.name)].sort().join('\u0001')}`,
    customSpaces: JSON.stringify(
      (p.customSpaceItems ?? []).map((x) => ({ n: x.name, d: x.description ?? '' })),
    ),
  }
}

export const REQUIREMENT_DOC_FINGERPRINT_LABELS: Record<string, string> = {
  projectOverview: '项目概览',
  spacePlanning: '空间规划',
  smartHome: '智能家居',
  devices: '全屋设备',
  otherNeeds: '其他需求说明',
  comfort: '系统设备',
  fengshui: '风水与禁忌',
  storage: '收纳重点',
  spaceOther: '空间其他说明',
  living: '客厅需求',
  dining: '餐厅需求',
  kitchen: '厨房需求',
  bath: '卫生间需求',
  coreSpaces: '核心空间配置',
  customCore: '自定义核心空间',
  child: '儿童成长',
  guest: '访客留宿',
  future: '未来变动',
  members: '成员画像',
  fpMeta: '户型图',
  smMeta: '现场照片/视频',
  customSpaces: '自定义空间需求',
}

export function diffRequirementDocFingerprints(
  before: Record<string, string> | null,
  after: Record<string, string>,
): string[] {
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after)])
  const out: string[] = []
  for (const k of keys) {
    if ((before?.[k] ?? '') !== (after[k] ?? '')) {
      const lb = REQUIREMENT_DOC_FINGERPRINT_LABELS[k]
      if (lb) out.push(lb)
    }
  }
  return out
}

export function payloadModuleHasChange(
  label: string,
  before: RequirementDocPayloadShape | null,
  after: RequirementDocPayloadShape,
): boolean {
  const b = before
  const a = after

  const listEqual = (x?: string[], y?: string[]) => {
    const nx = [...(x ?? [])].map((s) => String(s ?? '').trim()).sort()
    const ny = [...(y ?? [])].map((s) => String(s ?? '').trim()).sort()
    return JSON.stringify(nx) === JSON.stringify(ny)
  }

  const strEqual = (x?: string, y?: string) => String(x ?? '').trim() === String(y ?? '').trim()

  switch (label) {
    case '项目概览':
      return (
        !strEqual(b?.projectLocation, a.projectLocation) ||
        !strEqual(b?.projectType, a.projectType) ||
        !strEqual(b?.projectArea, a.projectArea) ||
        !strEqual(b?.budgetStandard, a.budgetStandard) ||
        !strEqual(b?.timeline, a.timeline) ||
        !strEqual(b?.houseUsage, a.houseUsage) ||
        !strEqual(b?.lighting, a.lighting) ||
        !strEqual(b?.ceilingHeight, a.ceilingHeight) ||
        !strEqual(b?.ventilation, a.ventilation) ||
        !strEqual(b?.noise, a.noise)
      )
    case '空间规划':
      return (
        !strEqual(b?.coreSpaces, a.coreSpaces) ||
        !listEqual(b?.customCoreSpaceOptions, a.customCoreSpaceOptions) ||
        !strEqual(b?.childGrowth, a.childGrowth) ||
        !strEqual(b?.guestStay, a.guestStay) ||
        !strEqual(b?.futureChanges, a.futureChanges)
      )
    case '智能家居':
      return !listEqual(b?.smartHomeOptions, a.smartHomeOptions)
    case '全屋设备':
      return !listEqual(b?.devices, a.devices)
    case '系统设备':
      return !listEqual(b?.comfortSystems, a.comfortSystems)
    case '收纳重点':
      return !listEqual(b?.storageFocus, a.storageFocus)
    case '其他需求说明':
      return !strEqual(b?.otherNeeds, a.otherNeeds)
    case '风水与禁忌':
      return !strEqual(b?.fengshui, a.fengshui)
    case '空间其他说明':
      return !strEqual(b?.spaceOtherNote, a.spaceOtherNote)
    case '客厅需求':
      return !strEqual(b?.livingRoomNote, a.livingRoomNote)
    case '餐厅需求':
      return !strEqual(b?.diningNote, a.diningNote)
    case '厨房需求':
      return !strEqual(b?.kitchenNote, a.kitchenNote)
    case '卫生间需求':
      return !strEqual(b?.bathroomNote, a.bathroomNote)
    case '核心空间配置':
      return !strEqual(b?.coreSpaces, a.coreSpaces)
    case '自定义核心空间':
      return !listEqual(b?.customCoreSpaceOptions, a.customCoreSpaceOptions)
    case '儿童成长':
      return !strEqual(b?.childGrowth, a.childGrowth)
    case '访客留宿':
      return !strEqual(b?.guestStay, a.guestStay)
    case '未来变动':
      return !strEqual(b?.futureChanges, a.futureChanges)
    case '成员画像': {
      const toMembersKey = (members: RequirementsMember[] | undefined) =>
        JSON.stringify(
          (members ?? []).map((m) => ({
            id: m.id,
            name: m.name,
            displayName: m.displayName ?? '',
            age: m.age ?? '',
            profession: m.profession ?? '',
            otherActivityNote: m.otherActivityNote ?? '',
            spaces: (m.spaces ?? []).map((s) => ({ name: s.name, description: s.description ?? '' })),
          })),
        )
      return toMembersKey(b?.requirementsMembers) !== toMembersKey(a.requirementsMembers)
    }
    case '户型图': {
      const toFpKey = (arr: RequirementDocPayloadShape['floorPlanImages']) =>
        JSON.stringify([...(arr ?? [])].map((x) => x.name).sort())
      return toFpKey(b?.floorPlanImages) !== toFpKey(a.floorPlanImages)
    }
    case '现场照片/视频': {
      const toSmKey = (arr: RequirementDocPayloadShape['siteMedia']) =>
        JSON.stringify(
          [...(arr ?? [])].map((x) => `${x.name}|${(x.kind ?? '').trim() || 'image'}`).sort(),
        )
      return toSmKey(b?.siteMedia) !== toSmKey(a.siteMedia)
    }
    case '自定义空间需求': {
      const toCsKey = (arr: RequirementDocPayloadShape['customSpaceItems']) =>
        JSON.stringify((arr ?? []).map((x) => ({ name: x.name ?? '', description: x.description ?? '' })))
      return toCsKey(b?.customSpaceItems) !== toCsKey(a.customSpaceItems)
    }
    default:
      return false
  }
}

export function getDiffLabelsFromPayloads(
  before: RequirementDocPayloadShape | null,
  after: RequirementDocPayloadShape | null,
  allLabels: readonly string[],
  hasAfterNonEmpty: (label: string) => boolean,
): string[] {
  if (!after) return []
  if (!before) return allLabels.filter((lb) => hasAfterNonEmpty(lb))
  return allLabels.filter((lb) => payloadModuleHasChange(lb, before, after))
}

export function formatRequirementPayloadAsDetail(p: RequirementDocPayloadShape): string {
  const lines: string[] = []
  const pushListBlock = (title: string, items: string[] | undefined) => {
    const list = (items ?? []).filter((x) => String(x ?? '').trim())
    if (!list.length) return
    lines.push(`${title}：`)
    for (const it of list) lines.push(`- ${String(it)}`)
  }
  const pushTextBlock = (title: string, text: string | undefined) => {
    const v = String(text ?? '').trim()
    if (!v) return
    lines.push(`${title}：`)
    lines.push(v)
  }
  const pushKeyValLines = (title: string, rows: Array<{ k: string; v?: string }>) => {
    const filtered = rows
      .map((r) => ({ k: r.k, v: String(r.v ?? '').trim() }))
      .filter((r) => Boolean(r.v))
    if (!filtered.length) return
    lines.push(`${title}：`)
    for (const r of filtered) lines.push(`- ${r.k}：${r.v}`)
  }

  pushKeyValLines('项目概览', [
    { k: '项目城市', v: p.projectLocation },
    { k: '项目类型', v: p.projectType },
    { k: '实际面积（㎡）', v: p.projectArea },
    { k: '预算范围', v: p.budgetStandard },
    { k: '入住周期', v: p.timeline },
    { k: '房屋用途', v: p.houseUsage },
    { k: '采光', v: p.lighting },
    { k: '通风', v: p.ventilation },
    { k: '层高', v: p.ceilingHeight },
    { k: '噪音', v: p.noise },
  ])
  pushKeyValLines('空间规划', [
    { k: '核心空间配置', v: p.coreSpaces },
    {
      k: '自定义核心空间',
      v: (p.customCoreSpaceOptions ?? []).map((x) => String(x ?? '').trim()).filter(Boolean).join('、'),
    },
    { k: '儿童成长', v: p.childGrowth },
    { k: '访客留宿', v: p.guestStay },
    { k: '未来变动', v: p.futureChanges },
  ])
  pushListBlock('智能家居', p.smartHomeOptions)
  pushListBlock('全屋设备', p.devices)
  pushListBlock('系统设备', p.comfortSystems)
  pushListBlock('收纳重点', p.storageFocus)
  pushTextBlock('其他需求', p.otherNeeds)
  pushTextBlock('风水与禁忌', p.fengshui)
  pushTextBlock('空间其他说明', p.spaceOtherNote)
  pushTextBlock('客厅', p.livingRoomNote)
  pushTextBlock('餐厅', p.diningNote)
  pushTextBlock('厨房', p.kitchenNote)
  pushTextBlock('卫生间', p.bathroomNote)
  pushTextBlock('核心空间', p.coreSpaces)
  pushTextBlock('儿童成长', p.childGrowth)
  pushTextBlock('访客留宿', p.guestStay)
  pushTextBlock('未来变动', p.futureChanges)

  if ((p.requirementsMembers ?? []).length) {
    lines.push('成员画像：')
    for (const m of p.requirementsMembers ?? []) {
      const head = `- ${m.name}${m.displayName ? `（${m.displayName}）` : ''}`
      lines.push(head)
      if (m.age?.trim()) lines.push(`  年龄：${m.age.trim()}`)
      if (m.profession?.trim()) lines.push(`  身份/职业：${m.profession.trim()}`)
      if ((m.spaces ?? []).length) {
        lines.push('  空间：')
        for (const s of m.spaces ?? []) {
          const desc = s.description?.trim() ? `：${s.description.trim()}` : ''
          lines.push(`  - ${s.name}${desc}`)
        }
      }
      if (m.otherActivityNote?.trim()) {
        lines.push(`  其他说明：${m.otherActivityNote.trim()}`)
      }
    }
  }
  if ((p.customSpaceItems ?? []).length) {
    lines.push('自定义空间：')
    for (const x of p.customSpaceItems ?? []) {
      const desc = x.description?.trim() ? `：${x.description.trim()}` : ''
      lines.push(`- ${x.name}${desc}`)
    }
  }
  if ((p.floorPlanImages ?? []).length) {
    lines.push('户型图：')
    for (const x of p.floorPlanImages ?? []) lines.push(`- ${x.name}`)
  }
  if ((p.siteMedia ?? []).length) {
    lines.push('现场媒体：')
    for (const x of p.siteMedia ?? []) {
      const kind = (x.kind ?? '').trim()
      lines.push(`- ${x.name}${kind ? `（${kind}）` : ''}`)
    }
  }
  return lines.length ? lines.join('\n') : '（无）'
}

export function requirementPayloadFromFormData(d: FormData): RequirementDocPayloadShape {
  return {
    projectLocation: (d.projectLocation ?? '').trim(),
    projectType: (d.projectType ?? '').trim(),
    projectArea: (d.projectArea ?? '').trim(),
    budgetStandard: (d.budgetStandard ?? '').trim(),
    timeline: (d.timeline ?? '').trim(),
    houseUsage: (d.houseUsage ?? '').trim(),
    lighting: (d.lighting ?? '').trim(),
    ceilingHeight: (d.ceilingHeight ?? '').trim(),
    ventilation: (d.ventilation ?? '').trim(),
    noise: (d.noise ?? '').trim(),
    smartHomeOptions: d.smartHomeOptions ?? [],
    devices: d.devices ?? [],
    otherNeeds: d.otherNeeds ?? '',
    comfortSystems: normalizeComfortSystemLabels(d.comfortSystems ?? []),
    fengshui: (d.fengshui ?? '').trim(),
    storageFocus: d.storageFocus ?? [],
    spaceOtherNote: d.spaceOtherNote ?? '',
    livingRoomNote: d.livingRoomNote ?? '',
    diningNote: d.diningNote ?? '',
    kitchenNote: d.kitchenNote ?? '',
    bathroomNote: d.bathroomNote ?? '',
    coreSpaces: d.coreSpaces ?? '',
    customCoreSpaceOptions: d.customCoreSpaceOptions ?? [],
    childGrowth: d.childGrowth ?? '',
    guestStay: d.guestStay ?? '',
    futureChanges: d.futureChanges ?? '',
    requirementsMembers: d.requirementsMembers ?? [],
    floorPlanImages: d.floorPlanImages ?? [],
    siteMedia: d.siteMedia ?? [],
    customSpaceItems: d.customSpaceItems ?? [],
  }
}

const BASELINE_ROLE_LABELS: Record<string, string> = { A: '男主人', B: '女主人', C: '长辈/长住家属' }
const BASELINE_MEMBER_LABELS: Record<string, string> = { daughter: '女儿', son: '儿子', cat: '猫猫', dog: '狗狗' }

export function fingerprintFromSavedFormData(d: FormData): Record<string, string> {
  const memberSpaces: Record<string, string[]> = {
    daughter: d.daughterSpaces ?? [],
    son: d.sonSpaces ?? [],
    cat: d.catSpaces ?? [],
    dog: d.dogSpaces ?? [],
  }
  let requirementsMembers: RequirementsMember[]
  if (d.requirementsMembers?.length) {
    requirementsMembers = d.requirementsMembers
  } else {
    const list: RequirementsMember[] = []
    if (d.role) {
      list.push({
        id: 'role',
        name: BASELINE_ROLE_LABELS[d.role] || d.role,
        age: '',
        profession: '',
        spaces: (d.favoriteSpace ?? []).map((name) => ({ name, description: '' })),
      })
    }
    ;(d.additionalMembers ?? []).forEach((memberId) => {
      list.push({
        id: memberId,
        name: BASELINE_MEMBER_LABELS[memberId] ?? memberId,
        age: '',
        profession: '',
        spaces: (memberSpaces[memberId] ?? []).map((name) => ({ name, description: '' })),
      })
    })
    requirementsMembers = list
  }
  return fingerprintRequirementDocPayload({
    projectLocation: (d.projectLocation ?? '').trim(),
    projectType: (d.projectType ?? '').trim(),
    projectArea: (d.projectArea ?? '').trim(),
    budgetStandard: (d.budgetStandard ?? '').trim(),
    timeline: (d.timeline ?? '').trim(),
    houseUsage: (d.houseUsage ?? '').trim(),
    lighting: (d.lighting ?? '').trim(),
    ceilingHeight: (d.ceilingHeight ?? '').trim(),
    ventilation: (d.ventilation ?? '').trim(),
    noise: (d.noise ?? '').trim(),
    smartHomeOptions: d.smartHomeOptions ?? [],
    devices: d.devices ?? [],
    otherNeeds: d.otherNeeds ?? '',
    comfortSystems: normalizeComfortSystemLabels(d.comfortSystems ?? []),
    fengshui: (d.fengshui ?? '').trim(),
    storageFocus: d.storageFocus ?? [],
    spaceOtherNote: d.spaceOtherNote ?? '',
    livingRoomNote: d.livingRoomNote ?? '',
    diningNote: d.diningNote ?? '',
    kitchenNote: d.kitchenNote ?? '',
    bathroomNote: d.bathroomNote ?? '',
    coreSpaces: d.coreSpaces ?? '',
    customCoreSpaceOptions: d.customCoreSpaceOptions ?? [],
    childGrowth: d.childGrowth ?? '',
    guestStay: d.guestStay ?? '',
    futureChanges: d.futureChanges ?? '',
    requirementsMembers,
    floorPlanImages: d.floorPlanImages ?? [],
    siteMedia: d.siteMedia ?? [],
    customSpaceItems: d.customSpaceItems ?? [],
  })
}

export function formatAutoRevisionSummary(changedLabels: string[]): string {
  if (changedLabels.length === 0) {
    return '本次编辑相对进入编辑时未检测到字段差异（若刚保存过，可能已与基准一致）'
  }
  if (changedLabels.length >= 12) return '大范围更新项目需求书（多项模块均有调整）'
  if (changedLabels.length <= 6) return `更新：${changedLabels.join('、')}`
  return `更新：${changedLabels.slice(0, 6).join('、')}等共${changedLabels.length}处`
}

export const ALL_DIFF_LABELS_IN_ORDER = [
  '项目概览',
  '空间规划',
  '智能家居',
  '全屋设备',
  '系统设备',
  '收纳重点',
  '其他需求说明',
  '风水与禁忌',
  '空间其他说明',
  '客厅需求',
  '餐厅需求',
  '厨房需求',
  '卫生间需求',
  '核心空间配置',
  '自定义核心空间',
  '儿童成长',
  '访客留宿',
  '未来变动',
  '成员画像',
  '户型图',
  '现场照片/视频',
  '自定义空间需求',
] as const
