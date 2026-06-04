import { useState, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useNavigation } from '../context/NavigationContext'
import { StatsCards } from '../components/StatsCards'

function SprintCard({ rel, navigate }: { rel: any; navigate: (t: string, id?: string) => void }) {
  return (
    <div
      onClick={() => navigate('releases', rel.id)}
      style={{
        padding: '12px', borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)', cursor: 'pointer', marginBottom: '8px',
        transition: 'box-shadow 0.15s'
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <strong style={{ fontSize: '0.82rem' }}>{rel.pm_releasename}</strong>
        <span className={`badge ${badgeClass(rel.pm_status)}`} style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{rel.pm_status}</span>
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {rel.pm_releasedate && <div>📅 {rel.pm_releasedate}</div>}
        <div style={{ marginTop: '2px' }}>
          {rel.storyCount} stories · {rel.signed} signed · {rel.totalSP} SP
          {rel.pending > 0 && <span style={{ color: 'var(--amber)' }}> · {rel.pending} pending</span>}
        </div>
      </div>
      {rel.pending > 0 && (
        <div style={{ marginTop: '6px', height: '3px', borderRadius: '2px', background: 'var(--border-light)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${rel.storyCount > 0 ? (rel.signed / rel.storyCount * 100) : 0}%`, background: 'var(--green)', borderRadius: '2px' }} />
        </div>
      )}
    </div>
  )
}

export function SprintView() {
  const [key] = useState(0)
  const { navigate } = useNavigation()
  const releases = useMemo(() => DS.getAll('pm_release'), [key])
  const items = useMemo(() => DS.getAll('pm_releaseitem'), [key])
  const stories = useMemo(() => DS.getAll('pm_userstory'), [key])
  const epics = useMemo(() => DS.getAll('pm_epic'), [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const assignments = useMemo(() => DS.getAll('pm_assignment'), [key])
  const resources = useMemo(() => DS.getAll('pm_resource'), [key])

  const getTeamForEpic = (epicId: string): Set<string> => {
    const teams = new Set<string>()
    const assigns = assignments.filter((a: any) => a.pm_epic === epicId)
    assigns.forEach((a: any) => {
      const res = resources.find((r: any) => r.id === a.pm_resource)
      if (res?.pm_team) teams.add(res.pm_team)
    })
    return teams
  }

  const getProductIdsForRelease = (relId: string): Set<string> => {
    const pids = new Set<string>()
    items.filter((i: any) => i.pm_release === relId).forEach((i: any) => {
      const story = stories.find((s: any) => s.id === i.pm_userstory)
      const epic = story ? epics.find((e: any) => e.id === story.pm_epicid) : null
      const proj = epic ? projects.find((p: any) => p.id === epic.pm_projectname) : null
      if (proj) pids.add(proj.pm_productname)
    })
    return pids
  }

  const { gridProducts, gridTeams, matrix } = useMemo(() => {
    const teamSet = new Set<string>()
    const productSet = new Set<string>()
    const grid: Record<string, Record<string, any[]>> = {}

    releases.forEach((rel: any) => {
      const ri = items.filter((i: any) => i.pm_release === rel.id)
      const pids = getProductIdsForRelease(rel.id)
      const entry = {
        ...rel, storyCount: ri.length,
        signed: ri.filter((i: any) => i.pm_signoff_status === 'Approved').length,
        pending: ri.filter((i: any) => i.pm_signoff_status === 'Pending').length,
        totalSP: ri.reduce((sum: number, i: any) => {
          const s = stories.find((st: any) => st.id === i.pm_userstory)
          return sum + (s?.pm_storypoint || 0)
        }, 0)
      }

      // Get teams for this release
      const relTeams = new Set<string>()
      ri.forEach((i: any) => {
        const story = stories.find((s: any) => s.id === i.pm_userstory)
        if (story?.pm_epicid) getTeamForEpic(story.pm_epicid).forEach(t => relTeams.add(t))
      })
      if (relTeams.size === 0) relTeams.add('__unassigned__')

      // For each product, find which teams worked on it in this release
      pids.forEach(pid => {
        // Only assign this release to teams that worked on epics linked to this product
        ri.forEach((i: any) => {
          const story = stories.find((s: any) => s.id === i.pm_userstory)
          const epic = story ? epics.find((e: any) => e.id === story.pm_epicid) : null
          const proj = epic ? projects.find((p: any) => p.id === epic.pm_projectname) : null
          if (!proj || proj.pm_productname !== pid) return
          const tSet = getTeamForEpic(epic.id)
          tSet.forEach(team => {
            if (!grid[team]) grid[team] = {}
            if (!grid[team][pid]) grid[team][pid] = []
            if (!grid[team][pid].find((e: any) => e.id === rel.id)) grid[team][pid].push(entry)
            teamSet.add(team)
          })
        })
        productSet.add(pid)
      })
    })

    // Include teams and products from data even if no sprints
    products.forEach((p: any) => productSet.add(p.id))
    resources.forEach((r: any) => { if (r.pm_team) teamSet.add(r.pm_team) })

    const prodList = [...productSet].filter(pid => pid !== '__unlinked__').sort((a, b) => {
      const pa = products.find((p: any) => p.id === a); const pb = products.find((p: any) => p.id === b)
      return (pa?.pm_name || a).localeCompare(pb?.pm_name || b)
    })
    const teamList = [...teamSet].filter(t => t !== '__unassigned__').sort()

    return { gridProducts: prodList, gridTeams: teamList, matrix: grid }
  }, [releases, items, stories, epics, projects, products, assignments, resources])

  const activeReleases = releases.filter((r: any) => ['Open', 'In Review'].includes(r.pm_status))

  const getProductName = (pid: string) => products.find((p: any) => p.id === pid)?.pm_name || pid
  const getTeamLabel = (team: string) => {
    const cfg = DS.query('pm_config', { pm_type: 'team' }).find((c: any) => c.pm_name === team)
    return cfg?.pm_name || team
  }

  if (gridProducts.length === 0) {
    return (
      <div>
        <div className="dashboard-header"><h2>📋 Sprint Board</h2></div>
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No sprints yet</p>
          <p style={{ fontSize: '0.85rem' }}>Create sprints from the 🚀 Releases tab.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="dashboard-header"><h2>📋 Sprint Board</h2></div>
      <StatsCards stats={[
        { value: releases.length, label: 'Total Sprints' },
        { value: activeReleases.length, label: 'Active' },
        { value: items.length, label: 'Stories' }
      ]} />

      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{
                padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600,
                borderBottom: '2px solid var(--border)', minWidth: '100px', position: 'sticky', left: 0,
                background: 'var(--bg)', zIndex: 1
              }}>Team \ Product</th>
              {gridProducts.map(pid => (
                <th key={pid} style={{
                  padding: '10px 14px', textAlign: 'center', fontWeight: 700,
                  borderBottom: '2px solid var(--primary)', minWidth: '200px', maxWidth: '280px',
                  color: 'var(--primary-dark)', background: 'var(--primary-bg)',
                  borderRadius: '4px 4px 0 0'
                }}>
                  📦 {getProductName(pid)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gridTeams.map(team => (
              <tr key={team} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{
                  padding: '12px 14px', fontWeight: 600, textAlign: 'left',
                  borderRight: '1px solid var(--border-light)', background: 'var(--border-light)',
                  color: 'var(--text)', whiteSpace: 'nowrap', position: 'sticky', left: 0,
                  zIndex: 0
                }}>
                  👥 {getTeamLabel(team)}
                </td>
                {gridProducts.map(pid => {
                  const sprints = matrix[team]?.[pid] || []
                  return (
                    <td key={pid} style={{
                      padding: '8px', verticalAlign: 'top', borderRight: '1px solid var(--border-light)',
                      minWidth: '200px', maxWidth: '280px'
                    }}>
                      {sprints.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 8px', color: 'var(--text-soft)', fontSize: '0.75rem' }}>—</div>
                      ) : (
                        sprints.map(rel => <SprintCard key={rel.id} rel={rel} navigate={navigate} />)
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
