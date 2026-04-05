import { useState } from 'react'
import { DateRangeSelector } from './components/DateRangeSelector'
import { KpiCards } from './components/KpiCards'
import { LeadTable } from './components/LeadTable'
import { TrendChart } from './components/TrendChart'
import { ConversionBoard } from './components/ConversionBoard'
import rawLeads from './data/leads.json'
import { DEFAULT_DAYS } from './config'
import type { DashboardFilters, Lead } from './types'
import {
  filterLeads,
  filterLeadsByDateRange,
  getDateBounds,
  getDateSequence,
  getDestinationConversions,
  getKpis,
  getScorePieSlices,
  getSummaryStats,
  getTrendPoints,
  normalizeLeads,
} from './utils/dashboard'

const initialFilters: DashboardFilters = {
  platform: 'all',
  destination: 'all',
  status: 'all',
  scoreRange: 'all',
}

export default function App() {
  const normalizedLeads = normalizeLeads(rawLeads as Lead[])
  const bounds = getDateBounds(normalizedLeads)
  const availableDays = getDateSequence(bounds.min, bounds.max)
  const defaultEndIndex = Math.max(availableDays.length - 1, 0)
  const defaultStartIndex = Math.max(defaultEndIndex - (DEFAULT_DAYS - 1), 0)

  const [filters, setFilters] = useState<DashboardFilters>(initialFilters)
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>()
  const [dateRange, setDateRange] = useState({
    startIndex: defaultStartIndex,
    endIndex: defaultEndIndex,
  })

  const rangeStartDay = availableDays[dateRange.startIndex] ?? bounds.min
  const rangeEndDay = availableDays[dateRange.endIndex] ?? bounds.max
  const leadsInRange = filterLeadsByDateRange(
    normalizedLeads,
    rangeStartDay,
    rangeEndDay,
  )
  const filteredLeads = filterLeads(leadsInRange, filters)
  const selectedLead =
    filteredLeads.find((lead) => lead.id === selectedLeadId) ?? filteredLeads[0]
  const rangeLabel = `${formatDay(rangeStartDay)} - ${formatDay(rangeEndDay)}`
  const summary = getSummaryStats(leadsInRange)
  const kpis = getKpis(leadsInRange, rangeLabel)
  const trendWeeks = Math.max(
    1,
    Math.ceil((dateRange.endIndex - dateRange.startIndex + 1) / 7),
  )
  const trendPoints = getTrendPoints(leadsInRange, trendWeeks)
  const scoreSlices = getScorePieSlices(leadsInRange)
  const destinationConversions = getDestinationConversions(leadsInRange)

  function applyQuickRange(preset: 'today' | '7d' | '30d') {
    const endIndex = Math.max(availableDays.length - 1, 0)
    const span = preset === 'today' ? 0 : preset === '7d' ? 6 : 29
    setDateRange({
      startIndex: Math.max(endIndex - span, 0),
      endIndex,
    })
  }

  return (
    <div className="app-shell">
      <div className="hero hero-title-only">
        <div>
          <p className="eyebrow">LeadsAI Dashboard</p>
          <h1>智能增长引擎</h1>
        </div>
      </div>

      <KpiCards items={kpis} />

      <main className="main-column">
        <section className="top-grid">
          <DateRangeSelector
            days={availableDays}
            endIndex={dateRange.endIndex}
            onChange={setDateRange}
            onQuickSelect={applyQuickRange}
            startIndex={dateRange.startIndex}
          />
          <article className="hero-card summary-card">
            <span>摘要</span>
            <p>
              {formatDay(rangeStartDay)} 至 {formatDay(rangeEndDay)}，获取了 {summary.total}{' '}
              条 leads，已触达 {summary.reached} 条，已入社区 {summary.community} 条，已注册{' '}
              {summary.registered} 条，已开户 {summary.accountOpened} 条，已入金{' '}
              {summary.deposited} 条。
            </p>
          </article>
        </section>
        <ConversionBoard items={destinationConversions} />
        <TrendChart
          scoreSlices={scoreSlices}
          title="抓取趋势"
          trendPoints={trendPoints}
        />
        <LeadTable
          filters={filters}
          leads={filteredLeads}
          onFiltersChange={setFilters}
          onSelect={(lead) => setSelectedLeadId(lead.id)}
          selectedId={selectedLead?.id}
        />
      </main>
    </div>
  )
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${day}T00:00:00`))
}
