interface DateRangeSelectorProps {
  days: string[]
  startIndex: number
  endIndex: number
  onChange: (next: { startIndex: number; endIndex: number }) => void
  onQuickSelect: (preset: 'today' | '7d' | '30d') => void
}

export function DateRangeSelector({
  days,
  startIndex,
  endIndex,
  onChange,
  onQuickSelect,
}: DateRangeSelectorProps) {
  const maxIndex = Math.max(days.length - 1, 0)
  const startDay = days[startIndex] ?? days[0]
  const endDay = days[endIndex] ?? days[maxIndex]

  return (
    <section className="date-panel">
      <div className="date-toolbar">
        <h2>日期筛选</h2>
        <div className="quick-actions">
          <button className="ghost-button" onClick={() => onQuickSelect('today')} type="button">
            当天
          </button>
          <button className="ghost-button" onClick={() => onQuickSelect('7d')} type="button">
            近七日
          </button>
          <button className="ghost-button" onClick={() => onQuickSelect('30d')} type="button">
            近一月
          </button>
        </div>
      </div>

      <div className="date-summary compact">
        <strong>{formatDay(startDay)}</strong>
        <span>至</span>
        <strong>{formatDay(endDay)}</strong>
        <em>共 {days.length ? endIndex - startIndex + 1 : 0} 天</em>
      </div>

      <div className="range-shell">
        <div className="range-track-base" />
        <div
          className="range-track-active"
          style={{
            left: `${(startIndex / Math.max(maxIndex, 1)) * 100}%`,
            width: `${((endIndex - startIndex) / Math.max(maxIndex, 1)) * 100}%`,
          }}
        />
        <input
          aria-label="开始日期"
          className="range-input"
          max={maxIndex}
          min={0}
          onChange={(event) => {
            const nextStart = Number(event.target.value)
            onChange({
              startIndex: Math.min(nextStart, endIndex),
              endIndex,
            })
          }}
          type="range"
          value={startIndex}
        />
        <input
          aria-label="结束日期"
          className="range-input"
          max={maxIndex}
          min={0}
          onChange={(event) => {
            const nextEnd = Number(event.target.value)
            onChange({
              startIndex,
              endIndex: Math.max(nextEnd, startIndex),
            })
          }}
          type="range"
          value={endIndex}
        />
      </div>
    </section>
  )
}

function formatDay(day: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(`${day}T00:00:00`))
}
