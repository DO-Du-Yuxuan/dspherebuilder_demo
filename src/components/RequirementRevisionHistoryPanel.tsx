import React from 'react'
import { ChevronDown, ChevronUp, Eye, ListChecks, ChevronRight } from 'lucide-react'
import type { RequirementDocRevisionEntry, RequirementsMember } from '../types'
import { parseDocSnapshotJson } from '../utils/requirementDocRevisionSnapshot'
import {
  ALL_DIFF_LABELS_IN_ORDER,
  getDiffLabelsFromPayloads,
  requirementPayloadFromFormData,
} from '../utils/requirementRevisionDiff'

export const REVISIONS_PAGE_SIZE = 10

function revisionPaginationSlots(current: number, total: number): (number | 'gap')[] {
  if (total <= 1) return [1]
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const want = new Set(
    [1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total),
  )
  const sorted = [...want].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('gap')
    out.push(sorted[i])
  }
  return out
}

function RevisionTablePagination({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const slots = revisionPaginationSlots(page, totalPages)

  return (
    <div className="mt-5 rounded-2xl border border-stone-100/90 bg-gradient-to-b from-[#FFFDF9] to-stone-50/50 px-3 py-3.5 sm:px-5 sm:py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-[13px] leading-snug text-stone-500">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600/90 shadow-sm ring-1 ring-stone-100/80"
            aria-hidden
          >
            <ListChecks size={16} strokeWidth={2.25} />
          </span>
          <span>
            显示{' '}
            <span className="font-semibold tabular-nums text-stone-800">{start}</span>
            <span className="text-stone-400 mx-0.5">–</span>
            <span className="font-semibold tabular-nums text-stone-800">{end}</span>
            {' '}条，共{' '}
            <span className="font-semibold tabular-nums text-stone-800">{total}</span>
            {' '}条
          </span>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
          aria-label="修订记录分页"
        >
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="上一页"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          {slots.map((s, i) =>
            s === 'gap' ? (
              <span key={`gap-${i}`} className="w-6 flex items-center justify-center text-stone-400">…</span>
            ) : (
              <button
                key={s}
                type="button"
                onClick={() => onPageChange(s)}
                className={`min-w-[2.25rem] h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  page === s
                    ? 'bg-amber-500/90 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                {s}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="下一页"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  )
}

export function RequirementRevisionHistoryPanel({
  revisions,
  revisionTablePage,
  setRevisionTablePage,
  expandedRevisionId,
  setExpandedRevisionId,
  onViewSnapshot,
}: {
  revisions: RequirementDocRevisionEntry[]
  revisionTablePage: number
  setRevisionTablePage: (p: number) => void
  expandedRevisionId: string | null
  setExpandedRevisionId: (id: string | null) => void
  onViewSnapshot: (entry: RequirementDocRevisionEntry) => void
}) {
  const revisionTotalPages = Math.max(1, Math.ceil(revisions.length / REVISIONS_PAGE_SIZE))
  const revisionsPageSlice =
    revisions.length === 0 ? [] : revisions.slice(
      (revisionTablePage - 1) * REVISIONS_PAGE_SIZE,
      revisionTablePage * REVISIONS_PAGE_SIZE,
    )

  return (
    <>
        {/* 第一板块：时间轴 — 客户每次修改并确认的快照节点 */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">修订时间轴</h3>
          <p className="text-xs text-gray-500 mb-4">
            从左到右按时间递进（最新在右侧）；每个节点只展示<strong>时间</strong>与<strong>快照</strong>，点击查看该次保存后的需求书快照。
          </p>
          {revisions.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm rounded-xl border border-dashed border-gray-200">
              暂无修订记录。有内容变更并完成编辑后，将自动登记修订与快照。
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <div className="relative px-2 pb-2">
                <div className="absolute left-0 right-0 top-4 h-px bg-amber-200/80" aria-hidden />
                <div className="flex items-start gap-6">
                  {[...revisionsPageSlice].reverse().map((r) => (
                    <div key={r.id} className="relative flex-shrink-0 w-[220px]">
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white border border-amber-600/30"
                          aria-hidden
                        />
                        <div className="mt-3 text-xs text-gray-500 whitespace-nowrap">{r.date}</div>
                        <button
                          type="button"
                          onClick={() => onViewSnapshot(r)}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-[#C87800] hover:bg-[#FFF4E0] transition-colors"
                        >
                          <Eye size={14} />
                          查看快照
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {revisions.length > REVISIONS_PAGE_SIZE ? (
            <RevisionTablePagination
              page={revisionTablePage}
              totalPages={revisionTotalPages}
              pageSize={REVISIONS_PAGE_SIZE}
              total={revisions.length}
              onPageChange={setRevisionTablePage}
            />
          ) : null}
        </div>

        {/* 第二板块：详细变更记录 — 每条可展开查看变更前/变更后 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">详细变更记录</h3>
          <p className="text-xs text-gray-500 mb-4">
            每条记录包含更新人、更新概要；点击展开后会按模块拆分卡片，左右展示<strong>变更前</strong>与<strong>变更后</strong>，便于逐项对比。
          </p>
          {revisions.length === 0 ? null : (
            <div className="space-y-2">
              {revisionsPageSlice.map((r, idx) => {
                const fullIndex = (revisionTablePage - 1) * REVISIONS_PAGE_SIZE + idx
                const prevRevision = revisions[fullIndex + 1]

                const isExpanded = expandedRevisionId === r.id
                const beforeDetailText = r.changeDetailBefore?.trim() ? r.changeDetailBefore : undefined
                const afterDetailText = r.changeDetailAfter?.trim() ? r.changeDetailAfter : undefined
                const hasDetail = Boolean(beforeDetailText || afterDetailText || r.docSnapshotJson?.trim())

                // 只在展开时解析快照，避免无展开时的重复计算。
                const afterFd = isExpanded ? parseDocSnapshotJson(r.docSnapshotJson) : null
                const beforeFd = isExpanded && prevRevision?.docSnapshotJson?.trim()
                  ? parseDocSnapshotJson(prevRevision.docSnapshotJson)
                  : null
                const afterPayload = afterFd ? requirementPayloadFromFormData(afterFd) : null
                const beforePayload = beforeFd ? requirementPayloadFromFormData(beforeFd) : null


                const listNormalize = (arr?: string[]) => (arr ?? []).map((x) => String(x ?? '').trim()).filter(Boolean)

                const hasAfterNonEmpty = (label: string): boolean => {
                  if (!afterPayload) return false
                  switch (label) {
                    case '项目概览':
                      return (
                        (afterPayload.projectLocation ?? '').trim().length > 0 ||
                        (afterPayload.projectType ?? '').trim().length > 0 ||
                        (afterPayload.projectArea ?? '').trim().length > 0 ||
                        (afterPayload.budgetStandard ?? '').trim().length > 0 ||
                        (afterPayload.timeline ?? '').trim().length > 0 ||
                        (afterPayload.houseUsage ?? '').trim().length > 0 ||
                        (afterPayload.lighting ?? '').trim().length > 0 ||
                        (afterPayload.ventilation ?? '').trim().length > 0 ||
                        (afterPayload.ceilingHeight ?? '').trim().length > 0 ||
                        (afterPayload.noise ?? '').trim().length > 0
                      )
                    case '空间规划':
                      return (
                        (afterPayload.coreSpaces ?? '').trim().length > 0 ||
                        listNormalize(afterPayload.customCoreSpaceOptions).length > 0 ||
                        (afterPayload.childGrowth ?? '').trim().length > 0 ||
                        (afterPayload.guestStay ?? '').trim().length > 0 ||
                        (afterPayload.futureChanges ?? '').trim().length > 0
                      )
                    case '智能家居':
                      return listNormalize(afterPayload.smartHomeOptions).length > 0
                    case '全屋设备':
                      return listNormalize(afterPayload.devices).length > 0
                    case '系统设备':
                      return listNormalize(afterPayload.comfortSystems).length > 0
                    case '收纳重点':
                      return listNormalize(afterPayload.storageFocus).length > 0
                    case '其他需求说明':
                      return (afterPayload.otherNeeds ?? '').trim().length > 0
                    case '风水与禁忌':
                      return (afterPayload.fengshui ?? '').trim().length > 0
                    case '空间其他说明':
                      return (afterPayload.spaceOtherNote ?? '').trim().length > 0
                    case '客厅需求':
                      return (afterPayload.livingRoomNote ?? '').trim().length > 0
                    case '餐厅需求':
                      return (afterPayload.diningNote ?? '').trim().length > 0
                    case '厨房需求':
                      return (afterPayload.kitchenNote ?? '').trim().length > 0
                    case '卫生间需求':
                      return (afterPayload.bathroomNote ?? '').trim().length > 0
                    case '核心空间配置':
                      return (afterPayload.coreSpaces ?? '').trim().length > 0
                    case '自定义核心空间':
                      return listNormalize(afterPayload.customCoreSpaceOptions).length > 0
                    case '儿童成长':
                      return (afterPayload.childGrowth ?? '').trim().length > 0
                    case '访客留宿':
                      return (afterPayload.guestStay ?? '').trim().length > 0
                    case '未来变动':
                      return (afterPayload.futureChanges ?? '').trim().length > 0
                    case '成员画像':
                      return (afterPayload.requirementsMembers ?? []).length > 0
                    case '户型图':
                      return (afterPayload.floorPlanImages ?? []).length > 0
                    case '现场照片/视频':
                      return (afterPayload.siteMedia ?? []).length > 0
                    case '自定义空间需求':
                      return (afterPayload.customSpaceItems ?? []).length > 0
                    default:
                      return false
                  }
                }

                const diffLabels = getDiffLabelsFromPayloads(
                  beforePayload ?? null,
                  afterPayload ?? null,
                  ALL_DIFF_LABELS_IN_ORDER,
                  hasAfterNonEmpty,
                )

                const renderTextValue = (value: string | undefined) => {
                  const v = String(value ?? '').trim()
                  return v ? (
                    <div className="whitespace-pre-wrap break-words text-xs text-gray-700 leading-relaxed max-h-28 overflow-y-auto font-sans">
                      {v}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">无</div>
                  )
                }

                const renderListColumn = ({
                  before,
                  after,
                  mode,
                }: {
                  before: string[]
                  after: string[]
                  mode: 'before' | 'after'
                }) => {
                  const beforeNorm = before
                  const afterNorm = after
                  const beforeSet = new Set(beforeNorm)
                  const afterSet = new Set(afterNorm)
                  if (mode === 'before') {
                    if (!beforeNorm.length) return <div className="text-xs text-gray-400">无</div>
                    return (
                      <div className="space-y-1">
                        {beforeNorm.map((it) => {
                          return (
                            <div
                              key={`b-${it}`}
                              className="text-xs leading-relaxed text-gray-800"
                            >
                              {it}
                            </div>
                          )
                        })}
                      </div>
                    )
                  }
                  if (!afterNorm.length) return <div className="text-xs text-gray-400">无</div>
                  return (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {afterNorm.map((it) => {
                          const added = !beforeSet.has(it)
                          return (
                            <div
                              key={`a-${it}`}
                              className={`text-xs leading-relaxed ${
                                added ? 'text-emerald-700 font-semibold' : 'text-gray-800'
                              }`}
                            >
                            {added ? '+ ' : null}
                              {it}
                            </div>
                          )
                        })}
                      </div>

                      {/* 变更后不存在的：在右侧以删除样式展示 */}
                      {beforeNorm.length > 0 ? (
                        <div className="pt-1">
                          <div className="space-y-1">
                            {beforeNorm
                              .filter((it) => !afterSet.has(it))
                              .map((it) => (
                                <div
                                  key={`d-${it}`}
                                  className="text-xs leading-relaxed text-red-600 line-through"
                                >
                                  - {it}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                }

                /** 空间项转为可比较字符串 */
                const spaceToKey = (s: { name?: string; description?: string }) =>
                  `${String(s?.name ?? '').trim()}|${String(s?.description ?? '').trim()}`
                const renderMembersColumn = (
                  members?: RequirementsMember[],
                  opts?: {
                    highlightIds?: Set<string>
                    nameClassNameWhenHighlighted?: string
                    /** 变更前成员 Map(id -> member)，用于在变更后列对同一成员的选项做红/绿对比 */
                    beforeMemberMap?: Map<string, RequirementsMember>
                  },
                ) => {
                  const list = members ?? []
                  if (!list.length) return <div className="text-xs text-gray-400">无</div>
                  const highlightIds = opts?.highlightIds ?? new Set<string>()
                  const nameClassWhenHighlighted = opts?.nameClassNameWhenHighlighted ?? 'text-emerald-700'
                  const beforeMemberMap = opts?.beforeMemberMap

                  return (
                    <div className="space-y-3">
                      {list.map((m) => {
                        const isNewMember = highlightIds.has(m.id)
                        const before = beforeMemberMap?.get(m.id)
                        const isFieldDiff = Boolean(before && !isNewMember)

                        const detailTextClass = isNewMember ? 'text-emerald-700' : 'text-gray-600'
                        const spaceTextClass = isNewMember ? 'text-emerald-700' : 'text-gray-700'
                        const subtleTextClass = isNewMember ? 'text-emerald-600' : 'text-gray-500'

                        const trim = (v?: string) => String(v ?? '').trim()
                        const nameChanged = isFieldDiff && trim(before!.name) !== trim(m.name)
                        const displayNameChanged = isFieldDiff && trim(before!.displayName) !== trim(m.displayName)
                        const ageChanged = isFieldDiff && trim(before!.age) !== trim(m.age)
                        const professionChanged = isFieldDiff && trim(before!.profession) !== trim(m.profession)
                        const otherNoteChanged = isFieldDiff && trim(before!.otherActivityNote) !== trim(m.otherActivityNote)
                        const beforeSpaceKeys = new Set((before?.spaces ?? []).map(spaceToKey))
                        const afterSpaceKeys = new Set((m.spaces ?? []).map(spaceToKey))
                        const afterSpaces = m.spaces ?? []
                        const removedSpaces = (before?.spaces ?? []).filter((s) => !afterSpaceKeys.has(spaceToKey(s)))

                        return (
                          <div key={m.id} className="space-y-1">
                            <div
                              className={`text-xs font-semibold leading-snug ${
                                isNewMember ? nameClassWhenHighlighted : 'text-gray-900'
                              }`}
                            >
                              {isNewMember ? '+ ' : null}
                              {isFieldDiff && nameChanged ? (
                                <span>
                                  <span className="text-red-600 line-through">- {trim(before!.name)}</span>
                                  {trim(before!.name) && trim(m.name) ? ' ' : null}
                                  <span className="text-emerald-700 font-semibold">+ {trim(m.name)}</span>
                                </span>
                              ) : (
                                m.name
                              )}
                              {isFieldDiff && displayNameChanged ? (
                                <span className="font-normal">
                                  {trim(before!.displayName) ? (
                                    <span className="text-red-600 line-through">（{trim(before!.displayName)}）</span>
                                  ) : null}
                                  {trim(m.displayName) ? (
                                    <span className="text-emerald-700">（{trim(m.displayName)}）</span>
                                  ) : null}
                                </span>
                              ) : m.displayName?.trim() ? (
                                <span className={`${subtleTextClass} font-normal`}>（{m.displayName.trim()}）</span>
                              ) : null}
                            </div>

                            {(m.age?.trim() || m.profession?.trim() || (isFieldDiff && (ageChanged || professionChanged))) ? (
                              <div className={`text-[11px] ${isNewMember ? detailTextClass : ''} leading-relaxed`}>
                                {isFieldDiff && ageChanged ? (
                                  <span>
                                    <span className="text-red-600 line-through">年龄：{trim(before!.age) || '无'}</span>
                                    {' '}
                                    <span className="text-emerald-700 font-medium">年龄：{trim(m.age) || '无'}</span>
                                  </span>
                                ) : m.age?.trim() ? (
                                  <span className={isNewMember ? detailTextClass : 'text-gray-600'}>年龄：{m.age.trim()}</span>
                                ) : null}
                                {isFieldDiff && (ageChanged || professionChanged) && (m.age?.trim() || m.profession?.trim()) ? ' · ' : null}
                                {!isFieldDiff && m.age?.trim() && m.profession?.trim() ? ' · ' : null}
                                {isFieldDiff && professionChanged ? (
                                  <span>
                                    <span className="text-red-600 line-through">身份/职业：{trim(before!.profession) || '无'}</span>
                                    {' '}
                                    <span className="text-emerald-700 font-medium">身份/职业：{trim(m.profession) || '无'}</span>
                                  </span>
                                ) : m.profession?.trim() ? (
                                  <span className={isNewMember ? detailTextClass : 'text-gray-600'}>身份/职业：{m.profession.trim()}</span>
                                ) : null}
                              </div>
                            ) : null}

                            {afterSpaces.length > 0 || (isFieldDiff && removedSpaces.length > 0) ? (
                              <div className={`text-xs ${isNewMember ? spaceTextClass : ''} leading-relaxed`}>
                                <div className={`text-[11px] ${subtleTextClass} mb-1`}>空间：</div>
                                <div className="space-y-1">
                                  {afterSpaces.map((s, i2) => {
                                    const added = isFieldDiff && !beforeSpaceKeys.has(spaceToKey(s))
                                    return (
                                      <div key={`${m.id}-s-${i2}`} className="flex gap-2">
                                        <span className="text-gray-400 shrink-0">{added ? '+' : '-'}</span>
                                        <span className={added ? 'text-emerald-700 font-medium' : ''}>
                                          {added ? ' ' : null}
                                          {s.name}
                                          {s.description?.trim() ? (
                                            <span className={subtleTextClass}>（{s.description.trim()}）</span>
                                          ) : null}
                                        </span>
                                      </div>
                                    )
                                  })}
                                  {isFieldDiff && removedSpaces.length > 0 ? (
                                    removedSpaces.map((s) => (
                                        <div key={`${m.id}-rem-${spaceToKey(s)}`} className="flex gap-2">
                                          <span className="text-red-600 shrink-0">-</span>
                                          <span className="text-red-600 line-through">
                                            {s.name}
                                            {s.description?.trim() ? (
                                              <span className="text-red-600">（{s.description.trim()}）</span>
                                            ) : null}
                                          </span>
                                        </div>
                                      ))
                                  ) : null}
                                </div>
                              </div>
                            ) : null}

                            {m.otherActivityNote?.trim() || (isFieldDiff && trim(before!.otherActivityNote)) ? (
                              <div className={`text-xs ${isNewMember ? detailTextClass : ''} leading-relaxed`}>
                                <span className={`text-[11px] ${subtleTextClass}`}>其他说明：</span>
                                {isFieldDiff && otherNoteChanged ? (
                                  <span>
                                    {trim(before!.otherActivityNote) ? (
                                      <span className="text-red-600 line-through">{trim(before!.otherActivityNote)}</span>
                                    ) : null}
                                    {trim(before!.otherActivityNote) && trim(m.otherActivityNote) ? ' ' : null}
                                    {trim(m.otherActivityNote) ? (
                                      <span className="text-emerald-700">{trim(m.otherActivityNote)}</span>
                                    ) : null}
                                  </span>
                                ) : (
                                  m.otherActivityNote?.trim()
                                )}
                              </div>
                            ) : null}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
                return (
                  <div
                    key={r.id}
                    className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedRevisionId(isExpanded ? null : r.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/80 transition-colors"
                    >
                      <span className="text-gray-400 shrink-0">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                      <span className="text-xs text-gray-500 w-[72px] shrink-0">{r.date}</span>
                      <span className="text-sm font-medium text-gray-800 shrink-0">{r.updater}</span>
                      <span className="text-sm text-gray-600 flex-1 min-w-0 truncate">{r.summary}</span>
                      {hasDetail && (
                        <span className="text-xs text-amber-600 shrink-0">
                          {isExpanded ? '收起' : '展开详情'}
                        </span>
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-4 space-y-4 text-sm">
                        {r.sectionNote?.trim() ? (
                          <div>
                            <span className="font-medium text-gray-600">涉及章节/备注：</span>
                            <span className="text-gray-700 ml-1">{r.sectionNote}</span>
                          </div>
                        ) : null}
                        {beforePayload && afterPayload ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {diffLabels.length ? (
                                diffLabels.map((lb) => (
                                  <span
                                    key={`lb-${lb}`}
                                    className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50/60 px-2.5 py-1 text-[11px] font-semibold text-[#C87800]"
                                  >
                                    {lb}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-500">本条无可识别的变更模块</span>
                              )}
                            </div>

                            <div className="space-y-3">
                              {diffLabels.map((lb) => {
                                const b = beforePayload
                                const a = afterPayload
                                const listBefore = () => {
                                  switch (lb) {
                                    case '智能家居':
                                      return listNormalize(b.smartHomeOptions)
                                    case '全屋设备':
                                      return listNormalize(b.devices)
                                    case '系统设备':
                                      return listNormalize(b.comfortSystems)
                                    case '收纳重点':
                                      return listNormalize(b.storageFocus)
                                    default:
                                      return []
                                  }
                                }
                                const listAfter = () => {
                                  switch (lb) {
                                    case '智能家居':
                                      return listNormalize(a.smartHomeOptions)
                                    case '全屋设备':
                                      return listNormalize(a.devices)
                                    case '系统设备':
                                      return listNormalize(a.comfortSystems)
                                    case '收纳重点':
                                      return listNormalize(a.storageFocus)
                                    default:
                                      return []
                                  }
                                }

                                if (['智能家居', '全屋设备', '系统设备', '收纳重点'].includes(lb)) {
                                  const beforeList = listBefore()
                                  const afterList = listAfter()
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '项目概览') {
                                  const getTrim = (v?: string) => String(v ?? '').trim()
                                  const fields = [
                                    { label: '项目城市', bv: getTrim(b.projectLocation), av: getTrim(a.projectLocation) },
                                    { label: '项目类型', bv: getTrim(b.projectType), av: getTrim(a.projectType) },
                                    { label: '实际面积（㎡）', bv: getTrim(b.projectArea), av: getTrim(a.projectArea) },
                                    { label: '预算范围', bv: getTrim(b.budgetStandard), av: getTrim(a.budgetStandard) },
                                    { label: '入住周期', bv: getTrim(b.timeline), av: getTrim(a.timeline) },
                                    { label: '房屋用途', bv: getTrim(b.houseUsage), av: getTrim(a.houseUsage) },
                                    { label: '采光', bv: getTrim(b.lighting), av: getTrim(a.lighting) },
                                    { label: '通风', bv: getTrim(b.ventilation), av: getTrim(a.ventilation) },
                                    { label: '层高', bv: getTrim(b.ceilingHeight), av: getTrim(a.ceilingHeight) },
                                    { label: '噪音', bv: getTrim(b.noise), av: getTrim(a.noise) },
                                  ]
                                  const active = fields.filter((x) => x.bv || x.av)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          <div className="space-y-1">
                                            {active.map((f) => (
                                              <div key={`b-${f.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                {f.label}：{f.bv || '无'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div className="space-y-1">
                                            {active.map((f) => {
                                              if (f.bv === f.av) {
                                                return (
                                                  <div key={`a-${f.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                    {f.label}：{f.av}
                                                  </div>
                                                )
                                              }
                                              return (
                                                <div key={`a-${f.label}`} className="space-y-1">
                                                  {f.av ? (
                                                    <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                      + {f.label}：{f.av}
                                                    </div>
                                                  ) : null}
                                                  {f.bv ? (
                                                    <div className="text-xs text-red-600 line-through leading-relaxed">
                                                      - {f.label}：{f.bv}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '成员画像') {
                                  const beforeMembers = b.requirementsMembers ?? []
                                  const afterMembers = a.requirementsMembers ?? []
                                  const beforeIds = new Set(beforeMembers.map((m) => m.id))
                                  const afterIds = new Set(afterMembers.map((m) => m.id))
                                  const addedIds = new Set(afterMembers.filter((m) => !beforeIds.has(m.id)).map((m) => m.id))
                                  const removedMembers = beforeMembers.filter((m) => !afterIds.has(m.id))
                                  const beforeMemberMap = new Map(beforeMembers.map((m) => [m.id, m]))

                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderMembersColumn(beforeMembers)}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div>
                                            {renderMembersColumn(afterMembers, {
                                              highlightIds: addedIds,
                                              nameClassNameWhenHighlighted: 'text-emerald-700',
                                              beforeMemberMap,
                                            })}
                                            {removedMembers.length ? (
                                              <div className="pt-3">
                                                <div className="space-y-2">
                                                  {removedMembers.map((m) => (
                                                    <div key={m.id} className="space-y-1">
                                                      <div className="text-xs font-semibold text-red-600 line-through leading-snug">
                                                        - {m.name}
                                                        {m.displayName?.trim() ? (
                                                          <span className="text-red-600 font-normal">（{m.displayName.trim()}）</span>
                                                        ) : null}
                                                      </div>
                                                      {m.spaces?.length ? (
                                                        <div className="text-[11px] text-red-600 leading-relaxed">
                                                          空间：{m.spaces.map((s) => s.name).join('、')}
                                                        </div>
                                                      ) : null}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '户型图') {
                                  const beforeList = (b.floorPlanImages ?? []).map((x) => String(x.name ?? '').trim()).filter(Boolean)
                                  const afterList = (a.floorPlanImages ?? []).map((x) => String(x.name ?? '').trim()).filter(Boolean)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '现场照片/视频') {
                                  const beforeList = (b.siteMedia ?? [])
                                    .map((x) => `${String(x.name ?? '').trim()}（${String(x.kind ?? '').trim() || 'image'}）`)
                                    .filter((s) => s.replace(/\s/g, '').length > 0)
                                  const afterList = (a.siteMedia ?? [])
                                    .map((x) => `${String(x.name ?? '').trim()}（${String(x.kind ?? '').trim() || 'image'}）`)
                                    .filter((s) => s.replace(/\s/g, '').length > 0)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '自定义空间需求') {
                                  const toKey = (x: { name: string; description?: string }) =>
                                    `${String(x.name ?? '').trim()}|${String(x.description ?? '').trim()}`
                                  const beforeRaw = b.customSpaceItems ?? []
                                  const afterRaw = a.customSpaceItems ?? []
                                  const beforeKeys = new Set(beforeRaw.map(toKey))
                                  const afterKeys = new Set(afterRaw.map(toKey))
                                  const beforeList = beforeRaw.map((x) =>
                                    x.description?.trim() ? `${x.name}（${x.description.trim()}）` : String(x.name ?? '').trim(),
                                  ).filter(Boolean)
                                  const afterList = afterRaw.map((x) =>
                                    x.description?.trim() ? `${x.name}（${x.description.trim()}）` : String(x.name ?? '').trim(),
                                  ).filter(Boolean)
                                  // 由于展示字符串与 key 可能不完全一致，这里不做逐项 removed/added 精细标红，仅做列表对比。
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '自定义核心空间') {
                                  const beforeList = listNormalize(b.customCoreSpaceOptions)
                                  const afterList = listNormalize(a.customCoreSpaceOptions)
                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'before' })}
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          {renderListColumn({ before: beforeList, after: afterList, mode: 'after' })}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                if (lb === '空间规划') {
                                  const getTrim = (v?: string) => String(v ?? '').trim()
                                  const beforeCustom = listNormalize(b.customCoreSpaceOptions)
                                  const afterCustom = listNormalize(a.customCoreSpaceOptions)
                                  const beforeCustomKey = JSON.stringify([...beforeCustom].sort())
                                  const afterCustomKey = JSON.stringify([...afterCustom].sort())
                                  const activeRows = [
                                    { label: '核心空间配置', bv: getTrim(b.coreSpaces), av: getTrim(a.coreSpaces), kind: 'text' as const },
                                    {
                                      label: '自定义核心空间',
                                      bv: beforeCustom.join('、'),
                                      av: afterCustom.join('、'),
                                      kind: 'list' as const,
                                      bvKey: beforeCustomKey,
                                      avKey: afterCustomKey,
                                    },
                                    { label: '儿童成长', bv: getTrim(b.childGrowth), av: getTrim(a.childGrowth), kind: 'text' as const },
                                    { label: '访客留宿', bv: getTrim(b.guestStay), av: getTrim(a.guestStay), kind: 'text' as const },
                                    { label: '未来变动', bv: getTrim(b.futureChanges), av: getTrim(a.futureChanges), kind: 'text' as const },
                                  ].filter((r) => r.bv || r.av)

                                  return (
                                    <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                      <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                        <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                      </div>
                                      <div className="grid gap-3 sm:grid-cols-2 p-4">
                                        <div className="rounded-lg border border-gray-100 bg-white p-3">
                                          <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                          <div className="space-y-1">
                                            {activeRows.map((r) => (
                                              <div key={`b-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                {r.label}：{r.bv || '无'}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                          <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                          <div className="space-y-1">
                                            {activeRows.map((r) => {
                                              if (r.kind === 'list') {
                                                const same = (r as any).bvKey === (r as any).avKey
                                                if (same) {
                                                  return (
                                                    <div key={`a-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                      {r.label}：{r.av}
                                                    </div>
                                                  )
                                                }
                                                return (
                                                  <div key={`a-${r.label}`} className="space-y-1">
                                                    {r.av ? (
                                                      <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                        + {r.label}：{r.av}
                                                      </div>
                                                    ) : null}
                                                    {r.bv ? (
                                                      <div className="text-xs text-red-600 line-through leading-relaxed">
                                                        - {r.label}：{r.bv}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )
                                              }

                                              if (r.bv === r.av) {
                                                return (
                                                  <div key={`a-${r.label}`} className="text-xs text-gray-800 leading-relaxed">
                                                    {r.label}：{r.av}
                                                  </div>
                                                )
                                              }

                                              return (
                                                <div key={`a-${r.label}`} className="space-y-1">
                                                  {r.av ? (
                                                    <div className="text-xs text-emerald-700 font-semibold leading-relaxed">
                                                      + {r.label}：{r.av}
                                                    </div>
                                                  ) : null}
                                                  {r.bv ? (
                                                    <div className="text-xs text-red-600 line-through leading-relaxed">
                                                      - {r.label}：{r.bv}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                }

                                // 文本类：其它需求说明/风水/空间其他说明/客厅/餐厅/厨房/卫生间/核心空间/儿童成长/访客留宿/未来变动
                                const beforeText = (() => {
                                  switch (lb) {
                                    case '其他需求说明':
                                      return b.otherNeeds
                                    case '风水与禁忌':
                                      return b.fengshui
                                    case '空间其他说明':
                                      return b.spaceOtherNote
                                    case '客厅需求':
                                      return b.livingRoomNote
                                    case '餐厅需求':
                                      return b.diningNote
                                    case '厨房需求':
                                      return b.kitchenNote
                                    case '卫生间需求':
                                      return b.bathroomNote
                                    case '核心空间配置':
                                      return b.coreSpaces
                                    case '儿童成长':
                                      return b.childGrowth
                                    case '访客留宿':
                                      return b.guestStay
                                    case '未来变动':
                                      return b.futureChanges
                                    default:
                                      return ''
                                  }
                                })()
                                const afterText = (() => {
                                  switch (lb) {
                                    case '其他需求说明':
                                      return a.otherNeeds
                                    case '风水与禁忌':
                                      return a.fengshui
                                    case '空间其他说明':
                                      return a.spaceOtherNote
                                    case '客厅需求':
                                      return a.livingRoomNote
                                    case '餐厅需求':
                                      return a.diningNote
                                    case '厨房需求':
                                      return a.kitchenNote
                                    case '卫生间需求':
                                      return a.bathroomNote
                                    case '核心空间配置':
                                      return a.coreSpaces
                                    case '儿童成长':
                                      return a.childGrowth
                                    case '访客留宿':
                                      return a.guestStay
                                    case '未来变动':
                                      return a.futureChanges
                                    default:
                                      return ''
                                  }
                                })()

                                return (
                                  <div key={lb} className="rounded-lg border border-gray-100 bg-white overflow-hidden">
                                    <div className="px-4 py-2 bg-gray-50/90 flex items-center justify-between">
                                      <div className="text-sm font-semibold text-gray-900">{lb}</div>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 p-4">
                                      <div className="rounded-lg border border-gray-100 bg-white p-3">
                                        <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                                        {renderTextValue(beforeText)}
                                      </div>
                                      <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-3">
                                        <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                                        {renderTextValue(afterText)}
                                        {beforeText?.trim() && String(beforeText).trim() !== String(afterText ?? '').trim() ? (
                                          <div className="pt-2">
                                            <div className="text-xs text-red-600 line-through whitespace-pre-wrap break-words font-sans leading-relaxed">
                                              - {String(beforeText ?? '').trim()}
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-100 bg-white p-3">
                              <div className="font-medium text-gray-600 mb-1.5">变更前</div>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-sans leading-relaxed">
                                {beforeDetailText?.trim() || '（无记录）'}
                              </pre>
                            </div>
                            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                              <div className="font-medium text-amber-800 mb-1.5">变更后</div>
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words font-sans leading-relaxed">
                                {afterDetailText?.trim() || '（无记录）'}
                              </pre>
                            </div>
                          </div>
                        )}
                        {r.docSnapshotJson && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => onViewSnapshot(r)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-[#C87800] hover:bg-[#FFF4E0] transition-colors"
                            >
                              <Eye size={14} />
                              查看该版需求书快照
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
    </>
  )
}
