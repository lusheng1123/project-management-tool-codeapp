import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'N/A']

export function CheckpointView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1)
  useEffect(() => { setData(DS.getAll('pm_checkpoint')) }, [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const { term } = useSearch()

  const grouped = useMemo(() => {
    const map: Record<string, { project: any; product: any; phases: Record<string, any[]> }> = {}
    data.forEach((ck: any) => {
      const proj = projects.find((p: any) => p.id === ck.pm_projectname)
      if (!proj) return
      if (!map[proj.id]) {
        map[proj.id] = { project: proj, product: products.find((p: any) => p.id === proj.pm_productname), phases: {} }
      }
      if (!map[proj.id].phases[ck.pm_phase]) map[proj.id].phases[ck.pm_phase] = []
      map[proj.id].phases[ck.pm_phase].push(ck)
    })
    return Object.values(map)
  }, [data, projects, products])

  const filtered = term ? grouped.filter(g => {
    const allCks = Object.values(g.phases).flat() as any[]
    return g.project.pm_name.toLowerCase().includes(term.toLowerCase()) ||
           allCks.some((ck: any) => ck.pm_task?.toLowerCase().includes(term.toLowerCase()) || ck.pm_owner?.toLowerCase().includes(term.toLowerCase()))
  }) : grouped

  const updateCheckpoint = (id: string, field: string, value: string) => {
    DS.update('pm_checkpoint', id, { [field]: value })
    reload()
  }

  const totalCks = data.length
  const doneCks = data.filter((c: any) => c.pm_status === 'Done').length
  const inProgressCks = data.filter((c: any) => c.pm_status === 'In Progress').length

  return (
    <div>
      <div className="dashboard-header"><h2>✅ Governance Checklist</h2></div>
      <StatsCards stats={[
        { value: totalCks, label: 'Total Items' },
        { value: doneCks, label: 'Done' },
        { value: inProgressCks, label: 'In Progress' }
      ]} />
      <SearchBar />

      {!filtered.length ? <EmptyState msg="No checkpoints found" /> : (
        <div>
          {filtered.map((g: any) => (
            <div key={g.project.id} style={{ marginBottom: '28px' }}>
              <h3 style={{
                fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px',
                paddingBottom: '8px', borderBottom: '2px solid var(--primary)',
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
              }}>
                📁 {g.project.pm_name}
                {g.product && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>📦 {g.product.pm_name}</span>}
                <span className={`badge ${badgeClass(g.project.pm_status)}`} style={{ fontSize: '0.7rem' }}>{g.project.pm_status}</span>
              </h3>

              {Object.entries(g.phases).map(([phase, items]: [string, any]) => {
                const phaseDone = items.filter((ck: any) => ck.pm_status === 'Done').length
                return (
                  <div key={phase} style={{ marginBottom: '16px' }}>
                    <h4 style={{
                      fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px',
                      color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {phase}
                      <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                        {phaseDone}/{items.length} done
                      </span>
                    </h4>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Owner</th>
                          <th>Status</th>
                          <th>Plan Start</th>
                          <th>Plan End</th>
                          <th>Actual Start</th>
                          <th>Actual End</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((ck: any) => (
                          <tr key={ck.id} className="data-row">
                            <td style={{ fontWeight: 500 }}>{ck.pm_task}</td>
                            <td>{ck.pm_owner || '—'}</td>
                            <td>
                              <select
                                value={ck.pm_status || 'To Do'}
                                onChange={e => updateCheckpoint(ck.id, 'pm_status', e.target.value)}
                                style={{ padding: '3px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                              >
                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <span className={`badge ${badgeClass(ck.pm_status)}`} style={{ fontSize: '0.65rem', marginLeft: '6px' }}>
                                {ck.pm_status || 'To Do'}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>{ck.pm_plan_start || '—'}</td>
                            <td style={{ fontSize: '0.8rem' }}>{ck.pm_plan_end || '—'}</td>
                            <td style={{ fontSize: '0.8rem' }}>{ck.pm_actual_start || '—'}</td>
                            <td style={{ fontSize: '0.8rem' }}>{ck.pm_actual_end || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
