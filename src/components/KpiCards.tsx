import type { KpiItem } from '../types'

interface KpiCardsProps {
  items: KpiItem[]
}

export function KpiCards({ items }: KpiCardsProps) {
  return (
    <section className="kpi-grid">
      {items.map((item) => (
        <article className="kpi-card" key={item.label}>
          <p>{item.label}</p>
          <strong>{item.value}</strong>
          <span>{item.hint}</span>
        </article>
      ))}
    </section>
  )
}
