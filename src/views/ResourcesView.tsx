import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function ResourcesView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_resource')) }, [key])
  const assignments = useMemo(() => DS.getAll('pm_assignment'), [key]); const epics = useMemo(() => DS.getAll('pm_epic'), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const { term } = useSearch()
  const filtered = term ? data.filter((r: any) => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data
  const active = data.filter((r: any) => r.pm_status === 'Active').length; const itCount = data.filter((r: any) => r.pm_department === 'IT').length
  return (
    <div>
      <div className="dashboard-header"><h2>👥 Resource Management</h2><button className="btn btn-primary" onClick={() => { const deptConfigs = DS.query('pm_config', { pm_type: 'department' }); const teamConfigs = DS.query('pm_config', { pm_type: 'team' }); showModal({ title: 'New Resource', fields: getFields('pm_resource').filter(f => f.name !== 'pm_department' && f.name !== 'pm_team'), extraContent: (<div><label>Department</label><select id="resDept" data-extra><option value="">None</option>{deptConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Team</label><select id="resTeam" data-extra><option value="">None</option>{teamConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_department = (document.getElementById('resDept') as HTMLSelectElement)?.value || ''; fd.pm_team = (document.getElementById('resTeam') as HTMLSelectElement)?.value || ''; DS.create('pm_resource', fd); reload(); showToast('Resource created!') } }) }}>+ New Resource</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Total Resources' },{ value: active, label: 'Active' },{ value: itCount, label: 'IT' },{ value: data.length - itCount, label: 'Business' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No resources found" /> : (
        <table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Team</th><th>Status</th><th>Cost</th><th>Capacity</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((r: any) => {
          const asgns = assignments.filter((a: any) => a.pm_resource === r.id); const totalAlloc = asgns.reduce((s: number, a: any) => s + (Number(a.pm_allocationpct) || 0), 0); const isExp = expanded.has(r.id)
          const capColor = totalAlloc > 100 ? 'var(--red)' : totalAlloc > 80 ? 'var(--amber)' : 'var(--green)'
          return (<Fragment key={r.id}>
            <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(r.id)} style={{ cursor: 'pointer' }}><td><strong>{r.pm_name}</strong></td><td>{r.pm_role}</td><td><span className={`badge ${badgeClass(r.pm_department)}`}>{r.pm_department}</span></td><td><span className={`badge ${badgeClass(r.pm_team)}`}>{r.pm_team || '—'}</span></td><td><span className={`badge ${badgeClass(r.pm_status)}`}>{r.pm_status}</span></td><td>{r.pm_cost ? '$'+(Number(r.pm_cost)).toLocaleString() : '—'}</td><td><span style={{ fontWeight: 700, color: capColor }}>{totalAlloc}%</span></td><td className="actions-cell" onClick={e => e.stopPropagation()}><button className="btn-sm btn-edit" onClick={() => { const rec = DS.getById('pm_resource', r.id); const deptConfigs = DS.query('pm_config', { pm_type: 'department' }); const teamConfigs = DS.query('pm_config', { pm_type: 'team' }); showModal({ title: 'Edit Resource', fields: getFields('pm_resource').filter(f => f.name !== 'pm_department' && f.name !== 'pm_team'), data: rec, extraContent: (<div><label>Department</label><select id="resDept" data-extra defaultValue={rec.pm_department || ''}><option value="">None</option>{deptConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Team</label><select id="resTeam" data-extra defaultValue={rec.pm_team || ''}><option value="">None</option>{teamConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_department = (document.getElementById('resDept') as HTMLSelectElement)?.value || ''; fd.pm_team = (document.getElementById('resTeam') as HTMLSelectElement)?.value || ''; DS.update('pm_resource', r.id, fd); reload(); showToast('Resource updated!') }, onDelete: () => { DS.delete('pm_resource', r.id); reload(); showToast('Resource deleted!') } }) }}>✏️ Edit</button><button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this resource?')) { DS.delete('pm_resource', r.id); reload(); showToast('Resource deleted!') } }}>🗑️</button></td></tr>
            {isExp && asgns.map((a: any) => { const epic = epics.find((e: any) => e.id === a.pm_epic); return (<tr key={a.id} className="project-epic-row"><td colSpan={8}><div className="project-epic-item"><span className="project-epic-name">{epic?.pm_title || '—'}</span><span className="project-epic-meta">Allocation: {a.pm_allocationpct || 0}% | {a.pm_startdate || '?'} → {a.pm_enddate || 'Ongoing'}</span></div></td></tr>) })}
            {isExp && asgns.length === 0 && <tr className="project-epic-row"><td colSpan={8} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No assignments</td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}

