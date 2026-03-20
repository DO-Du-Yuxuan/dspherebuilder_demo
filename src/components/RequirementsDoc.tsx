import React from 'react'
import { createPortal } from 'react-dom'
import type { RequirementsMember, RequirementDocRevisionEntry } from '../types'
import { buildRevisionSnapshotFormData, parseDocSnapshotJson } from '../utils/requirementDocRevisionSnapshot'
import type { RequirementDocPayloadShape } from '../utils/requirementRevisionDiff'
import {
  diffRequirementDocFingerprints,
  fingerprintFromSavedFormData,
  fingerprintRequirementDocPayload,
  formatAutoRevisionSummary,
  formatRequirementPayloadAsDetail,
  normalizeComfortSystemLabels,
  requirementPayloadFromFormData,
} from '../utils/requirementRevisionDiff'
import { RequirementRevisionHistoryPanel, REVISIONS_PAGE_SIZE } from './RequirementRevisionHistoryPanel'
import {
  FileText,
  ChevronRight,
  Wrench,
  Package,
  Cpu,
  LayoutGrid,
  Users,
  Clock,
  Sparkles,
  Sofa,
  ChefHat,
  Bath,
  Sun,
  Wind,
  Ruler,
  Volume2,
  Upload,
  Image as ImageIcon,
  Video,
  Thermometer,
  AirVent,
  Wifi,
  Lightbulb,
  ShieldCheck,
  Music,
  Zap,
  Lock,
  Waves,
  Trash2,
  Flame,
  Bot,
  Utensils,
  Archive,
  Compass,
  Plus,
  History,
  Send,
  Edit2,
} from 'lucide-react'


/** 可添加的空间类型选项（下拉选择，与核心空间及常见扩展一致） */
const ADDABLE_SPACE_TYPE_OPTIONS = [
  '客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园',
  '衣帽间', '玄关', '阳台', '储物间', '健身区', '影音室', '保姆间', '家政间', '洗衣房',
]

/** 核心空间「添加空间类型」一行：下拉选项 + 添加按钮 */
function AddSpaceTypeRow({ onAdd, existingNames }: { onAdd: (name: string) => void; existingNames: string[] }) {
  const available = ADDABLE_SPACE_TYPE_OPTIONS.filter((o) => !existingNames.includes(o))
  const [value, setValue] = React.useState('')
  const handleAdd = () => {
    if (!value || existingNames.includes(value)) return
    onAdd(value)
    setValue('')
  }
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm min-w-[140px]"
      >
        <option value="">选择要添加的空间类型</option>
        {available.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <button type="button" onClick={handleAdd} disabled={!value} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-[#FFFDF3] hover:border-[#FF9C3E]/30 transition-colors disabled:opacity-50 disabled:pointer-events-none">
        <Plus size={14} /> 添加空间类型
      </button>
    </div>
  )
}
export function RequirementsDoc({
  projectName,
  ownerDisplayName,
  houseUsage,
  data,
  updateData,
  onBackHome,
  onGoToStyleEval,
  onShowHistory: _onShowHistory,
  onPublish,
  mergeSaveAndPublish,
  onSave,
  isPublished,
  hasUnpublishedChanges,
  lastUpdated,
  customerStatus,
  onSetCustomerStatus,
  snapshotEmbedded,
  snapshotOnClose: _snapshotOnClose,
  snapshotRevisionLabel,
}: {
  projectName: string
  ownerDisplayName: string
  houseUsage?: string
  data?: import('../types').FormData
  /** 编辑后持久化到全局 FormData；展示页/预览时可不传 */
  updateData?: (partial: Partial<import('../types').FormData>) => void
  onBackHome: () => void
  /** 需求书为空时，引导用户从风格测评开始（风格测评→线索收集→转为项目→项目中心） */
  onGoToStyleEval?: () => void
  onShowHistory?: () => void
  onPublish?: (dataToPublish?: import('../types').FormData) => void
  /** 合并保存与发布：完成编辑弹窗按钮改为「确认修改并发布至Home端」，保存后自动调用 onPublish，不显示底部发布按钮 */
  mergeSaveAndPublish?: boolean
  onSave?: () => void
  isPublished?: boolean
  hasUnpublishedChanges?: boolean
  lastUpdated?: string
  customerStatus?: 'unread' | 'agreed' | 'rejected'
  onSetCustomerStatus?: (status: 'unread' | 'agreed' | 'rejected') => void
  /** 修订快照弹窗内：与主需求书同版式只读展示 */
  snapshotEmbedded?: boolean
  snapshotOnClose?: () => void
  snapshotRevisionLabel?: string
}) {
  const d = snapshotEmbedded ? data ?? null : data
  const empty = (v: string) => !v || !String(v).trim()
  const val = (v: string, fallback = '未填写') => (empty(v) ? fallback : String(v).trim())

  if (snapshotEmbedded && !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-800">
        无法加载需求书快照
      </div>
    )
  }

  const [isEditing, setIsEditing] = React.useState(false)
  const [showSubmitModal, setShowSubmitModal] = React.useState(false)
  const [showFinishRevisionModal, setShowFinishRevisionModal] = React.useState(false)
  const [showNoChangesModal, setShowNoChangesModal] = React.useState(false)
  const [snapshotModalEntry, setSnapshotModalEntry] = React.useState<RequirementDocRevisionEntry | null>(null)
  const [revisionUpdaterInput, setRevisionUpdaterInput] = React.useState('')
  const [revisionSummaryInput, setRevisionSummaryInput] = React.useState('')
  const [revisionSectionNoteInput, setRevisionSectionNoteInput] = React.useState('')
  const [spaceTab, setSpaceTab] = React.useState<string>('living')
  /** 需求书正文 vs 变更记录 */
  const [requirementsDocPage, setRequirementsDocPage] = React.useState<'content' | 'revisions'>('content')
  const [revisionTablePage, setRevisionTablePage] = React.useState(1)
  const [expandedRevisionId, setExpandedRevisionId] = React.useState<string | null>(null)
  const baselineFingerprintRef = React.useRef<Record<string, string> | null>(null)
  /** 弹窗内快照：仅展示该版需求书正文，不提供「变更记录」 */
  const showRevisionTabs = !snapshotEmbedded
  const showDocContent = snapshotEmbedded || requirementsDocPage !== 'revisions'

  React.useEffect(() => {
    if (snapshotEmbedded) setIsEditing(false)
  }, [snapshotEmbedded])

  /** 与 Q2-9 核心空间一致，用于自定义空间名称选项 */
  const CORE_SPACE_OPTIONS = ['客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园']
  /** 成员画像：角色选项（与 Q2-6、Q2-6-1 一致，选后仅展示该角色对应的年龄段/身份/活动选项） */
  const MEMBER_ROLE_OPTIONS = ['男主人', '女主人', '长辈/长住家属', '女儿', '儿子', '猫猫', '狗狗', '其他']
  /** 按角色映射「年龄段」选项：成人不用学龄前/小学等，儿童不用 20-30 岁等 */
  const ROLE_TO_AGE_OPTIONS: Record<string, string[]> = {
    '男主人': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '其他'],
    '女主人': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '其他'],
    '长辈/长住家属': ['50岁以上', '41-50岁', '31-40岁', '其他'],
    '女儿': ['学龄前', '小学', '初中', '高中', '其他'],
    '儿子': ['学龄前', '小学', '初中', '高中', '其他'],
    '猫猫': ['幼年', '成年', '老年', '其他'],
    '狗狗': ['幼年', '成年', '老年', '其他'],
    '其他': ['20-30岁', '31-40岁', '41-50岁', '50岁以上', '学龄前', '小学', '初中', '高中', '其他'],
  }
  /** 按角色映射「身份/职业」选项：已选角色后不再出现其他角色名 */
  const ROLE_TO_PROFESSION_OPTIONS: Record<string, string[]> = {
    '男主人': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '其他'],
    '女主人': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '其他'],
    '长辈/长住家属': ['退休', '金融从业', '教育', '医疗', '自由职业', '其他'],
    '女儿': ['学龄前', '小学', '初中', '高中', '其他'],
    '儿子': ['学龄前', '小学', '初中', '高中', '其他'],
    '猫猫': ['其他'],
    '狗狗': ['其他'],
    '其他': ['金融从业', '教育', '医疗', '自由职业', '退休', '学生', '学龄前', '小学', '初中', '高中', '其他'],
  }
  const MEMBER_AGE_OPTIONS_FALLBACK = ROLE_TO_AGE_OPTIONS['其他']
  const MEMBER_PROFESSION_OPTIONS_FALLBACK = ROLE_TO_PROFESSION_OPTIONS['其他']
  /** 按角色映射「主要活动及空间」选项（与 Q2-6、Q2-6-1 题目一致） */
  const ROLE_TO_ACTIVITY_OPTIONS: Record<string, string[]> = {
    '男主人': ['智能书房', '客厅影音中心', '社交餐厨'],
    '女主人': ['梦幻衣帽间', '全能厨房', '主卧疗愈区'],
    '长辈/长住家属': ['阳光卧室', '茶室/宁静角', '独立卫浴'],
    '女儿': ['梦幻公主房', '独立书画区', '乐器练琴房', '超大储衣空间'],
    '儿子': ['乐高/积木区', '运动攀爬墙', '电脑电竞区', '独立手作台'],
    '猫猫': ['猫墙/跑道', '嵌入式猫砂盆', '阳台封窗', '独立喂食区'],
    '狗狗': ['进门洗脚池', '独立卧榻', '宠物互动区', '扫拖机器人基地'],
    '其他': [
      '智能书房', '客厅影音中心', '社交餐厨', '梦幻衣帽间', '全能厨房', '主卧疗愈区', '阳光卧室', '茶室/宁静角', '独立卫浴',
      '梦幻公主房', '独立书画区', '乐器练琴房', '超大储衣空间', '乐高/积木区', '运动攀爬墙', '电脑电竞区', '独立手作台',
      '猫墙/跑道', '嵌入式猫砂盆', '阳台封窗', '独立喂食区', '进门洗脚池', '独立卧榻', '宠物互动区', '扫拖机器人基地',
    ],
  }
  const MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK = ROLE_TO_ACTIVITY_OPTIONS['其他']
  /** 风水要求选项（与 Q2-17 Step17 一致） */
  const FENGSHUI_OPTIONS = [
    '没讲究，怎么舒服怎么来',
    '避开大众忌讳就行',
    '有比较看重的特定要求',
    '我有专门的方案，需配合执行',
  ]
  const planInputId = React.useId()
  const mediaInputId = React.useId()
  const [planImages, setPlanImages] = React.useState<Array<{ name: string; url: string }>>([])
  const [mediaFiles, setMediaFiles] = React.useState<Array<{ name: string; url: string; kind: 'image' | 'video' }>>([])

  const displayHouseUsage = val(d?.houseUsage ?? houseUsage ?? '')

  const infoRows: Array<{ label: string; value: string }> = [
    { label: '项目城市', value: val(d?.projectLocation ?? d?.userCity ?? '') },
    { label: '项目类型', value: val(d?.projectType ?? '') },
    { label: '实际面积', value: d?.projectArea ? `${d.projectArea} ㎡` : '未填写' },
    { label: '预算范围', value: val(d?.budgetStandard ?? d?.budgetSubStandard ?? '') },
    { label: '入住周期', value: val(d?.timeline ?? '') },
  ]

  const projectStatus = {
    lighting: val(d?.lighting ?? ''),
    ventilation: val(d?.ventilation ?? ''),
    ceilingHeight: val(d?.ceilingHeight ?? ''),
    noise: val(d?.noise ?? ''),
  }

  const statusCards: Array<{ icon: React.ElementType; title: string; value: string }> = [
    { icon: Sun, title: '采光', value: projectStatus.lighting },
    { icon: Wind, title: '通风', value: projectStatus.ventilation },
    { icon: Ruler, title: '层高', value: projectStatus.ceilingHeight },
    { icon: Volume2, title: '噪音', value: projectStatus.noise },
  ]

  const ROLE_LABELS: Record<string, string> = { A: '男主人', B: '女主人', C: '长辈/长住家属' }
  const MEMBER_LABELS: Record<string, string> = { daughter: '女儿', son: '儿子', cat: '猫猫', dog: '狗狗' }
  const MEMBER_SPACES: Record<string, string[]> = {
    daughter: d?.daughterSpaces ?? [],
    son: d?.sonSpaces ?? [],
    cat: d?.catSpaces ?? [],
    dog: d?.dogSpaces ?? [],
  }

  type PersonaRow = { name: string; age: string; profession: string; height: string; stylePersona: string | null; mainActivitiesAndSpaces: string[]; otherActivityNote?: string; accent: 'amber' | 'slate'; isStyleTaker?: boolean; roleTag?: string }
  const MEMBER_ROLE_OPTIONS_FOR_DISPLAY = ['男主人', '女主人', '长辈/长住家属', '女儿', '儿子', '猫猫', '狗狗', '其他']
  const displayPersonas = (() => {
    if (d?.requirementsMembers?.length) {
      return d.requirementsMembers.map((m, i) => {
        const isRole = MEMBER_ROLE_OPTIONS_FOR_DISPLAY.includes(m.name)
        const role = isRole ? m.name : ''
        const dn = (m.displayName ?? '').trim()
        const legacy = !isRole && m.name?.trim() ? m.name.trim() : ''
        const displayTitle = dn || legacy || role || '成员'
        const roleTag = dn && role ? role : undefined
        return {
          name: displayTitle,
          roleTag,
          age: m.age ?? '',
          profession: m.profession ?? '',
          height: '',
          stylePersona: null,
          mainActivitiesAndSpaces: (m.spaces ?? []).map((s) => (s.description?.trim() ? `${s.name}：${s.description}` : s.name)),
          otherActivityNote: m.otherActivityNote ?? '',
          accent: (i % 2 === 0 ? 'amber' : 'slate') as 'amber' | 'slate',
          isStyleTaker: m.id === 'role',
        }
      }) as PersonaRow[]
    }
    const list: PersonaRow[] = []
    if (d?.role) {
      const name = ROLE_LABELS[d.role] || d.role
      list.push({ name, age: '', profession: '', height: '', stylePersona: null, mainActivitiesAndSpaces: d?.favoriteSpace ?? [], otherActivityNote: '', accent: 'amber', isStyleTaker: true })
    }
    ;(d?.additionalMembers ?? []).forEach((memberId) => {
      const label = MEMBER_LABELS[memberId] ?? memberId
      const spaces = MEMBER_SPACES[memberId] ?? []
      list.push({ name: label, age: '', profession: '', height: '', stylePersona: null, mainActivitiesAndSpaces: spaces, otherActivityNote: '', accent: 'slate', isStyleTaker: false })
    })
    return list
  })()

  const personas = displayPersonas
  const hasMemberData = personas.length > 0

  const systemEquipments = [
    { key: 'fresh-air', title: '新风系统', desc: '全屋换气·除味净化', icon: Wind },
    { key: 'floor-heating', title: '全屋地暖', desc: '智能分区温控', icon: Thermometer },
    { key: 'central-ac', title: '中央空调', desc: '变频节能冷暖系统', icon: AirVent },
  ]

  /** 与 Q2-18 Step18 选项完全一致，用于正确展示测评结果 */
  const smartHomeOptions = [
    { key: 'wifi', label: '全屋网络覆盖', icon: Wifi },
    { key: 'scene', label: '一键场景控制', icon: Zap },
    { key: 'lighting', label: '氛围灯光调控', icon: Lightbulb },
    { key: 'bgm', label: '隐形背景音乐', icon: Music },
    { key: 'security', label: '24h 居家安防', icon: ShieldCheck },
    { key: 'linkage', label: '家电自动联动', icon: Cpu },
    { key: 'curtain', label: '遮阳自动系统', icon: Sun },
  ] as const

  /** 与 Q2-14 选项一致，用于需求书内收纳重点编辑 */
  const STORAGE_FOCUS_OPTIONS = [
    '衣帽间/衣柜系统',
    '厨房餐储收纳',
    '展示性收纳（书籍、收藏品）',
    '儿童玩具收纳',
    '清洁工具/家政柜',
  ] as const

  const specialDeviceOptions = [
    { key: 'smart-lock', label: '智能门锁', icon: Lock },
    { key: 'dishwasher', label: '洗碗机', icon: Waves },
    { key: 'garbage', label: '厨房垃圾处理器', icon: Trash2 },
    { key: 'smart-toilet', label: '智能马桶盖', icon: Bath },
    { key: 'steam-oven', label: '蒸烤箱', icon: Flame },
    { key: 'dryer', label: '干衣机', icon: Wind },
    { key: 'robot', label: '扫拖机器人', icon: Bot },
  ] as const

  const [smartHomeSelected, setSmartHomeSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    smartHomeOptions.forEach((o) => {
      initial[o.key] = false
    })
    return initial
  })

  const [specialDeviceSelected, setSpecialDeviceSelected] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    specialDeviceOptions.forEach((o) => {
      initial[o.key] = false
    })
    return initial
  })

  const [customNeedsNote, setCustomNeedsNote] = React.useState('')
  const [spaceOtherNote, setSpaceOtherNote] = React.useState('')
  const [comfortSystemsEdit, setComfortSystemsEdit] = React.useState<string[]>([])
  const [fengshuiEdit, setFengshuiEdit] = React.useState('')
  const [storageFocusEdit, setStorageFocusEdit] = React.useState<string[]>([])
  const [membersEdit, setMembersEdit] = React.useState<RequirementsMember[]>([])
  const [customSpaceItemsEdit, setCustomSpaceItemsEdit] = React.useState<Array<{ name: string; description?: string }>>([])

  // Additional local states for "save-on-click" behavior
  const [livingRoomNoteEdit, setLivingRoomNoteEdit] = React.useState('')
  const [diningNoteEdit, setDiningNoteEdit] = React.useState('')
  const [kitchenNoteEdit, setKitchenNoteEdit] = React.useState('')
  const [bathroomNoteEdit, setBathroomNoteEdit] = React.useState('')
  const [projectLocationEdit, setProjectLocationEdit] = React.useState('')
  const [projectTypeEdit, setProjectTypeEdit] = React.useState('')
  const [projectAreaEdit, setProjectAreaEdit] = React.useState('')
  const [budgetStandardEdit, setBudgetStandardEdit] = React.useState('')
  const [timelineEdit, setTimelineEdit] = React.useState('')
  const [houseUsageEdit, setHouseUsageEdit] = React.useState('')

  const [lightingEdit, setLightingEdit] = React.useState('')
  const [ventilationEdit, setVentilationEdit] = React.useState('')
  const [ceilingHeightEdit, setCeilingHeightEdit] = React.useState('')
  const [noiseEdit, setNoiseEdit] = React.useState('')
  const [coreSpacesEdit, setCoreSpacesEdit] = React.useState('')
  const [childGrowthEdit, setChildGrowthEdit] = React.useState('')
  const [guestStayEdit, setGuestStayEdit] = React.useState('')
  const [futureChangesEdit, setFutureChangesEdit] = React.useState('')

  const fengshuiResult = val(d?.fengshui ?? '')
  const storageFocusResult = (d?.storageFocus?.length ? d.storageFocus : [])

  const LIVING_LABELS: Record<string, string> = { media: '影音娱乐', kids: '亲子互动', work: '办公学习', social: '社交会客', fitness: '健身运动', relax: '冥想放松' }
  const livingItems = ((d?.livingRoomFeature?.length ? d.livingRoomFeature.map((id) => LIVING_LABELS[id] || id) : []))
  const diningItems = [val(d?.diningCount ?? '', '') ? `平时就餐：${d!.diningCount}` : '', val(d?.festivalDiningCount ?? '', '') ? `节假日最多：${d!.festivalDiningCount}` : ''].filter(Boolean)
  const COOKING_HABIT_LABELS: Record<string, string> = { heavy: '经常做饭（重油烟）', light: '偶尔做饭（轻食/简餐）', none: '基本点外卖（外出就餐）' }
  const SECOND_KITCHEN_LABELS: Record<string, string> = { no: '不需要（一个厨房足够）', yes_split: '需要中西分厨', yes_light: '需要独立辅食区（轻食区）' }
  const DRY_WET_LABELS: Record<string, string> = { strict: '必须彻底干湿分离（洗手台外置）', normal: '常规干湿分离（淋浴房/浴帘）', none: '无特殊要求' }
  const kitchenItems = [val(d?.cookingHabit ?? '', '') ? `烹饪习惯：${COOKING_HABIT_LABELS[d!.cookingHabit!] ?? d!.cookingHabit}` : '', val(d?.secondKitchen ?? '', '') ? `第二厨房：${SECOND_KITCHEN_LABELS[d!.secondKitchen!] ?? d!.secondKitchen}` : ''].filter(Boolean)
  const bathroomItems = (val(d?.dryWetSeparation ?? '', '') ? [DRY_WET_LABELS[d!.dryWetSeparation!] ?? d!.dryWetSeparation] : [])

  const spaceResultMap: Record<string, { title: string; q: string; icon: React.ElementType; items: string[] }> = {
    living: { title: '客厅', q: 'Q2-13', icon: Sofa, items: ['影音娱乐', '社交会客', '冥想放松'] },
    dining: { title: '餐厅', q: 'Q2-12', icon: Utensils, items: ['平时就餐：3-4人', '节假日最多：7-10人'] },
    kitchen: { title: '厨房', q: 'Q2-11', icon: ChefHat, items: ['烹饪习惯：经常做饭（重油烟）', '第二厨房：需要中西分厨'] },
    bathroom: { title: '卫生间', q: 'Q2-15', icon: Bath, items: ['必须彻底干湿分离（洗手台外置）'] },
  }

  const customSpaceItemsForTabs = (isEditing && updateData) ? customSpaceItemsEdit : (d?.customSpaceItems ?? [])

  const spaceTabsList: Array<{ key: string; label: string }> = [
    { key: 'living', label: '客厅' },
    { key: 'dining', label: '餐厅' },
    { key: 'kitchen', label: '厨房' },
    { key: 'bathroom', label: '卫生间' },
    ...customSpaceItemsForTabs.map((s, i) => ({ key: `custom-${i}`, label: s.name?.trim() || `空间${i + 1}` })),
  ]

  const activeSpace = spaceTab.startsWith('custom-')
    ? (() => {
        const i = parseInt(spaceTab.replace('custom-', ''), 10)
        const item = customSpaceItemsForTabs[i]
        return { title: item?.name?.trim() || '其他空间', q: '自定义', icon: LayoutGrid, items: item?.description?.trim() ? [item.description] : [] }
      })()
    : spaceResultMap[spaceTab] ?? spaceResultMap.living

  const activeSpaceItems =
    spaceTab === 'living'
      ? livingItems
      : spaceTab === 'dining'
        ? diningItems
        : spaceTab === 'kitchen'
          ? kitchenItems
          : spaceTab === 'bathroom'
            ? bathroomItems
            : spaceTab.startsWith('custom-')
              ? (() => {
                  const i = parseInt(spaceTab.replace('custom-', ''), 10)
                  const list = (isEditing && updateData) ? customSpaceItemsEdit : (d?.customSpaceItems ?? [])
                  const item = list[i]
                  return item?.description?.trim() ? [item.description] : []
                })()
              : []

  React.useEffect(() => {
    return () => {
      planImages.forEach((x) => { if (x.url.startsWith('blob:')) URL.revokeObjectURL(x.url) })
      mediaFiles.forEach((x) => { if (x.url.startsWith('blob:')) URL.revokeObjectURL(x.url) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const justExitedEditRef = React.useRef(false)
  const prevIsEditingRef = React.useRef(false)
  React.useEffect(() => {
    if (prevIsEditingRef.current && !isEditing) justExitedEditRef.current = true
    prevIsEditingRef.current = isEditing
  }, [isEditing])
  React.useEffect(() => {
    if (isEditing) return
    if (!d) return
    if (justExitedEditRef.current) {
      justExitedEditRef.current = false
      return
    }
    if (d.floorPlanImages) setPlanImages(d.floorPlanImages)
    if (d.siteMedia) setMediaFiles(d.siteMedia)
  }, [d?.floorPlanImages, d?.siteMedia, isEditing])

  const prevEditingRef = React.useRef(false)
  React.useEffect(() => {
    const justEnteredEdit = isEditing && !prevEditingRef.current
    prevEditingRef.current = isEditing
    if (!justEnteredEdit || !d) return
    const fromSmart = (d.smartHomeOptions ?? []).reduce((acc, label) => {
      const o = smartHomeOptions.find((x) => x.label === label)
      if (o) acc[o.key] = true
      return acc
    }, {} as Record<string, boolean>)
    setSmartHomeSelected((prev) => ({ ...prev, ...fromSmart }))
    const fromDevices = (d.devices ?? []).reduce((acc, label) => {
      const o = specialDeviceOptions.find((x) => x.label === label)
      if (o) acc[o.key] = true
      return acc
    }, {} as Record<string, boolean>)
    setSpecialDeviceSelected((prev) => ({ ...prev, ...fromDevices }))
    const comfortSystems = normalizeComfortSystemLabels(d.comfortSystems ?? [])
    const storageFocus = d.storageFocus ?? []
    const members = d.requirementsMembers?.length
      ? d.requirementsMembers
      : (() => {
          const list: RequirementsMember[] = []
          if (d.role) {
            list.push({
              id: 'role',
              name: ROLE_LABELS[d.role] || d.role,
              age: '',
              profession: '',
              spaces: (d.favoriteSpace ?? []).map((name) => ({ name, description: '' })),
            })
          }
          ;(d.additionalMembers ?? []).forEach((memberId) => {
            list.push({
              id: memberId,
              name: MEMBER_LABELS[memberId] ?? memberId,
              age: '',
              profession: '',
              spaces: (MEMBER_SPACES[memberId] ?? []).map((name) => ({ name, description: '' })),
            })
          })
          return list
        })()
    setCustomNeedsNote((d.otherNeeds ?? '').trim())
    setComfortSystemsEdit(comfortSystems)
    setFengshuiEdit((d.fengshui ?? '').trim())
    setStorageFocusEdit(storageFocus)
    setSpaceOtherNote(d.spaceOtherNote ?? '')
    setLivingRoomNoteEdit(d.livingRoomNote ?? '')
    setDiningNoteEdit(d.diningNote ?? '')
    setKitchenNoteEdit(d.kitchenNote ?? '')
    setBathroomNoteEdit(d.bathroomNote ?? '')
    setProjectLocationEdit(d.projectLocation ?? d.userCity ?? '')
    setProjectTypeEdit(d.projectType ?? '')
    setProjectAreaEdit(d.projectArea ?? '')
    setBudgetStandardEdit(d.budgetStandard ?? d.budgetSubStandard ?? '')
    setTimelineEdit(d.timeline ?? '')
    setHouseUsageEdit(d.houseUsage ?? '')
    setLightingEdit(d.lighting ?? '')
    setVentilationEdit(d.ventilation ?? '')
    setCeilingHeightEdit(d.ceilingHeight ?? '')
    setNoiseEdit(d.noise ?? '')
    setCoreSpacesEdit(d.coreSpaces ?? '')
    setChildGrowthEdit(d.childGrowth ?? '')
    setGuestStayEdit(d.guestStay ?? '')
    setFutureChangesEdit(d.futureChanges ?? '')
    setMembersEdit(members)
    setCustomSpaceItemsEdit(d.customSpaceItems ?? [])
    // 进入编辑时，用表单能正确解析的数据作为 baseline，避免与 form 选项不匹配的 mock 数据导致变更检测错误
    const syncedPayload: RequirementDocPayloadShape = {
      smartHomeOptions: smartHomeOptions.filter((o) => fromSmart[o.key]).map((o) => o.label),
      devices: specialDeviceOptions.filter((o) => fromDevices[o.key]).map((o) => o.label),
      otherNeeds: (d.otherNeeds ?? '').trim(),
      comfortSystems,
      fengshui: (d.fengshui ?? '').trim(),
      storageFocus,
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
      requirementsMembers: members,
      floorPlanImages: d.floorPlanImages ?? [],
      siteMedia: d.siteMedia ?? [],
      customSpaceItems: d.customSpaceItems ?? [],
      projectLocation: d.projectLocation ?? d.userCity ?? '',
      projectType: d.projectType ?? '',
      projectArea: d.projectArea ?? '',
      budgetStandard: d.budgetStandard ?? d.budgetSubStandard ?? '',
      timeline: d.timeline ?? '',
      houseUsage: d.houseUsage ?? '',
      lighting: d.lighting ?? '',
      ventilation: d.ventilation ?? '',
      ceilingHeight: d.ceilingHeight ?? '',
      noise: d.noise ?? '',
    }
    baselineFingerprintRef.current = fingerprintRequirementDocPayload(syncedPayload)
  }, [isEditing, d])

  const revisions: RequirementDocRevisionEntry[] = d?.requirementDocRevisions ?? []
  React.useEffect(() => {
    setRevisionTablePage(1)
  }, [requirementsDocPage, revisions.length])

  const buildRequirementDocEditsPayload = (): Partial<import('../types').FormData> => {
    const smartLabels = smartHomeOptions.filter((o) => smartHomeSelected[o.key]).map((o) => o.label)
    const deviceLabels = specialDeviceOptions.filter((o) => specialDeviceSelected[o.key]).map((o) => o.label)
    return {
      smartHomeOptions: smartLabels,
      devices: deviceLabels,
      otherNeeds: customNeedsNote.trim() || (d?.otherNeeds ?? ''),
      comfortSystems: normalizeComfortSystemLabels(comfortSystemsEdit),
      fengshui: fengshuiEdit.trim(),
      storageFocus: storageFocusEdit,
      spaceOtherNote: spaceOtherNote.trim(),
      livingRoomNote: livingRoomNoteEdit,
      diningNote: diningNoteEdit,
      kitchenNote: kitchenNoteEdit,
      bathroomNote: bathroomNoteEdit,
      coreSpaces: coreSpacesEdit,
      customCoreSpaceOptions: d?.customCoreSpaceOptions ?? [],
      childGrowth: childGrowthEdit,
      guestStay: guestStayEdit,
      futureChanges: futureChangesEdit,
      requirementsMembers: membersEdit,
      floorPlanImages: planImages,
      siteMedia: mediaFiles,
      customSpaceItems: customSpaceItemsEdit,
      projectLocation: projectLocationEdit,
      projectType: projectTypeEdit,
      projectArea: projectAreaEdit,
      budgetStandard: budgetStandardEdit,
      timeline: timelineEdit,
      houseUsage: houseUsageEdit,
      lighting: lightingEdit,
      ventilation: ventilationEdit,
      ceilingHeight: ceilingHeightEdit,
      noise: noiseEdit,
    }
  }

  const confirmSaveRequirementWithRevision = () => {
    if (!updateData || !d) {
      setShowFinishRevisionModal(false)
      setIsEditing(false)
      return
    }
    const payloadForSave = buildRequirementDocEditsPayload()
    const fullAfterPayload = requirementPayloadFromFormData({
      ...d,
      ...payloadForSave,
    } as import('../types').FormData)
    const fpAfter = fingerprintRequirementDocPayload(fullAfterPayload)
    const beforeFp = baselineFingerprintRef.current ?? fingerprintFromSavedFormData(d)
    const labels = diffRequirementDocFingerprints(beforeFp, fpAfter)
    const autoSummary = formatAutoRevisionSummary(labels)
    const summary = revisionSummaryInput.trim() || autoSummary
    const sectionFromLabels = labels.length ? labels.join('、') : undefined
    const sectionNote = revisionSectionNoteInput.trim() || sectionFromLabels
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const beforePayload = requirementPayloadFromFormData(d)
    const entry: RequirementDocRevisionEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`,
      date: dateStr,
      updater: revisionUpdaterInput.trim() || ownerDisplayName,
      summary,
      sectionNote: sectionNote || undefined,
      docSnapshotJson: JSON.stringify({
        v: 2,
        formData: buildRevisionSnapshotFormData(d, payloadForSave),
      }),
      changeDetailBefore: beforePayload ? formatRequirementPayloadAsDetail(beforePayload) : undefined,
      changeDetailAfter: formatRequirementPayloadAsDetail(fullAfterPayload),
    }
    const dataToPublish: import('../types').FormData = {
      ...d,
      ...payloadForSave,
      requirementDocRevisions: [entry, ...(d?.requirementDocRevisions ?? [])],
      customerStatus: 'unread',
    }
    updateData(
      mergeSaveAndPublish
        ? { ...dataToPublish }
        : {
            ...payloadForSave,
            requirementDocRevisions: [entry, ...(d?.requirementDocRevisions ?? [])],
          },
    )
    onSave?.()
    setShowFinishRevisionModal(false)
    setIsEditing(false)
    setRequirementsDocPage('content')
    setExpandedRevisionId(null)
    setRevisionTablePage(1)
    if (mergeSaveAndPublish && onPublish) {
      onPublish(dataToPublish)
    }
  }

  const onPickPlanFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach((f) => {
      if (!f.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setPlanImages((prev) => [...prev, { name: f.name, url: dataUrl }])
      }
      reader.readAsDataURL(f)
    })
  }

  const onPickMediaFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach((f) => {
      const kind: 'image' | 'video' | null = f.type.startsWith('video/') ? 'video' : f.type.startsWith('image/') ? 'image' : null
      if (!kind) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setMediaFiles((prev) => [...prev, { name: f.name, url: dataUrl, kind }])
      }
      reader.readAsDataURL(f)
    })
  }

  const displaySmartHomeLabels = (d?.smartHomeOptions ?? [])
  const displayDeviceLabels = (d?.devices ?? [])
  const displayComfortLabels = (d?.comfortSystems ?? [])

  const isRequirementsEmpty =
    !hasMemberData &&
    (d?.comfortSystems ?? []).length === 0 &&
    (d?.smartHomeOptions ?? []).length === 0 &&
    !(d?.fengshui ?? '').trim() &&
    (d?.storageFocus ?? []).length === 0 &&
    livingItems.length === 0 &&
    diningItems.length === 0 &&
    kitchenItems.length === 0 &&
    bathroomItems.length === 0

  // 空状态时：内嵌预览示例，保留在需求书内而非跳转


  if (isRequirementsEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
          <FileText size={40} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">暂无项目需求书</h3>
        <p className="text-gray-500 max-w-md mb-8">
          您尚未完成深度测评，完成风格测评与线索收集后，系统将自动生成基于真实数据的需求书。
        </p>
        {onGoToStyleEval && (
          <button
            onClick={onGoToStyleEval}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#EF6B00] px-8 py-4 text-lg font-bold text-white hover:bg-[#E65100] transition-all shadow-lg shadow-orange-200"
          >
            开始风格测评
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-gray-500">
            {snapshotEmbedded ? (
              <span>
                修订快照（只读）
                {snapshotRevisionLabel ? (
                  <span className="text-gray-400 font-normal"> · {snapshotRevisionLabel}</span>
                ) : null}
              </span>
            ) : (
              <>项目交付 · {requirementsDocPage === 'revisions' ? '变更记录' : '用户需求'}</>
            )}
          </div>
          {showRevisionTabs ? (
            <div
              className="mt-3 relative z-10 inline-flex rounded-2xl bg-gradient-to-b from-stone-100/90 to-stone-50/95 p-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-stone-200/70"
              role="tablist"
              aria-label="用户需求/变更记录切换"
            >
              <button
                type="button"
                role="tab"
                aria-selected={requirementsDocPage === 'content'}
                onClick={() => {
                  setSnapshotModalEntry(null)
                  setRequirementsDocPage('content')
                }}
                className={`relative flex items-center justify-center gap-2 min-w-[7.5rem] sm:min-w-[8.5rem] px-4 py-2.5 rounded-[13px] text-sm font-semibold transition-all duration-200 ease-out ${
                  requirementsDocPage === 'content'
                    ? 'bg-white text-[#b45309] shadow-[0_2px_12px_rgba(239,107,0,0.14),0_0_0_1px_rgba(251,191,36,0.25)]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/35 active:scale-[0.99]'
                }`}
              >
                <FileText
                  size={18}
                  strokeWidth={requirementsDocPage === 'content' ? 2.25 : 2}
                  className={requirementsDocPage === 'content' ? 'text-[#EF6B00]' : 'text-stone-400'}
                />
                <span>用户需求</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={requirementsDocPage === 'revisions'}
                onClick={() => setRequirementsDocPage('revisions')}
                className={`relative flex items-center justify-center gap-2 min-w-[7.5rem] sm:min-w-[8.5rem] px-4 py-2.5 rounded-[13px] text-sm font-semibold transition-all duration-200 ease-out ${
                  requirementsDocPage === 'revisions'
                    ? 'bg-white text-[#b45309] shadow-[0_2px_12px_rgba(239,107,0,0.14),0_0_0_1px_rgba(251,191,36,0.25)]'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-white/35 active:scale-[0.99]'
                }`}
              >
                <History
                  size={18}
                  strokeWidth={requirementsDocPage === 'revisions' ? 2.25 : 2}
                  className={requirementsDocPage === 'revisions' ? 'text-[#EF6B00]' : 'text-stone-400'}
                />
                <span>变更记录</span>
                {revisions.length > 0 ? (
                  <span
                    className={`tabular-nums text-[11px] font-bold min-h-[1.375rem] min-w-[1.375rem] flex items-center justify-center rounded-full px-1.5 transition-colors ${
                      requirementsDocPage === 'revisions'
                        ? 'bg-gradient-to-br from-amber-400/90 to-orange-500/95 text-white shadow-sm'
                        : 'bg-stone-200/80 text-stone-600'
                    }`}
                  >
                    {revisions.length > 99 ? '99+' : revisions.length}
                  </span>
                ) : null}
              </button>
            </div>
          ) : null}
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{projectName}</span>
            <span className="mx-2 text-gray-300">/</span>
            <span>业主：{ownerDisplayName}</span>
          </div>
          {lastUpdated && !snapshotEmbedded && (
            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              最后更新：{lastUpdated}
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {!isEditing ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9C3E]" />
                当前为只读状态；如需修改，请点击底部「编辑」。
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#FF9C3E]/20 bg-[#FF9C3E]/10 px-3 py-2 text-xs font-semibold text-[#C87800]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9C3E]" />
                编辑模式已开启
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 用 hidden 切换而非条件卸载，避免切回「用户需求」时正文不渲染或视口异常 */}
      <div
        className={showDocContent ? 'space-y-8' : 'hidden'}
        aria-hidden={!showDocContent}
      >
      <section className="space-y-4">
        <SectionTitle title="项目概览" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                <FileText size={18} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{projectName}</div>
                <div className="text-xs text-gray-500">概览信息</div>
              </div>
            </div>

            <div className="space-y-3">
              {isEditing && updateData ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">项目城市</label>
                    <input value={projectLocationEdit} onChange={(e) => setProjectLocationEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="项目城市" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">项目类型</label>
                    <select value={projectTypeEdit} onChange={(e) => setProjectTypeEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['独栋别墅', '平层公寓', '复式联排'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">实际面积（㎡）</label>
                    <input type="number" value={projectAreaEdit} onChange={(e) => setProjectAreaEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="面积" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">预算范围</label>
                    <select value={budgetStandardEdit} onChange={(e) => setBudgetStandardEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {[
                        { value: 'A', label: '精工全案高定 (5,000 - 8,000)' },
                        { value: 'B', label: '豪华奢享方案 (8,000 - 12,000)' },
                        { value: 'C', label: '顶奢私享空间 (12,000 - 20,000)' },
                        { value: 'D', label: '艺术殿堂级定制 (20,000 以上)' },
                        { value: 'E', label: '了解更多高性价比方案' },
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">入住周期</label>
                    <select value={timelineEdit} onChange={(e) => setTimelineEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['3个月内', '3-6个月', '半年到一年', '一年以上'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500">房屋用途</label>
                    <select value={houseUsageEdit} onChange={(e) => setHouseUsageEdit(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {['改善房', '刚需房', '投资房', '度假房/第二居所'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {infoRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                      <div className="text-sm text-gray-600">{row.label}</div>
                      <div className="text-sm font-semibold text-gray-900">{row.value}</div>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm text-gray-600 pt-1">房屋用途</div>
                    <div className="text-sm font-semibold text-gray-900">{displayHouseUsage}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">项目现状（Q2-5）</div>
            </div>

            {isEditing && updateData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'lighting' as const, label: '采光', value: lightingEdit, setter: setLightingEdit, options: ['极佳，全天有阳光', '良好，半天有阳光', '一般，需要开灯', '较差，采光受限'] },
                  { key: 'ventilation' as const, label: '通风', value: ventilationEdit, setter: setVentilationEdit, options: ['南北通透', '通风良好', '单面通风', '通风较差'] },
                  { key: 'ceilingHeight' as const, label: '层高', value: ceilingHeightEdit, setter: setCeilingHeightEdit, options: ['2.8米以上 (宽敞)', '2.6-2.8米 (标准)', '2.6米以下 (偏低)'] },
                  { key: 'noise' as const, label: '噪音', value: noiseEdit, setter: setNoiseEdit, options: ['非常安静', '偶有噪音', '临街/较吵', '非常吵闹'] },
                ].map(({ key, label, value, setter, options }) => (
                  <div key={key} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                    <label className="text-xs text-gray-500 block mb-2">{label}</label>
                    <select value={value} onChange={(e) => setter(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                      <option value="">请选择</option>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statusCards.map((c) => (
                  <div key={c.title} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E]">
                        <c.icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                        <div className="mt-1 text-sm text-gray-600 truncate">{c.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="空间规划（Q2-9）" />
        {(d?.coreSpaces || d?.childGrowth || d?.guestStay || d?.futureChanges || (isEditing && updateData)) ? (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">核心空间与规划</div>
            </div>
            {(() => {
              const customNames = d?.customCoreSpaceOptions ?? []
              const baseOptions = ['客厅', '餐厅', '开放厨房', '封闭厨房', '主卧室', '次卧室', '小孩卧室', '老人卧室', '主卫浴室', '公卫浴室', '次卫浴室', '书房', '花园']
              const parseCounts = (str: string): Record<string, number> => {
                const counts: Record<string, number> = {}
                if (!str?.trim()) return counts
                const re = /(\d+)([^\d]+)/g
                let m: RegExpExecArray | null
                while ((m = re.exec(str)) !== null) counts[m[2]] = parseInt(m[1], 10)
                return counts
              }
              const raw = (d?.coreSpaces ?? '')
              const counts = parseCounts(isEditing ? coreSpacesEdit : raw)
              const fullOptionList = Array.from(new Set([...baseOptions, ...customNames, ...Object.keys(counts)]))
              const entries = fullOptionList.filter((k) => (counts[k] ?? 0) > 0).map((k) => ({ name: k, count: counts[k] ?? 0 }))
              const updateCoreCount = (name: string, val: number) => {
                const next = { ...counts, [name]: Math.max(0, val) }
                const newStr = fullOptionList.filter((k) => (next[k] ?? 0) > 0).map((k) => `${next[k]}${k}`).join('')
                setCoreSpacesEdit(newStr)
              }
              const addCustomSpaceOption = (newName: string) => {
                if (!updateData || !newName?.trim()) return
                const next = [...customNames, newName.trim()]
                updateData({ customCoreSpaceOptions: next })
                onSave?.()
              }
              const isEditable = isEditing && updateData
              return (
                <>
                  {isEditable ? (
                    <div className="mb-5">
                      <div className="text-xs font-semibold text-gray-500 mb-3">核心空间（数量可改，可添加空间类型）</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {fullOptionList.map((name) => (
                          <div key={name} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900 truncate" title={name}>{name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button type="button" onClick={() => updateCoreCount(name, Math.max(0, (counts[name] ?? 0) - 1))} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold" aria-label="减少">−</button>
                              <input type="number" min={0} max={9} value={counts[name] ?? 0} onChange={(e) => updateCoreCount(name, parseInt(e.target.value, 10) || 0)} className="w-10 h-8 rounded-xl border border-gray-200 px-1 py-0 text-center text-sm font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              <button type="button" onClick={() => updateCoreCount(name, (counts[name] ?? 0) + 1)} className="w-8 h-8 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center text-sm font-bold" aria-label="增加">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <AddSpaceTypeRow onAdd={addCustomSpaceOption} existingNames={fullOptionList} />
                    </div>
                  ) : entries.length > 0 ? (
                    <div className="mb-5">
                      <div className="text-xs font-semibold text-gray-500 mb-3">核心空间</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {entries.map(({ name, count }) => (
                          <div key={name} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">{name}</span>
                            <span className="w-8 h-8 rounded-xl bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center text-sm font-bold shrink-0">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {isEditable ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-3">成长变化（Q2-10）</div>
                        <select value={childGrowthEdit} onChange={(e) => setChildGrowthEdit(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                          <option value="">请选择</option>
                          {['暂不考虑', '近期考虑', '长期规划'].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-3">亲友留宿（Q2-11）</div>
                        <select value={guestStayEdit} onChange={(e) => setGuestStayEdit(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                          <option value="">请选择</option>
                          {['不常留宿', '偶尔留宿', '经常留宿'].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                        <div className="text-xs font-semibold text-gray-500 mb-3">未来变动（Q2-12）</div>
                        <select value={futureChangesEdit} onChange={(e) => setFutureChangesEdit(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                          <option value="">请选择</option>
                          {['无大变动', '可能有变', '确定有变'].map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {d?.childGrowth && (
                        <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                          <div className="text-xs font-semibold text-gray-500 mb-1">成长变化</div>
                          <div className="text-sm text-gray-900">{d.childGrowth}</div>
                        </div>
                      )}
                      {d?.guestStay && (
                        <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                          <div className="text-xs font-semibold text-gray-500 mb-1">亲友留宿</div>
                          <div className="text-sm text-gray-900">{d.guestStay}</div>
                        </div>
                      )}
                      {d?.futureChanges && (
                        <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                          <div className="text-xs font-semibold text-gray-500 mb-1">未来变动</div>
                          <div className="text-sm text-gray-900">{d.futureChanges}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <SectionTitle title="项目图纸与视频" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0">
                  <ImageIcon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">户型图（Q2-4）</div>
                  <div className="text-xs text-gray-500">支持多张图片上传并预览</div>
                </div>
              </div>
              {isEditing ? (
                <>
                  <label
                    htmlFor={planInputId}
                    className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={16} className="text-gray-400" />
                    上传
                  </label>
                  <input
                    id={planInputId}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPickPlanFiles(e.target.files)}
                  />
                </>
              ) : null}
            </div>

            {planImages.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
                  <ImageIcon size={18} />
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-800">暂无</div>
                <div className="mt-1 text-sm text-gray-600">
                  {!isEditing ? '进入编辑模式后可上传户型图' : '可在此上传多张户型图'}
                </div>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {planImages.map((img, index) => (
                  <div key={`${img.name}-${index}`} className="relative group/card">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm"
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-28 object-cover group-hover/card:scale-[1.01] transition-transform" />
                      <div className="px-3 py-2 text-[11px] text-gray-600 truncate">{img.name}</div>
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => setPlanImages((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white text-xs flex items-center justify-center"
                        title="删除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 h-10 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center shrink-0">
                  <Video size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">现场视频 / 照片（Q2-4）</div>
                  <div className="text-xs text-gray-500">支持图片/视频上传并预览</div>
                </div>
              </div>
              {isEditing ? (
                <>
                  <label
                    htmlFor={mediaInputId}
                    className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={16} className="text-gray-400" />
                    上传
                  </label>
                  <input
                    id={mediaInputId}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPickMediaFiles(e.target.files)}
                  />
                </>
              ) : null}
            </div>

            {mediaFiles.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
                  <Video size={18} />
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-800">暂无</div>
                <div className="mt-1 text-sm text-gray-600">
                  {!isEditing ? '进入编辑模式后可上传现场视频或照片' : '可在此上传现场视频或照片'}
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {mediaFiles.map((f) => (
                  <a
                    key={f.url}
                    href={f.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 hover:bg-white transition-colors"
                    title={f.name}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 shrink-0">
                        {f.kind === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.kind === 'video' ? '视频' : '图片'}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle title="成员画像（Q2-6 核心成员）" />
          {hasMemberData && !isEditing ? (
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <Users size={14} className="text-gray-400" />
              <span className="font-semibold text-gray-400">Q2-6</span>
              <span className="text-gray-300">·</span>
              {personas.length} 位成员
            </div>
          ) : null}
        </div>

        {isEditing && updateData ? (
          <div className="space-y-5">
            {membersEdit.map((member, memberIdx) => (
              <div key={member.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">角色</label>
                      <select
                        value={member.name}
                        onChange={(e) => {
                          setMembersEdit((prev) => {
                            const next = [...prev]
                            const newName = e.target.value
                            const allowedSpaces = ROLE_TO_ACTIVITY_OPTIONS[newName] ?? MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK
                            const allowedAges = ROLE_TO_AGE_OPTIONS[newName] ?? MEMBER_AGE_OPTIONS_FALLBACK
                            const allowedProfs = ROLE_TO_PROFESSION_OPTIONS[newName] ?? MEMBER_PROFESSION_OPTIONS_FALLBACK
                            const m = next[memberIdx]
                            const spaces = (m.spaces ?? []).filter((s) => allowedSpaces.includes(s.name))
                            const age = (m.age && allowedAges.includes(m.age)) ? m.age : ''
                            const profession = (m.profession && allowedProfs.includes(m.profession)) ? m.profession : ''
                            next[memberIdx] = { ...m, name: newName, spaces, age, profession }
                            return next
                          })
                        }}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="">请选择角色</option>
                        {[...MEMBER_ROLE_OPTIONS, (member.name?.trim() && !MEMBER_ROLE_OPTIONS.includes(member.name)) ? member.name : null].filter((opt): opt is string => Boolean(opt)).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">年龄段</label>
                      <select
                        value={member.age ?? ''}
                        onChange={(e) => {
                          setMembersEdit((prev) => {
                            const next = [...prev]
                            next[memberIdx] = { ...next[memberIdx], age: e.target.value }
                            return next
                          })
                        }}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="">请选择</option>
                        {((): string[] => {
                          const byRole = ROLE_TO_AGE_OPTIONS[member.name] ?? MEMBER_AGE_OPTIONS_FALLBACK
                          const extra = (member.age?.trim() && !byRole.includes(member.age)) ? [member.age as string] : []
                          return [...byRole, ...extra]
                        })().map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">身份/职业</label>
                      <select
                        value={member.profession ?? ''}
                        onChange={(e) => {
                          setMembersEdit((prev) => {
                            const next = [...prev]
                            next[memberIdx] = { ...next[memberIdx], profession: e.target.value }
                            return next
                          })
                        }}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                      >
                        <option value="">请选择</option>
                        {((): string[] => {
                          const byRole = ROLE_TO_PROFESSION_OPTIONS[member.name] ?? MEMBER_PROFESSION_OPTIONS_FALLBACK
                          const extra = (member.profession?.trim() && !byRole.includes(member.profession)) ? [member.profession as string] : []
                          return [...byRole, ...extra]
                        })().map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMembersEdit((prev) => prev.filter((_, i) => i !== memberIdx))}
                    className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="删除成员"
                    aria-label="删除成员"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {member.id === 'role' && (d?.styleName?.trim()) && (
                  <div className="mt-4 rounded-2xl border border-[#FF9C3E]/20 bg-[#FF9C3E]/5 p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-1">风格人格（本人做的测评）</div>
                    <div className="text-sm font-semibold text-[#C87800]">{d.styleName}</div>
                  </div>
                )}
                <div className="mt-4 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                  <div className="text-xs font-semibold text-gray-700 mb-2">
                    主要活动及空间{member.name ? `（${member.name} 对应选项）` : '（请先选择角色）'}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(ROLE_TO_ACTIVITY_OPTIONS[member.name] ?? MEMBER_ACTIVITY_SPACE_OPTIONS_FALLBACK).map((spaceName) => {
                      const selected = (member.spaces ?? []).some((s) => s.name === spaceName)
                      return (
                        <button
                          key={spaceName}
                          type="button"
                          onClick={() => {
                            setMembersEdit((prev) => {
                              const next = [...prev]
                              const spaces = next[memberIdx].spaces ?? []
                              if (selected) next[memberIdx] = { ...next[memberIdx], spaces: spaces.filter((s) => s.name !== spaceName) }
                              else next[memberIdx] = { ...next[memberIdx], spaces: [...spaces, { name: spaceName }] }
                              return next
                            })
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${selected ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'}`}
                        >
                          {selected ? <span className="w-4 h-4 rounded border-2 border-[#FF9C3E] bg-[#FF9C3E] flex items-center justify-center"><span className="w-1.5 h-1.5 rounded-sm bg-white" /></span> : <span className="w-4 h-4 rounded border border-gray-200" />}
                          {spaceName}
                        </button>
                      )
                    })}
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">其他说明</label>
                    <input
                      value={member.otherActivityNote ?? ''}
                      onChange={(e) => {
                        setMembersEdit((prev) => {
                          const next = [...prev]
                          next[memberIdx] = { ...next[memberIdx], otherActivityNote: e.target.value }
                          return next
                        })
                      }}
                      placeholder="可补充该成员的其他活动或空间需求..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setMembersEdit((prev) => [
                  ...prev,
                  { id: `custom-${Date.now()}`, name: '', age: '', profession: '', spaces: [], otherActivityNote: '' },
                ])
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 py-4 text-sm font-medium text-gray-600 hover:bg-[#FFFDF3] hover:border-[#FF9C3E]/30 transition-colors"
            >
              <Plus size={18} />
              添加成员
            </button>
          </div>
        ) : hasMemberData ? (
          <>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {personas.map((p) => (
                <div
                  key={`${p.name}-${p.age}`}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white border border-gray-100 shadow-sm px-3 py-2 text-xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center font-bold">
                    {p.name.slice(0, 1)}
                  </span>
                  <span className="font-semibold text-gray-800">{p.name}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-600">{p.age}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {personas.map((p) => (
                <div key={`${p.name}-${p.age}`} className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-base font-semibold truncate">{p.name}</div>
                        <span className="text-xs text-gray-400">·</span>
                        <div className="text-sm font-semibold text-gray-700 shrink-0">{p.age}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {p.profession}
                        {p.height ? (
                          <>
                            <span className="mx-2 text-gray-300">/</span>
                            身高 {p.height}
                          </>
                        ) : null}
                      </div>

                      {p.isStyleTaker && (d?.styleName?.trim()) ? (
                        <div className="mt-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FF9C3E]/10 text-[#C87800]">
                            风格人格：{d?.styleName}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-[#FFFDF3] border border-gray-100 flex items-center justify-center text-gray-500 font-bold">
                      {p.name.slice(0, 1)}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                    <div className="text-xs font-semibold text-gray-700">主要活动及空间</div>
                    <ul className="mt-2 text-sm text-gray-600 leading-relaxed space-y-2">
                      {p.mainActivitiesAndSpaces.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    {p.otherActivityNote?.trim() ? (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">其他说明：</span>{p.otherActivityNote}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
              <Users size={18} />
            </div>
            <div className="mt-3 text-sm font-semibold text-gray-800">暂无成员信息</div>
            <div className="mt-1 text-sm text-gray-600">
              请先完成深度测评中的「核心成员」（Q2-6）与「家庭成员」（Q2-6-1），或进入编辑模式直接添加成员。
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionTitle title="全屋需求" />

        <div className="space-y-5">
          {/* 系统设备 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Wrench size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">系统设备</div>
                  <div className="text-xs text-gray-500">Q2-19 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {systemEquipments.map((x) => {
                    const checked = comfortSystemsEdit.includes(x.title)
                    return (
                      <button
                        key={x.key}
                        type="button"
                        onClick={() => {
                          setComfortSystemsEdit((prev) =>
                            checked ? prev.filter((t) => t !== x.title) : [...prev, x.title]
                          )
                        }}
                        className={`flex items-center gap-3 rounded-2xl border p-5 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'}`} aria-hidden="true">
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E] shrink-0">
                          <x.icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{x.title}</div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{x.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : displayComfortLabels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {systemEquipments.filter((x) => displayComfortLabels.includes(x.title)).map((x) => (
                    <div key={x.key} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E] shrink-0">
                          <x.icon size={18} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{x.title}</div>
                          <div className="mt-1 text-xs text-gray-500 truncate">{x.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-19）
                </div>
              )}
            </div>
          </div>

          {/* 智能家居系统 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Sparkles size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">智能家居系统</div>
                  <div className="text-xs text-gray-500">Q2-18 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartHomeOptions.map((o) => {
                    const checked = !!smartHomeSelected[o.key]
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSmartHomeSelected((prev) => ({ ...prev, [o.key]: !prev[o.key] }))}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                          <o.icon size={18} className={checked ? 'text-[#FF9C3E]' : 'text-gray-500'} />
                        </span>
                        <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                      </button>
                    )
                  })}
                </div>
              ) : displaySmartHomeLabels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {smartHomeOptions.filter((o) => displaySmartHomeLabels.includes(o.label)).map((o) => (
                    <div key={o.key} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3">
                      <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                        <o.icon size={18} className="text-[#FF9C3E]" />
                      </span>
                      <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-18）
                </div>
              )}
            </div>
          </div>

          {/* 特殊设备需求 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Package size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">全屋设备需求</div>
                  <div className="text-xs text-gray-500">Q2-20 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {specialDeviceOptions.map((o) => {
                    const checked = !!specialDeviceSelected[o.key]
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setSpecialDeviceSelected((prev) => ({ ...prev, [o.key]: !prev[o.key] }))}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'
                          }`}
                          aria-hidden="true"
                        >
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                          <o.icon size={18} className={checked ? 'text-[#FF9C3E]' : 'text-gray-500'} />
                        </span>
                        <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                      </button>
                    )
                  })}
                </div>
              ) : displayDeviceLabels.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {specialDeviceOptions.filter((o) => displayDeviceLabels.includes(o.label)).map((o) => (
                    <div key={o.key} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3">
                      <span className="w-9 h-9 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 shrink-0">
                        <o.icon size={18} className="text-[#FF9C3E]" />
                      </span>
                      <div className="text-sm font-semibold text-gray-800">{o.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-20）
                </div>
              )}
            </div>
          </div>

          {/* 风水要求（Q2-17） */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Compass size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">风水要求</div>
                  <div className="text-xs text-gray-500">Q2-17 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData ? (
                <select
                  value={fengshuiEdit}
                  onChange={(e) => setFengshuiEdit(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
                >
                  <option value="">请选择</option>
                  {[...FENGSHUI_OPTIONS, (fengshuiEdit?.trim() && !FENGSHUI_OPTIONS.includes(fengshuiEdit)) ? fengshuiEdit : null].filter((opt): opt is string => Boolean(opt)).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (d?.fengshui?.trim()) ? (
                <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed">
                  {fengshuiResult}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-17）
                </div>
              )}
            </div>
          </div>

          {/* 收纳重点（Q2-14） */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-2xl bg-[#FF9C3E]/10 text-[#FF9C3E] flex items-center justify-center">
                  <Archive size={18} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">收纳重点</div>
                  <div className="text-xs text-gray-500">Q2-14 选项结果</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isEditing && updateData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STORAGE_FOCUS_OPTIONS.map((opt) => {
                    const checked = storageFocusEdit.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setStorageFocusEdit((prev) =>
                            checked ? prev.filter((t) => t !== opt) : [...prev, opt]
                          )
                        }}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${
                          checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-[#FFFDF3] hover:bg-white'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'bg-white border-gray-200'}`} aria-hidden="true">
                          {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{opt}</span>
                      </button>
                    )
                  })}
                </div>
              ) : storageFocusResult.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {storageFocusResult.map((it) => (
                    <div key={it} className="rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm font-semibold text-gray-800">
                      {it}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  暂无，请先完成深度测评（Q2-14）
                </div>
              )}
            </div>
          </div>

          {/* 个性化定制说明 */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-900">个性化定制说明</div>
              <div className="text-xs text-gray-500">Q2-16 底线与妥协 · Q2-21 其他需求</div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={customNeedsNote}
                  onChange={(e) => setCustomNeedsNote(e.target.value)}
                  placeholder="请输入其他补充需求..."
                  className="w-full min-h-[140px] rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
                />
              ) : (() => {
                const fromData = (
                  (d?.otherNeeds?.trim()) ||
                  (Array.isArray(d?.bottomLine) && d.bottomLine.length > 0)
                )
                const displayText = fromData
                    ? [
                        d?.otherNeeds?.trim(),
                        (d?.bottomLine ?? []).length
                          ? '\n\n底线与妥协：\n' + (d?.bottomLine as string[]).map((b) => '• ' + b).join('\n')
                          : '',
                      ].filter(Boolean).join('')
                    : ''
                return displayText.trim() ? (
                  <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayText}
                  </div>
                ) : customNeedsNote.trim() ? (
                  <div className="rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {customNeedsNote}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                    暂无
                    <div className="mt-1 text-xs text-gray-500">进入编辑模式后可补充说明，或完成 Q2-16、Q2-21 自动生成</div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle title="空间需求" />

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
              <div className="font-semibold">
                {activeSpace.title}
                <span className="ml-2 text-xs font-semibold text-gray-500">（{activeSpace.q}）</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[#FFFDF3] p-1 border border-gray-100 flex-wrap">
              {spaceTabsList.map((tab) => (
                <TabPill key={tab.key} active={spaceTab === tab.key} onClick={() => setSpaceTab(tab.key)}>
                  {tab.label}
                </TabPill>
              ))}
              {isEditing && updateData && (
                <button type="button" onClick={() => { const len = customSpaceItemsEdit.length; setCustomSpaceItemsEdit((prev) => [...prev, { name: '', description: '' }]); setSpaceTab(`custom-${len}`) }} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-white hover:border-[#FF9C3E]/30 transition-colors">
                  <Plus size={14} /> 添加空间
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-[#FF9C3E]">
                <activeSpace.icon size={18} />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-900">需求说明</div>
              {isEditing && updateData ? (
                <textarea
                  value={
                    spaceTab.startsWith('custom-') 
                      ? (customSpaceItemsEdit[parseInt(spaceTab.replace('custom-', ''), 10)]?.description ?? '') 
                      : (spaceTab === 'living' 
                          ? livingRoomNoteEdit 
                          : spaceTab === 'dining' 
                            ? diningNoteEdit 
                            : spaceTab === 'kitchen' 
                              ? kitchenNoteEdit 
                              : bathroomNoteEdit)
                  }
                  onChange={(e) => {
                    if (spaceTab.startsWith('custom-')) {
                      const i = parseInt(spaceTab.replace('custom-', ''), 10)
                      setCustomSpaceItemsEdit((prev) => { const n = [...prev]; n[i] = { ...n[i], description: e.target.value }; return n })
                    } else {
                      if (spaceTab === 'living') setLivingRoomNoteEdit(e.target.value)
                      else if (spaceTab === 'dining') setDiningNoteEdit(e.target.value)
                      else if (spaceTab === 'kitchen') setKitchenNoteEdit(e.target.value)
                      else if (spaceTab === 'bathroom') setBathroomNoteEdit(e.target.value)
                    }
                  }}
                  placeholder="填写该空间的需求说明..."
                  className="mt-2 w-full min-h-[100px] rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400"
                />
              ) : (
                <div className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {(spaceTab.startsWith('custom-') 
                    ? (customSpaceItemsEdit[parseInt(spaceTab.replace('custom-', ''), 10)]?.description ?? '') 
                    : (spaceTab === 'living' 
                        ? (d?.livingRoomNote ?? '') 
                        : spaceTab === 'dining' 
                          ? (d?.diningNote ?? '') 
                          : spaceTab === 'kitchen' 
                            ? (d?.kitchenNote ?? '') 
                            : (d?.bathroomNote ?? '')))?.trim() || '本区聚焦该空间的关键使用方式与容量预期，便于后续方案与设备位落地。'}
                </div>
              )}
            </div>
            <div className="md:col-span-2 space-y-3">
              {isEditing && updateData ? (
                (() => {
                  if (spaceTab === 'living') {
                    const current = d?.livingRoomFeature ?? []
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(LIVING_LABELS).map(([id, label]) => {
                          const checked = current.includes(id)
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                updateData({ livingRoomFeature: checked ? current.filter((x) => x !== id) : [...current, id] })
                                onSave?.()
                              }}
                              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors ${checked ? 'border-[#FF9C3E]/30 bg-[#FF9C3E]/10' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
                            >
                              <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${checked ? 'bg-[#FF9C3E] border-[#FF9C3E]' : 'border-gray-200'}`} aria-hidden="true">
                                {checked ? <span className="w-2.5 h-2.5 rounded-sm bg-white" /> : null}
                              </span>
                              <span className="text-sm font-medium text-gray-800">{label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  }
                  if (spaceTab === 'dining') {
                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-500 block mb-2">平时就餐人数</label>
                          <div className="flex flex-wrap gap-2">
                            {['1-2人', '3-4人', '5-6人', '6人以上'].map((opt) => (
                              <button key={opt} type="button" onClick={() => {
                                updateData({ diningCount: opt })
                                onSave?.()
                              }} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${d?.diningCount === opt ? 'border-[#FF9C3E] bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-2">节假日最多人数</label>
                          <div className="flex flex-wrap gap-2">
                            {['4-6人', '7-10人', '10人以上'].map((opt) => (
                              <button key={opt} type="button" onClick={() => {
                                updateData({ festivalDiningCount: opt })
                                onSave?.()
                              }} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${d?.festivalDiningCount === opt ? 'border-[#FF9C3E] bg-[#FF9C3E]/10 text-[#C87800]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>{opt}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  }
                  if (spaceTab === 'kitchen') {
                    return (
                      <div className="space-y-4">
                        <div><label className="text-xs text-gray-500 block mb-1">烹饪习惯</label><select value={d?.cookingHabit ?? ''} onChange={(e) => {
                          updateData({ cookingHabit: e.target.value })
                          onSave?.()
                        }} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(COOKING_HABIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                        <div><label className="text-xs text-gray-500 block mb-1">第二厨房</label><select value={d?.secondKitchen ?? ''} onChange={(e) => {
                          updateData({ secondKitchen: e.target.value })
                          onSave?.()
                        }} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(SECOND_KITCHEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                      </div>
                    )
                  }
                  if (spaceTab === 'bathroom') {
                    return (
                      <div><label className="text-xs text-gray-500 block mb-1">干湿分离</label><select value={d?.dryWetSeparation ?? ''} onChange={(e) => {
                        updateData({ dryWetSeparation: e.target.value })
                        onSave?.()
                      }} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">请选择</option>{Object.entries(DRY_WET_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                    )
                  }
                  if (spaceTab.startsWith('custom-')) {
                    const customIdx = parseInt(spaceTab.replace('custom-', ''), 10)
                    const item = customSpaceItemsEdit[customIdx]
                    if (item == null) {
                      return (
                        <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                          该空间不存在，请切换到其他页或点击「添加空间」
                        </div>
                      )
                    }
                    return (
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-start rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4">
                        <div className="flex-1 min-w-0">
                          <label className="text-xs text-gray-500 block mb-2">空间名称（与核心空间一致）</label>
                          <select value={item.name} onChange={(e) => setCustomSpaceItemsEdit((prev) => { const n = [...prev]; n[customIdx] = { ...n[customIdx], name: e.target.value }; return n })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                            <option value="">请选择</option>
                            {CORE_SPACE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-gray-500">需求说明请在左侧「需求说明」中填写</p>
                        </div>
                        <button type="button" onClick={() => { const nextList = customSpaceItemsEdit.filter((_, i) => i !== customIdx); setCustomSpaceItemsEdit(nextList); setSpaceTab(nextList.length === 0 ? 'living' : 'custom-0') }} className="shrink-0 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600" title="删除" aria-label="删除"><Trash2 size={16} /></button>
                      </div>
                    )
                  }
                  return null
                })()
              ) : activeSpaceItems.length > 0 ? (
                activeSpaceItems.map((it, idx) => (
                  <div key={it} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                    <span className="w-8 h-8 rounded-2xl bg-[#FF9C3E]/10 text-[#C87800] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div className="text-sm text-gray-700 leading-relaxed">{it}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                  {spaceTab.startsWith('custom-') ? '暂无需求说明，进入编辑模式可在左侧填写' : `暂无，请先完成深度测评（${activeSpace.q}）`}
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-900">其他说明</div>
            {isEditing ? (
              <textarea
                value={spaceOtherNote}
                onChange={(e) => setSpaceOtherNote(e.target.value)}
                placeholder="可补充该空间的其他偏好、禁忌或设备位要求..."
                className="mt-3 w-full min-h-[110px] rounded-2xl border border-gray-100 bg-[#FFFDF3] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF9C3E]/20"
              />
            ) : (d?.spaceOtherNote?.trim() || spaceOtherNote.trim()) ? (
              <div className="mt-3 rounded-2xl border border-gray-100 bg-[#FFFDF3] p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {d?.spaceOtherNote?.trim() || spaceOtherNote}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-[#FFFDF3] p-6 text-center text-sm text-gray-600">
                暂无
                <div className="mt-1 text-xs text-gray-500">进入编辑模式后可补充说明</div>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>

      {showRevisionTabs ? (
      <section
        className={`rounded-3xl border border-gray-100 bg-white shadow-sm p-6 md:p-8 min-h-[280px] ${
          requirementsDocPage === 'revisions' ? '' : 'hidden'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle title="需求变更与修订记录" />
          {isPublished && (
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold border ${
                customerStatus === 'agreed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : customerStatus === 'rejected'
                  ? 'bg-red-50 text-red-700 border-red-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                <Users size={12} />
                客户状态：{
                  customerStatus === 'agreed' ? '已同意' :
                  customerStatus === 'rejected' ? '已拒绝' : '未读'
                }
              </div>
              {onSetCustomerStatus && (
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 px-1">模拟状态:</span>
                  {(['unread', 'agreed', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSetCustomerStatus(s)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        customerStatus === s
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {s === 'unread' ? '未读' : s === 'agreed' ? '同意' : '拒绝'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {revisions.length > REVISIONS_PAGE_SIZE ? (
          <p className="mt-2 text-xs text-stone-500">
            共 {revisions.length} 条修订，时间轴与详细记录区域支持翻页浏览。
          </p>
        ) : null}
        <RequirementRevisionHistoryPanel
          revisions={revisions}
          revisionTablePage={revisionTablePage}
          setRevisionTablePage={setRevisionTablePage}
          expandedRevisionId={expandedRevisionId}
          setExpandedRevisionId={setExpandedRevisionId}
          onViewSnapshot={setSnapshotModalEntry}
        />
      </section>
      ) : null}

      {!snapshotEmbedded ? (
        <RequirementDocSnapshotModal
          entry={snapshotModalEntry}
          onClose={() => setSnapshotModalEntry(null)}
        />
      ) : null}

      {showSubmitModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowSubmitModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-gray-900">感谢您的配合</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                您的项目需求书已提交，我们会根据这份信息为您生成后续方案与服务建议。
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false)
                  onBackHome()
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoChangesModal && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="关闭"
            onClick={() => setShowNoChangesModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">没有做任何更新</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              与进入编辑时相比，需求书内容没有变化。您可继续修改，或直接退出编辑。
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNoChangesModal(false)}
                className="w-full py-3 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                继续编辑
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNoChangesModal(false)
                  setIsEditing(false)
                }}
                className="w-full py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                退出编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinishRevisionModal && (
        <div className="fixed inset-0 z-[145] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 cursor-default"
            aria-label="关闭"
            onClick={() => setShowFinishRevisionModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">完成编辑</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              将保存修改并写入「需求变更与修订记录」。变更概要已自动识别，可按需微调。
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 block mb-1">日期（自动）</span>
                <span className="font-medium text-gray-800">
                  {(() => {
                    const n = new Date()
                    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
                  })()}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-updater">
                  更新人
                </label>
                <input
                  id="rev-updater"
                  value={revisionUpdaterInput}
                  onChange={(e) => setRevisionUpdaterInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="姓名或角色"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-summary">
                  变更概要（已根据本次修改自动识别）
                </label>
                <p className="text-[11px] text-gray-400 mb-1.5 leading-snug">
                  对比「点击编辑时」已保存内容与当前内容，列出变更模块；可微调下方文字。
                </p>
                <textarea
                  id="rev-summary"
                  value={revisionSummaryInput}
                  onChange={(e) => setRevisionSummaryInput(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-y min-h-[72px] bg-[#FAFAF9]"
                  readOnly={false}
                  placeholder="自动生成中…"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1" htmlFor="rev-section">
                  涉及章节 / 备注（已自动填入变更模块，可改）
                </label>
                <input
                  id="rev-section"
                  value={revisionSectionNoteInput}
                  onChange={(e) => setRevisionSectionNoteInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  placeholder="自动根据变更模块生成"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => confirmSaveRequirementWithRevision()}
                className="w-full py-3 rounded-2xl bg-[#EF6B00] text-white text-sm font-semibold hover:bg-[#D85F00] transition-colors"
              >
                {mergeSaveAndPublish ? '确认修改并发布至Home端' : '确认保存并记录修订'}
              </button>
              <button
                type="button"
                onClick={() => setShowFinishRevisionModal(false)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-800"
              >
                取消，继续编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {!snapshotEmbedded ? (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500 line-clamp-2">
            {revisions[0] ? (
              <>
                最后修订：<span className="text-gray-700">{revisions[0].date}</span>
              </>
            ) : (
              <>有变更并完成编辑后，将自动记录修订，最新信息将显示在此处。</>
            )}
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    baselineFingerprintRef.current = null
                    setShowFinishRevisionModal(false)
                    setShowNoChangesModal(false)
                    setIsEditing(false)
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消编辑
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (updateData && d) {
                      const edits = buildRequirementDocEditsPayload()
                      const fullAfterPayload = requirementPayloadFromFormData({
                        ...d,
                        ...edits,
                      } as import('../types').FormData)
                      const fpAfter = fingerprintRequirementDocPayload(fullAfterPayload)
                      const beforeFp =
                        baselineFingerprintRef.current ?? fingerprintFromSavedFormData(d)
                      const labels = diffRequirementDocFingerprints(beforeFp, fpAfter)
                      if (labels.length === 0) {
                        setShowNoChangesModal(true)
                      } else {
                        setRevisionUpdaterInput(ownerDisplayName)
                        setRevisionSummaryInput(formatAutoRevisionSummary(labels))
                        setRevisionSectionNoteInput(labels.join('、'))
                        setShowFinishRevisionModal(true)
                      }
                    }
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-[#EF6B00] text-white hover:bg-[#D85F00] transition-colors"
                  title="完成编辑"
                >
                  完成编辑
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (updateData && d) {
                      setRequirementsDocPage('content')
                    }
                    onSetCustomerStatus?.('unread')
                    setIsEditing(true)
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#EF6B00] px-6 py-3 text-sm font-bold text-white hover:bg-[#CC5B00] transition-colors shadow-sm"
                  title="编辑需求书"
                >
                  <Edit2 size={18} />
                  编辑
                </button>
                {onPublish && !mergeSaveAndPublish && (
                  <button
                    type="button"
                    onClick={() => onPublish()}
                    disabled={!hasUnpublishedChanges}
                    className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all ${
                      !hasUnpublishedChanges
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#EF6B00] text-white hover:bg-[#E65100]'
                    }`}
                  >
                    <Send size={18} />
                    {!hasUnpublishedChanges ? '暂无修改内容' : '发布至 Home 端'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      ) : null}
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1 h-4 rounded-full bg-[#EF6B00]" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )
}

function TabPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
        active ? 'bg-white shadow-sm border border-gray-100 text-gray-900' : 'text-gray-600 hover:bg-white/60'
      }`}
    >
      {children}
    </button>
  )
}

function RequirementDocSnapshotModal({
  entry,
  onClose,
}: {
  entry: RequirementDocRevisionEntry | null
  onClose: () => void
}) {
  if (!entry) return null
  const fd = parseDocSnapshotJson(entry.docSnapshotJson)
  if (!fd) {
    return createPortal(
      <div className="fixed inset-0 z-[10050] flex items-center justify-center px-4">
        <button
          type="button"
          className="absolute inset-0 bg-neutral-950/75 backdrop-blur-[3px]"
          aria-label="关闭"
          onClick={onClose}
        />
        <div className="relative z-[1] max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            该条为旧版存档，无完整版面快照。请在新修订保存后查看。
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-semibold"
          >
            关闭
          </button>
        </div>
      </div>,
      document.body,
    )
  }
  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex justify-center overflow-y-auto overflow-x-hidden bg-neutral-950/72 backdrop-blur-[4px] py-4 px-2 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="需求书快照"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-6xl flex flex-col rounded-3xl bg-[#FFFDF3] shadow-[0_25px_80px_rgba(0,0,0,0.35)] border border-stone-200/90 overflow-hidden min-h-[min(88vh,820px)] max-h-[min(94vh,900px)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4">
          <RequirementsDoc
            key={entry.id}
            snapshotEmbedded
            snapshotOnClose={onClose}
            snapshotRevisionLabel={`${entry.date} · ${entry.updater}`}
            data={fd}
            projectName={(fd.projectName || fd.projectLocation || '项目').trim() || '项目'}
            ownerDisplayName={(fd.ownerName || (fd as { userName?: string }).userName || '业主').trim() || '业主'}
            houseUsage={fd.houseUsage}
            onBackHome={onClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
