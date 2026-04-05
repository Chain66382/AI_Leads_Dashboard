import type {
  LeadDestination,
  LeadStatus,
  PlatformKey,
  PlatformMeta,
} from './types'

export const DEFAULT_DAYS = 30
export const HIGH_INTENT_THRESHOLD = 80

export const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  x: { label: 'X', color: '#c6a86b' },
  linkedin: { label: 'LinkedIn', color: '#d7c29a' },
  telegram: { label: 'Telegram', color: '#b8894d' },
  discord: { label: 'Discord', color: '#8f6f47' },
  website: { label: '官网/表单', color: '#f2dfbd' },
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  assigned: '已分配',
  reached: '已触达',
  community: '已入社区',
  registered: '已注册',
  account_opened: '已开户',
  deposited: '已入金',
}

export const STATUS_ORDER: LeadStatus[] = [
  'assigned',
  'reached',
  'community',
  'registered',
  'account_opened',
  'deposited',
]

export const INTENT_LABELS = {
  high: '高意向',
  medium: '中意向',
  low: '低意向',
} as const

export const DESTINATION_LABELS: Record<LeadDestination, string> = {
  th_team: '泰国团队',
  my_team: '马来西亚团队',
  hk_team: '香港团队',
  id_team: '印尼团队',
  vn_team: '越南团队',
  za_team: '南非团队',
  ai_outreach: 'AI 触达',
}
