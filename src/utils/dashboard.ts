import {
  DESTINATION_LABELS,
  HIGH_INTENT_THRESHOLD,
  STATUS_ORDER,
} from '../config'
import type {
  DashboardFilters,
  KpiItem,
  Lead,
  LeadDestination,
  LeadStatus,
} from '../types'

export interface ScoreBucket {
  label: string
  count: number
}

export interface TrendPoint {
  label: string
  count: number
}

export interface PieSlice {
  label: string
  count: number
  percentage: number
  color: string
}

export interface DateBounds {
  min: string
  max: string
}

export interface SummaryStats {
  total: number
  reached: number
  community: number
  registered: number
  accountOpened: number
  deposited: number
}

export interface DestinationConversion {
  destination: LeadDestination
  label: string
  total: number
  reached: number
  community: number
  registered: number
  accountOpened: number
  deposited: number
}

export function normalizeLeads(leads: Lead[]): Lead[] {
  return leads.map((lead) => ({
    ...lead,
    company: lead.company || '未填写公司',
    title: lead.title || '未填写职位',
    region: lead.region || '未知地区',
    industry: lead.industry || '未分类',
    followersOrCompanySize: lead.followersOrCompanySize || '暂无数据',
    tags: lead.tags ?? [],
    contact: lead.contact ?? {},
    notes: lead.notes || '暂无备注',
  }))
}

export function getDateBounds(leads: Lead[]): DateBounds {
  if (!leads.length) {
    const today = toDayKey(new Date().toISOString())
    return { min: today, max: today }
  }

  const sorted = [...leads]
    .map((lead) => toDayKey(lead.capturedAt))
    .sort((left, right) => left.localeCompare(right))

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
  }
}

export function getDateSequence(minDay: string, maxDay: string): string[] {
  const days: string[] = []
  const cursor = new Date(`${minDay}T00:00:00`)
  const end = new Date(`${maxDay}T00:00:00`)

  while (cursor.getTime() <= end.getTime()) {
    days.push(toDayKey(cursor.toISOString()))
    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

export function filterLeadsByDateRange(
  leads: Lead[],
  startDay: string,
  endDay: string,
): Lead[] {
  const start = new Date(`${startDay}T00:00:00`).getTime()
  const end = new Date(`${endDay}T23:59:59.999`).getTime()

  return leads.filter((lead) => {
    const capturedAt = new Date(lead.capturedAt).getTime()
    return capturedAt >= start && capturedAt <= end
  })
}

export function filterLeads(leads: Lead[], filters: DashboardFilters): Lead[] {
  return leads.filter((lead) => {
    if (filters.platform !== 'all' && lead.platform !== filters.platform) {
      return false
    }

    if (filters.destination !== 'all' && lead.destination !== filters.destination) {
      return false
    }

    if (filters.status !== 'all' && lead.status !== filters.status) {
      return false
    }

    if (filters.scoreRange === '80+' && lead.leadScore < 80) {
      return false
    }

    if (
      filters.scoreRange === '60-79' &&
      (lead.leadScore < 60 || lead.leadScore > 79)
    ) {
      return false
    }

    if (filters.scoreRange === '<60' && lead.leadScore >= 60) {
      return false
    }

    return true
  })
}

export function getKpis(leads: Lead[], rangeLabel: string): KpiItem[] {
  const funnel = getSummaryStats(leads)
  const highIntent = leads.filter((lead) => lead.leadScore >= HIGH_INTENT_THRESHOLD)

  return [
    {
      label: '总 Leads',
      value: String(funnel.total),
      hint: rangeLabel,
    },
    {
      label: '高意向',
      value: String(highIntent.length),
      hint: `评分 >= ${HIGH_INTENT_THRESHOLD}`,
    },
    {
      label: '已触达',
      value: String(funnel.reached),
      hint: '进入触达阶段',
    },
    {
      label: '已注册',
      value: String(funnel.registered),
      hint: '完成注册',
    },
    {
      label: '已开户',
      value: String(funnel.accountOpened),
      hint: '完成开户',
    },
    {
      label: '已入金',
      value: String(funnel.deposited),
      hint: '最终成交推进',
    },
  ]
}

export function getSummaryStats(leads: Lead[]): SummaryStats {
  return {
    total: leads.length,
    reached: countAtOrBeyond(leads, 'reached'),
    community: countAtOrBeyond(leads, 'community'),
    registered: countAtOrBeyond(leads, 'registered'),
    accountOpened: countAtOrBeyond(leads, 'account_opened'),
    deposited: countAtOrBeyond(leads, 'deposited'),
  }
}

export function getDestinationConversions(leads: Lead[]): DestinationConversion[] {
  return Object.entries(DESTINATION_LABELS).map(([destination, label]) => {
    const subset = leads.filter((lead) => lead.destination === destination)
    return {
      destination: destination as LeadDestination,
      label,
      total: subset.length,
      reached: countAtOrBeyond(subset, 'reached'),
      community: countAtOrBeyond(subset, 'community'),
      registered: countAtOrBeyond(subset, 'registered'),
      accountOpened: countAtOrBeyond(subset, 'account_opened'),
      deposited: countAtOrBeyond(subset, 'deposited'),
    }
  })
}

export function getScoreBuckets(leads: Lead[]): ScoreBucket[] {
  const buckets: Record<'80+' | '60-79' | '<60', number> = {
    '80+': 0,
    '60-79': 0,
    '<60': 0,
  }

  leads.forEach((lead) => {
    if (lead.leadScore >= 80) {
      buckets['80+'] += 1
      return
    }
    if (lead.leadScore >= 60) {
      buckets['60-79'] += 1
      return
    }
    buckets['<60'] += 1
  })

  return Object.entries(buckets).map(([label, count]) => ({ label, count }))
}

export function getScorePieSlices(leads: Lead[]): PieSlice[] {
  const total = Math.max(leads.length, 1)
  const colors = {
    '80+': '#f2d38b',
    '60-79': '#4b7bec',
    '<60': '#8c6b4f',
  }

  return getScoreBuckets(leads).map((bucket) => ({
    ...bucket,
    percentage: Math.round((bucket.count / total) * 100),
    color: colors[bucket.label as keyof typeof colors],
  }))
}

export function getTrendPoints(leads: Lead[], weeks = 4): TrendPoint[] {
  const points: TrendPoint[] = []
  const sorted = [...leads].sort((a, b) =>
    new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime(),
  )
  const rangeStart = sorted.length
    ? new Date(sorted[0].capturedAt)
    : new Date()
  const rangeEnd = sorted.length
    ? new Date(sorted[sorted.length - 1].capturedAt)
    : new Date()
  rangeStart.setHours(0, 0, 0, 0)
  rangeEnd.setHours(23, 59, 59, 999)

  const totalWeeks = Math.max(
    weeks,
    Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / (7 * 24 * 60 * 60 * 1000)),
  )

  for (let offset = 0; offset < totalWeeks; offset += 1) {
    const current = new Date(rangeStart)
    current.setDate(current.getDate() + offset * 7)
    const next = new Date(current)
    next.setDate(next.getDate() + 7)
    const displayEnd = new Date(next)
    displayEnd.setDate(displayEnd.getDate() - 1)

    const count = leads.filter((lead) => {
      const time = new Date(lead.capturedAt).getTime()
      return time >= current.getTime() && time < next.getTime()
    }).length

    points.push({
      label: `${current.getMonth() + 1}/${current.getDate()} - ${displayEnd.getMonth() + 1}/${displayEnd.getDate()}`,
      count,
    })
  }

  return points
}

function countAtOrBeyond(leads: Lead[], target: LeadStatus) {
  const targetIndex = STATUS_ORDER.indexOf(target)
  return leads.filter(
    (lead) => STATUS_ORDER.indexOf(lead.status) >= targetIndex,
  ).length
}

function toDayKey(value: string) {
  return value.slice(0, 10)
}
