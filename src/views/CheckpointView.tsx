import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

const STATUS_OPTIONS = ['To Do', 'In Progress', 'Done', 'N/A']
const PIPELINE_PHASES = ['Onboarding', 'Development Phase 1', 'Development Phase 2', 'Review', 'Live']

export function CheckpointView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const [filterProject, setFilterProject] = useState(''); const [filterPhase, setFilterPhase] = useState(''); const reload = () => setKey(k => k + 1)
  useEffect(() => { setData(DS.getAll('pm_checkpoint')) }, [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const vsConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'value_stream' }), [key])
  const checklistConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'project_checklist' }), [key])
  const { term } = useSearch()

  const getTasksForPhase = (vsName: string, phase: string): string[] => {
    // Try VS-specific first
    const vsTasks = checklistConfigs
      .filter((c: any) => c.pm_name.startsWith(vsName + ':' + phase + ':'))
      .sort((a: any, b: any) => parseInt(a.pm_name.split(':').pop()!) - parseInt(b.pm_name.split(':').pop()!))
      .map((c: any) => c.pm_description)
    if (vsTasks.length > 0) return vsTasks
    // Fallback to default (no VS prefix)
    return checklistConfigs
      .filter((c: any) => c.pm_name.startsWith(phase + ':'))
      .sort((a: any, b: any) => parseInt(a.pm_name.split(':').pop()!) - parseInt(b.pm_name.split(':').pop()!))
      .map((c: any) => c.pm_description)
  }

  const grouped = useMemo(() => {
    const map: Record<string, { project: any; product: any; vsName: string; phases: Record<string, any[]> }> = {}
    projects.forEach((proj: any) => {
      const prod = products.find((p: any) => p.id === proj.pm_productname)
      const vs = prod?.pm_valuestream ? vsConfigs.find((c: any) => c.id === prod.pm_valuestream) : null
      const vsName = vs?.pm_name || ''
      if (!map[proj.id]) {
        map[proj.id] = { project: proj, product: prod, vsName, phases: {} }
      }
      PIPELINE_PHASES.forEach(phase => {
        const tasks = getTasksForPhase(vsName, phase)
        if (tasks.length === 0) return
        if (!map[proj.id].phases[phase]) map[proj.id].phases[phase] = []
        tasks.forEach(task => {
          const existing = data.find((ck: any) => ck.pm_projectname === proj.id && ck.pm_phase === phase && ck.pm_task === task)
          map[proj.id].phases[phase].push({
            id: existing?.id || null,
            pm_projectname: proj.id,
            pm_phase: phase,
            pm_task: task,
            pm_owner: existing?.pm_owner || '',
            pm_status: existing?.pm_status || 'To Do',
            pm_plan_start: existing?.pm_plan_start || '',
            pm_plan_end: existing?.pm_plan_end || '',
            pm_actual_start: existing?.pm_actual_start || '',
            pm_actual_end: existing?.pm_actual_end || '',
            _exists: !!existing
          })
        })
      })
    })
    return Object.values(map)
  }, [projects, products, vsConfigs, data, checklistConfigs])

  const filtered = grouped.filter(g => {
    if (filterProject && g.project.id !== filterProject) return false
    if (filterPhase && !g.phases[filterPhase]) return false
    if (!term) return true
    const allCks = Object.values(g.phases).flat() as any[]
    return g.project.pm_name.toLowerCase().includes(term.toLowerCase()) ||
           allCks.some((ck: any) => ck.pm_task?.toLowerCase().includes(term.toLowerCase()) || ck.pm_owner?.toLowerCase().includes(term.toLowerCase()))
  })

  const updateCheckpoint = (id: string, field: string, value: string) => {
    DS.update('pm_checkpoint', id, { [field]: value })
    reload()
  }

  const allItems = grouped.flatMap((g: any) => Object.values(g.phases).flat() as any[])
  const totalCks = allItems.length
  const doneCks = allItems.filter((c: any) => c.pm_status === 'Done').length
  const inProgressCks = allItems.filter((c: any) => c.pm_status === 'In Progress').length

  return (
    <div>
      <div className="dashboard-header"><h2>✅ Governance</h2></div>
      <StatsCards stats={[
        { value: totalCks, label: 'Total Items' },
        { value: doneCks, label: 'Done' },
        { value: inProgressCks, label: 'In Progress' }
      ]} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <option value="">All Projects</option>
          {projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}
        </select>
        <select value={filterPhase} onChange={e => setFilterPhase(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <option value="">All Phases</option>
          {PIPELINE_PHASES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {filterProject || filterPhase ? (
          <button className="btn-sm" onClick={() => { setFilterProject(''); setFilterPhase('') }} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>Clear Filters</button>
        ) : null}
      </div>
      <SearchBar />

      {!grouped.length ? <EmptyState msg="No checkpoints found" /> : (
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
                {g.vsName && <span style={{ fontSize: '0.7rem', fontWeight: 500, background: 'var(--primary-bg)', padding: '2px 8px', borderRadius: '10px' }}>VS: {g.vsName}</span>}
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
                          <tr key={`${ck.pm_phase}-${ck.pm_task}`} className="data-row" style={{ opacity: ck._exists ? 1 : 0.55 }}>
                            <td style={{ fontWeight: 500 }}>{ck.pm_task}</td>
                            <td>{ck.pm_owner || '—'}</td>
                            <td>
                              {ck._exists ? (
                                <select
                                  value={ck.pm_status || 'To Do'}
                                  onChange={e => updateCheckpoint(ck.id, 'pm_status', e.target.value)}
                                  style={{ padding: '3px 6px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                >
                                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : null}
                              <span className={`badge ${badgeClass(ck.pm_status)}`} style={{ fontSize: '0.65rem', marginLeft: ck._exists ? '6px' : 0 }}>
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
