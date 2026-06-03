import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function EpicsView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_epic')) }, [key]); const stories = useMemo(() => DS.getAll('pm_userstory'), [key]); const assignments = useMemo(() => DS.getAll('pm_assignment'), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const openNewEpic = () => { const projs = DS.getAll('pm_project'); const ragConfigs = DS.query('pm_config', { pm_type: 'rag_status' }); showModal({ title: 'New Epic', fields: getFields('pm_epic').filter(f => f.name !== 'pm_projectname' && f.name !== 'pm_ragstatus'), extraContent: (<div><label>Project</label><select id="epicProject" data-extra><option value="">None</option>{projs.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>RAG Status</label><select id="epicRAG" data-extra><option value="">None</option>{ragConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_projectname = (document.getElementById('epicProject') as HTMLSelectElement).value; fd.pm_ragstatus = (document.getElementById('epicRAG') as HTMLSelectElement)?.value || ''; DS.create('pm_epic', fd); reload(); showToast('Epic created!') } }) }
  const openEditEpic = (id: string) => { const rec = DS.getById('pm_epic', id); const projs = DS.getAll('pm_project'); const ragConfigs = DS.query('pm_config', { pm_type: 'rag_status' }); showModal({ title: 'Edit Epic', fields: getFields('pm_epic').filter(f => f.name !== 'pm_projectname' && f.name !== 'pm_ragstatus'), data: rec, extraContent: (<div><label>Project</label><select id="epicProject" data-extra defaultValue={rec.pm_projectname || ''}><option value="">None</option>{projs.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>RAG Status</label><select id="epicRAG" data-extra defaultValue={rec.pm_ragstatus || ''}><option value="">None</option>{ragConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_projectname = (document.getElementById('epicProject') as HTMLSelectElement).value; fd.pm_ragstatus = (document.getElementById('epicRAG') as HTMLSelectElement)?.value || ''; DS.update('pm_epic', id, fd); reload(); showToast('Epic updated!') }, onDelete: () => { DS.delete('pm_epic', id); reload(); showToast('Epic deleted!') } }) }
  const showAssignModal = (eid: string) => { const epic = DS.getById('pm_epic', eid); if (!epic) return; const resources = DS.getAll('pm_resource').filter((r: any) => r.pm_department === 'IT'); const existing = DS.query('pm_assignment', { pm_epic: eid }); const assignedIds = existing.map((a: any) => a.pm_resource); showModal({ title: `👤 Assign: ${epic.pm_title}`, fields: [], extraContent: (<div><input type="text" id="assignSearchInput" placeholder="🔍 Search developers..." className="search-input" style={{ marginBottom: 12 }} autoFocus onInput={(e) => { const term = (e.target as HTMLInputElement).value.toLowerCase(); document.querySelectorAll('#assignCheckboxes .checkbox-label').forEach((el: any) => { const text = el.textContent.toLowerCase(); el.style.display = !term || text.includes(term) ? '' : 'none' }) }} /><div className="checkbox-group" id="assignCheckboxes" style={{ maxHeight: 300 }}>{resources.map((r: any) => (<label key={r.id} className="checkbox-label"><input type="checkbox" name={`asgn_${r.id}`} defaultChecked={assignedIds.includes(r.id)} data-extra /> <strong>{r.pm_name}</strong> — {r.pm_role} ({r.pm_team || '—'})</label>))}</div></div>), onSave: () => { const checks = Array.from(document.querySelectorAll<HTMLInputElement>('#assignCheckboxes input:checked')).map(cb => cb.name.replace('asgn_', '')); existing.forEach((a: any) => DS.delete('pm_assignment', a.id)); checks.forEach(rid => { DS.create('pm_assignment', { pm_resource: rid, pm_epic: eid, pm_allocationpct: 50, pm_startdate: new Date().toISOString().slice(0, 10) }) }); reload(); showToast('Assignments updated!') } }) }
  const { term } = useSearch(); const filtered = term ? data.filter((e: any) => Object.values(e).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data
  return (
    <div>
      <div className="dashboard-header"><h2>⚡ Epic Dashboard</h2><button className="btn btn-primary" onClick={openNewEpic}>+ New Epic</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Epics' },{ value: data.filter((e: any) => e.pm_ragstatus === 'G').length, label: 'Green' },{ value: data.filter((e: any) => e.pm_ragstatus === 'A').length, label: 'Amber' },{ value: data.filter((e: any) => e.pm_ragstatus === 'R').length, label: 'Red' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No epics found" /> : (
        <table className="data-table"><thead><tr><th>Epic</th><th>Project</th><th>RAG</th><th>Related</th><th>Actual / Est</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((epic: any) => {
          const rag = epic.pm_ragstatus === 'G' ? 'badge-green' : epic.pm_ragstatus === 'A' ? 'badge-amber' : 'badge-red'
          const es = stories.filter((s: any) => s.pm_epicid === epic.id); const asgns = assignments.filter((a: any) => a.pm_epic === epic.id); const actual = es.reduce((sum: number, s: any) => sum + (Number(s.pm_storypoint) || 0), 0); const isExp = expanded.has(epic.id)
          const effortDisplay = epic.pm_estimatedeffort ? `${actual}d / ${epic.pm_estimatedeffort}d` : `${actual}d`
          const effortColor = actual > (Number(epic.pm_estimatedeffort) || 0) && epic.pm_estimatedeffort ? 'var(--red)' : 'var(--green)'
          return (<Fragment key={epic.id}>
            <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(epic.id)} style={{ cursor: 'pointer' }}><td><strong>{epic.pm_title}</strong><br /><small>{epic.pm_detail?.substring(0, 60)}</small></td><td>{DS.getLookupName('pm_project', epic.pm_projectname)}</td><td><span className={`badge ${rag}`}>{epic.pm_ragstatus || '—'}</span></td><td>{es.length} stories, {asgns.length} devs</td><td><span style={{ fontWeight: 700, color: effortColor, fontSize: '0.82rem' }}>{effortDisplay}</span></td><td className="actions-cell" onClick={e => e.stopPropagation()}><button className="btn-sm btn-edit" onClick={() => openEditEpic(epic.id)}>✏️ Edit</button><button className="btn-sm btn-link" onClick={() => showAssignModal(epic.id)}>👤 Assign</button><button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this epic?')) { DS.delete('pm_epic', epic.id); reload(); showToast('Epic deleted!') } }}>🗑️</button></td></tr>
            {isExp && es.map((s: any) => (<tr key={s.id} className="project-epic-row"><td colSpan={6}><div className="project-epic-item"><span className="project-epic-name">{s.pm_detail}</span><span className="project-epic-meta">{s.pm_storypoint ? `${s.pm_storypoint}pt` : '—'} | Acceptance: {s.pm_acceptancecriteria || 'N/A'}</span></div></td></tr>))}
            {isExp && es.length === 0 && <tr className="project-epic-row"><td colSpan={6} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No user stories linked</td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}

