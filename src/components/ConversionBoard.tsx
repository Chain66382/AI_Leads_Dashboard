import type { DestinationConversion } from '../utils/dashboard'

interface ConversionBoardProps {
  items: DestinationConversion[]
}

export function ConversionBoard({ items }: ConversionBoardProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>各地区和 AI 转化情况</h2>
          <p>按去向查看触达与转化漏斗推进</p>
        </div>
      </div>

      <div className="conversion-grid">
        {items.map((item) => (
          <article className="conversion-card" key={item.destination}>
            <div className="conversion-head">
              <strong>{item.label}</strong>
              <span>{item.total} 条</span>
            </div>
            <div className="conversion-metrics">
              <span>触达 {item.reached}</span>
              <span>入社区 {item.community}</span>
              <span>注册 {item.registered}</span>
              <span>开户 {item.accountOpened}</span>
              <span>入金 {item.deposited}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
