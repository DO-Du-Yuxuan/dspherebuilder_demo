import type { FormData, RequirementDocSnapshotStored } from '../types'
import { initialFormDataForSnapshot } from '../types'

/** 超大 base64 图用占位图，保证快照 JSON 体积可控且版面仍有图位 */
export const SNAPSHOT_MEDIA_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220"><rect fill="#F3F4F6" width="100%" height="100%"/><text x="50%" y="46%" text-anchor="middle" fill="#9CA3AF" font-size="12">快照</text><text x="50%" y="58%" text-anchor="middle" fill="#9CA3AF" font-size="10">图档占位</text></svg>`,
  )

export function compactMediaUrlForSnapshot(url: string | undefined): string {
  if (!url || url.length > 12000) return SNAPSHOT_MEDIA_PLACEHOLDER
  return url
}

/** 写入修订时：合并当前表单 + 本次保存块，并压缩媒体 */
export function buildRevisionSnapshotFormData(d: FormData, edits: Partial<FormData>): FormData {
  const m = { ...initialFormDataForSnapshot, ...d, ...edits } as FormData
  m.requirementDocRevisions = []
  m.floorPlanImages = (m.floorPlanImages ?? []).map((x) => ({
    name: x.name,
    url: compactMediaUrlForSnapshot(x.url),
  }))
  m.siteMedia = (m.siteMedia ?? []).map((x) => ({
    name: x.name,
    kind: x.kind,
    url: compactMediaUrlForSnapshot(x.url),
  }))
  return m
}

export function storedSnapshotToFormData(s: RequirementDocSnapshotStored): FormData {
  const fd = { ...initialFormDataForSnapshot } as FormData
  fd.smartHomeOptions = [...(s.smartHomeOptions ?? [])]
  fd.devices = [...(s.devices ?? [])]
  fd.otherNeeds = s.otherNeeds ?? ''
  fd.comfortSystems = [...(s.comfortSystems ?? [])]
  fd.fengshui = s.fengshui ?? ''
  fd.storageFocus = [...(s.storageFocus ?? [])]
  fd.spaceOtherNote = s.spaceOtherNote ?? ''
  fd.livingRoomNote = s.livingRoomNote ?? ''
  fd.diningNote = s.diningNote ?? ''
  fd.kitchenNote = s.kitchenNote ?? ''
  fd.bathroomNote = s.bathroomNote ?? ''
  fd.coreSpaces = s.coreSpaces ?? ''
  fd.customCoreSpaceOptions = [...(s.customCoreSpaceOptions ?? [])]
  fd.childGrowth = s.childGrowth ?? ''
  fd.guestStay = s.guestStay ?? ''
  fd.futureChanges = s.futureChanges ?? ''
  fd.requirementsMembers = JSON.parse(JSON.stringify(s.requirementsMembers ?? []))
  fd.floorPlanImages = (s.floorPlanImages ?? []).map((x) => ({
    name: x.name,
    url: SNAPSHOT_MEDIA_PLACEHOLDER,
  }))
  fd.siteMedia = (s.siteMedia ?? []).map((x) => ({
    name: x.name,
    kind: (x.kind as 'image' | 'video') || 'image',
    url: SNAPSHOT_MEDIA_PLACEHOLDER,
  }))
  fd.customSpaceItems = JSON.parse(JSON.stringify(s.customSpaceItems ?? []))
  fd.requirementDocRevisions = []
  return fd
}

export function parseDocSnapshotJson(json: string | undefined): FormData | null {
  if (!json?.trim()) return null
  try {
    const o = JSON.parse(json) as { v?: number; formData?: FormData; smartHomeOptions?: string[] }
    if (o.v === 2 && o.formData && typeof o.formData === 'object') {
      return { ...initialFormDataForSnapshot, ...o.formData, requirementDocRevisions: [] } as FormData
    }
    if (Array.isArray(o.smartHomeOptions) || Array.isArray((o as RequirementDocSnapshotStored).devices)) {
      return storedSnapshotToFormData(o as RequirementDocSnapshotStored)
    }
  } catch {
    /* ignore */
  }
  return null
}
