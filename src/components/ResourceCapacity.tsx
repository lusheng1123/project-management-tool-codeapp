import { useMemo } from 'react'
import { DS } from '../data'

export function ResourceCapacity() {
  const resources = useMemo(() => DS.getAll('pm_resource'), [])
  const assignments = useMemo(() => DS.getAll('pm_assignment'), [])
  const stories = useMemo(() => DS.getAll('pm_userstory'), [])
  const epics = useMemo(() => DS.getAll('pm_epic'), [])

  const teamCapacity = useMemo(() => {
    // Group resources by team
    const teams: Record<string, { members: any[]; totalSP: number; epicDetails: { epic: string; sp: number }[] }> = {}

    resources.forEach((r: any) => {
      const team = r.pm_team || 'Unassigned'
      if (!teams[team]) teams[team] = { members: [], totalSP: 0, epicDetails: [] }
      teams[team].members.push(r)
    })

    // Calculate story points per resource assignment
    assignments.forEach((a: any) => {
      const resource = resources.find((r: any) => r.id === a.pm_resource)
      if (!resource) return
      const team = resource.pm_team || 'Unassigned'
      if (!teams[team]) return

      const epic = epics.find((e: any) => e.id === a.pm_epic)
      if (!epic) return

      const epicStories = stories.filter((s: any) => s.pm_epicid === epic.id)
      const allocPct = (Number(a.pm_allocationpct) || 100) / 100
      const sp = epicStories.reduce((sum: number, s: any) => sum + (Number(s.pm_storypoint) || 0), 0) * allocPct

      teams[team].totalSP += sp
      if (sp > 0) teams[team].epicDetails.push({ epic: epic.pm_title, sp: Math.round(sp) })
    })

    return Object.entries(teams)
      .map(([team, data]) => ({
        team,
        members: data.members.length,
        totalSP: Math.round(data.totalSP),
        capacity: data.members.length * 40,
      }))
      .sort((a, b) => b.totalSP - a.totalSP)
  }, [resources, assignments, stories, epics])

  if (teamCapacity.length === 0) return null

  return (
    <div style={{ width: '100%' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)' }}>
        👥 Team Capacity (Story Points)
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {teamCapacity.map(t => {
          const pct = Math.min(Math.round((t.totalSP / Math.max(t.capacity, 1)) * 100), 100)
          const barColor = pct > 100 ? 'var(--red)' : pct > 80 ? 'var(--amber)' : 'var(--green)'
          return (
            <div key={t.team} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{ width: '72px', fontWeight: 500, textAlign: 'right', flexShrink: 0 }}>
                {t.team}
              </span>
              <div style={{
                flex: 1, height: '22px', background: 'var(--border-light)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative'
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%', background: barColor,
                  borderRadius: 'var(--radius-sm)', minWidth: pct > 0 ? '4px' : '0',
                  transition: 'width 0.3s ease'
                }} />
                <span style={{
                  position: 'absolute', left: '8px', top: '2px',
                  fontSize: '0.7rem', color: 'var(--text)', fontWeight: 600
                }}>
                  {t.totalSP} SP
                </span>
              </div>
              <span style={{ width: '56px', flexShrink: 0, color: barColor, fontWeight: 600, fontSize: '0.7rem' }}>
                {pct}% ({t.members}p)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
