export type PlatformKey = 'x' | 'linkedin' | 'telegram' | 'discord' | 'website'

export type LeadStatus =
  | 'assigned'
  | 'reached'
  | 'community'
  | 'registered'
  | 'account_opened'
  | 'deposited'

export type LeadDestination =
  | 'th_team'
  | 'my_team'
  | 'hk_team'
  | 'id_team'
  | 'vn_team'
  | 'za_team'
  | 'ai_outreach'

export type IntentLevel = 'high' | 'medium' | 'low'

export interface LeadContact {
  email?: string
  telegram?: string
  x?: string
  linkedin?: string
}

export interface Lead {
  id: string
  name: string
  company: string
  title: string
  platform: PlatformKey
  leadScore: number
  intentLevel: IntentLevel
  tags: string[]
  region: string
  industry: string
  followersOrCompanySize: string
  contact: LeadContact
  sourceUrl: string
  snippet: string
  capturedAt: string
  status: LeadStatus
  statusUpdatedAt: string
  destination: LeadDestination
  owner: string
  nextFollowUpAt?: string
  notes: string
}

export interface DashboardFilters {
  platform: PlatformKey | 'all'
  destination: LeadDestination | 'all'
  status: LeadStatus | 'all'
  scoreRange: 'all' | '80+' | '60-79' | '<60'
}

export interface PlatformMeta {
  label: string
  color: string
}

export interface KpiItem {
  label: string
  value: string
  hint: string
}
