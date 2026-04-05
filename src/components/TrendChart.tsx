import type { PieSlice, TrendPoint } from '../utils/dashboard'

interface TrendChartProps {
  trendPoints: TrendPoint[]
  scoreSlices: PieSlice[]
  title: string
}

export function TrendChart({ trendPoints, scoreSlices, title }: TrendChartProps) {
  const maxTrend = Math.max(...trendPoints.map((point) => point.count), 1)
  const pieBackground = buildPieGradient(scoreSlices)
  const dominantSlice =
    scoreSlices.reduce((top, slice) => (slice.count > top.count ? slice : top), scoreSlices[0]) ??
    null

  return (
    <section className="analytics-grid">
      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
            <p>横坐标按周展示日期范围</p>
          </div>
        </div>
        <div className="trend-chart weekly-chart">
          {trendPoints.map((point) => (
            <div className="trend-column" key={point.label}>
              <span className="trend-value">{point.count}</span>
              <div className="trend-track">
                <div
                  className="trend-fill"
                  style={{ height: `${(point.count / maxTrend) * 100}%` }}
                />
              </div>
              <span className="trend-label range">{point.label}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <h2>评分分布</h2>
            <p>高、中、低评分 lead 的占比结构</p>
          </div>
        </div>
        <div className="pie-layout enhanced">
          <div className="pie-shell">
            <div className="pie-chart enhanced" style={{ background: pieBackground }}>
              <div className="pie-center">
                <span>占比最高</span>
                <strong>{dominantSlice?.label ?? '-'}</strong>
                <em>{dominantSlice?.percentage ?? 0}%</em>
              </div>
            </div>
          </div>
          <div className="pie-legend">
            {scoreSlices.map((slice) => (
              <div className="pie-legend-row" key={slice.label}>
                <span className="pie-dot" style={{ background: slice.color }} />
                <span>{getSliceLabel(slice.label)}</span>
                <em>{slice.count} 条</em>
                <strong>{slice.percentage}%</strong>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  )
}

function buildPieGradient(slices: PieSlice[]) {
  if (!slices.length) {
    return 'conic-gradient(#3a3a3a 0deg 360deg)'
  }

  let cursor = 0
  const parts = slices.map((slice) => {
    const start = cursor
    const end = cursor + (slice.percentage / 100) * 360
    cursor = end
    return `${slice.color} ${start}deg ${end}deg`
  })

  return `conic-gradient(from -90deg, ${parts.join(', ')})`
}

function getSliceLabel(label: string) {
  if (label === '80+') return '高分 80+'
  if (label === '60-79') return '中分 60-79'
  return '低分 60 以下'
}
