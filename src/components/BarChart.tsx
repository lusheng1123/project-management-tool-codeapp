interface BarChartProps {
  data: { label: string; value: number; color?: string }[]
  title: string
}

const COLORS = ['var(--primary)', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b']

export function BarChart({ data, title }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)

  return (
    <div style={{ width: '100%' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
        {title}
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
            <span style={{ width: '90px', textAlign: 'right', fontWeight: 500, flexShrink: 0 }}>
              {d.label}
            </span>
            <div style={{
              flex: 1, height: '22px', background: 'var(--border-light)',
              borderRadius: 'var(--radius-sm)', overflow: 'hidden'
            }}>
              <div style={{
                width: `${(d.value / max) * 100}%`, height: '100%',
                background: d.color || COLORS[i % COLORS.length],
                borderRadius: 'var(--radius-sm)', minWidth: d.value > 0 ? '4px' : '0',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{ width: '32px', fontWeight: 600, color: d.color || COLORS[i % COLORS.length], flexShrink: 0 }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
