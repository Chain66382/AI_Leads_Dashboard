import { useState } from 'react'
import {
  DESTINATION_LABELS,
  PLATFORM_META,
  STATUS_LABELS,
} from '../config'
import type { DashboardFilters, Lead } from '../types'

interface LeadTableProps {
  leads: Lead[]
  filters: DashboardFilters
  onFiltersChange: (next: DashboardFilters) => void
  selectedId?: string
  onSelect: (lead: Lead) => void
}

type FilterMode = 'destination' | 'status' | 'score'

export function LeadTable({
  leads,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
}: LeadTableProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('destination')

  if (!leads.length) {
    return (
      <section className="panel lead-table-panel empty-state">
        <h2>暂无抓取数据</h2>
        <p>可以先补充 `src/data/leads.json`，或调整筛选条件查看结果。</p>
      </section>
    )
  }

  return (
    <section className="panel lead-table-panel">
      <div className="lead-table-header">
        <div className="panel-header-copy">
          <h2>Lead 列表</h2>
          <p>按去向、状态、评分和来源平台观察不同线索的推进情况</p>
        </div>
        <div className="lead-table-tools">
          <label className="inline-filter" htmlFor="platform-filter">
            <span>来源平台</span>
            <select
              id="platform-filter"
              value={filters.platform}
              onChange={(event) =>
                onFiltersChange({
                  ...filters,
                  platform: event.target.value as DashboardFilters['platform'],
                })
              }
            >
              <option value="all">全部平台</option>
              {Object.entries(PLATFORM_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
          <span className="table-count">当前 {leads.length} 条</span>
        </div>
      </div>

      <div className="table-filter-single">
        <div className="filter-mode-tabs">
          <button
            className={`mode-tab ${filterMode === 'destination' ? 'active' : ''}`}
            onClick={() => setFilterMode('destination')}
            type="button"
          >
            去向
          </button>
          <button
            className={`mode-tab ${filterMode === 'status' ? 'active' : ''}`}
            onClick={() => setFilterMode('status')}
            type="button"
          >
            状态
          </button>
          <button
            className={`mode-tab ${filterMode === 'score' ? 'active' : ''}`}
            onClick={() => setFilterMode('score')}
            type="button"
          >
            Lead 评分
          </button>
        </div>

        <div className="chip-filter-row single">
          {filterMode === 'destination' && (
            <>
              <button
                className={`filter-chip ${filters.destination === 'all' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, destination: 'all' })}
                type="button"
              >
                全部去向
              </button>
              {Object.entries(DESTINATION_LABELS).map(([key, label]) => (
                <button
                  className={`filter-chip ${
                    filters.destination === key ? 'active' : ''
                  }`}
                  key={key}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      destination: key as DashboardFilters['destination'],
                    })
                  }
                  type="button"
                >
                  {label}
                </button>
              ))}
            </>
          )}

          {filterMode === 'status' && (
            <>
              <button
                className={`filter-chip ${filters.status === 'all' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, status: 'all' })}
                type="button"
              >
                全部状态
              </button>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button
                  className={`filter-chip ${filters.status === key ? 'active' : ''}`}
                  key={key}
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      status: key as DashboardFilters['status'],
                    })
                  }
                  type="button"
                >
                  {label}
                </button>
              ))}
            </>
          )}

          {filterMode === 'score' && (
            <>
              <button
                className={`filter-chip ${filters.scoreRange === 'all' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, scoreRange: 'all' })}
                type="button"
              >
                全部评分
              </button>
              <button
                className={`filter-chip ${filters.scoreRange === '80+' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, scoreRange: '80+' })}
                type="button"
              >
                80+
              </button>
              <button
                className={`filter-chip ${filters.scoreRange === '60-79' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, scoreRange: '60-79' })}
                type="button"
              >
                60-79
              </button>
              <button
                className={`filter-chip ${filters.scoreRange === '<60' ? 'active' : ''}`}
                onClick={() => onFiltersChange({ ...filters, scoreRange: '<60' })}
                type="button"
              >
                60 以下
              </button>
            </>
          )}
        </div>
      </div>

      <div className="lead-table-wrap">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>评分</th>
              <th>去向</th>
              <th>状态</th>
              <th>状态更新时间</th>
              <th>抓取时间</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                className={selectedId === lead.id ? 'selected' : ''}
                key={lead.id}
                onClick={() => onSelect(lead)}
              >
                <td>
                  <div className="lead-primary">
                    <strong>{lead.name}</strong>
                    <span>{lead.company}</span>
                    <span>{lead.title}</span>
                  </div>
                </td>
                <td>
                  <span className="score-pill">{lead.leadScore}</span>
                </td>
                <td>{DESTINATION_LABELS[lead.destination]}</td>
                <td>
                  <span className={`status-chip ${lead.status}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td>{formatDate(lead.statusUpdatedAt)}</td>
                <td>{formatDate(lead.capturedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
