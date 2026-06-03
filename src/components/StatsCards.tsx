
export function StatsCards({ stats }: { stats: { value: string | number; label: string }[] }) { return <div className="stats-row">{stats.map((s, i) => <div key={i} className="stat-card"><div className="stat-number">{s.value}</div><div className="stat-label">{s.label}</div></div>)}</div> }
