import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function RequirementsView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_requirement')) }, [key])
  const capabilities = useMemo(() => DS.getAll('pm_capability'), [key]); const projects = useMemo(() => DS.getAll('pm_project'), [key]); const epics = useMemo(() => DS.getAll('pm_epic'), [key]); const assignments = useMemo(() => DS.getAll('pm_assignment'), [key]); const releases = useMemo(() => DS.getAll('pm_release'), [key]); const prConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'priority' }), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const { term } = useSearch(); const filtered = term ? data.filter((r: any) => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const modalExtra = (rec: any) => {
    const rsConfigs = DS.query('pm_config', { pm_type: 'requirement_status' })
    const ynConfigs = DS.query('pm_config', { pm_type: 'yes_no' })
    const psConfigs = DS.query('pm_config', { pm_type: 'psc_approval_status' })
    return (<div>
      <label>Capability</label><select id="reqCapability" data-extra defaultValue={rec?.pm_capabilityid || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select>
      <label>Status</label><select id="reqStatus" data-extra defaultValue={rec?.pm_status || ''}><option value="">None</option>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
      <label>Priority</label><select id="reqPriority" data-extra defaultValue={rec?.pm_priority || ''}><option value="">None</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
      <label>Assignee</label><input type="text" id="reqAssignee" data-extra defaultValue={rec?.pm_assignee || ''} placeholder="Name" />
      <label>Target Release</label><select id="reqTargetRel" data-extra defaultValue={rec?.pm_target_release || ''}><option value="">None</option>{releases.map((r: any) => <option key={r.id} value={r.id}>{r.pm_releasename}</option>)}</select>
      <label>PSC Approval Required</label><select id="reqPSCReq" data-extra defaultValue={rec?.pm_pscapprovalrequired || ''}><option value="">None</option>{ynConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
      <label>PSC Approval Status</label><select id="reqPSC" data-extra defaultValue={rec?.pm_pscapprovalstatus || ''}><option value="">None</option>{psConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
      <label>Project</label><select id="reqProject" data-extra defaultValue={rec?.pm_projectname || ''}><option value="">None</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select>
    </div>)
  }

  const collectExtras = () => ({
    pm_capabilityid: (document.getElementById('reqCapability') as HTMLSelectElement)?.value || '',
    pm_status: (document.getElementById('reqStatus') as HTMLSelectElement)?.value || '',
    pm_priority: (document.getElementById('reqPriority') as HTMLSelectElement)?.value || '',
    pm_assignee: (document.getElementById('reqAssignee') as HTMLInputElement)?.value || '',
    pm_target_release: (document.getElementById('reqTargetRel') as HTMLSelectElement)?.value || '',
    pm_pscapprovalrequired: (document.getElementById('reqPSCReq') as HTMLSelectElement)?.value || '',
    pm_pscapprovalstatus: (document.getElementById('reqPSC') as HTMLSelectElement)?.value || '',
    pm_projectname: (document.getElementById('reqProject') as HTMLSelectElement)?.value || ''
  })

  const openEditReq = (id: string) => {
    const rec = DS.getById('pm_requirement', id); if (!rec) return
    showModal({ title: 'Edit Backlog Item', fields: getFields('pm_requirement').filter(f => !['pm_capabilityid', 'pm_projectname', 'pm_status', 'pm_priority', 'pm_assignee', 'pm_target_release', 'pm_pscapprovalstatus', 'pm_pscapprovalrequired'].includes(f.name)), data: rec, extraContent: modalExtra(rec), onSave: (fd) => { Object.assign(fd, collectExtras()); DS.update('pm_requirement', id, fd); reload(); showToast('Updated!') }, onDelete: () => { DS.delete('pm_requirement', id); reload(); showToast('Deleted!') } })
  }

  const backlogItems = data.filter((r: any) => !r.pm_projectname)
  const linkedItems = data.filter((r: any) => r.pm_projectname)

  return (
    <div>
      <div className="dashboard-header"><h2>📋 Backlog</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'New Backlog Item', fields: getFields('pm_requirement').filter(f => !['pm_capabilityid', 'pm_projectname', 'pm_status', 'pm_priority', 'pm_assignee', 'pm_target_release', 'pm_pscapprovalstatus', 'pm_pscapprovalrequired'].includes(f.name)), extraContent: modalExtra(null), onSave: (fd) => { Object.assign(fd, collectExtras()); DS.create('pm_requirement', fd); reload(); showToast('Created!') } }) }}>+ New Item</button></div>
      <StatsCards stats={[
        { value: data.length, label: 'Total Items' },
        { value: backlogItems.length, label: 'Unlinked' },
        { value: linkedItems.length, label: 'Linked' },
        { value: data.filter((r: any) => r.pm_pscapprovalstatus === 'Approved').length, label: 'PSC Approved' }
      ]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No backlog items found" /> : (
        <table className="data-table"><thead><tr><th>Detail</th><th>Priority</th><th>Assignee</th><th>Target Rel</th><th>Project</th><th>Effort</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((req: any) => {
          const proj = projects.find((p: any) => p.id === req.pm_projectname); const reqEpics = req.pm_projectname ? epics.filter((e: any) => e.pm_projectname === req.pm_projectname) : []; const isExp = expanded.has(req.id); const targetRel = req.pm_target_release ? releases.find((r: any) => r.id === req.pm_target_release) : null
          return (
          <Fragment key={req.id}>
          <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(req.id)} style={{ cursor: 'pointer' }}>
            <td>{req.pm_detail?.substring(0, 70)}{req.pm_detail?.length > 70 ? '...' : ''}</td>
            <td><span className={`badge ${badgeClass(req.pm_priority)}`} style={{ fontSize: '0.7rem' }}>{req.pm_priority || '—'}</span></td>
            <td>{req.pm_assignee || '—'}</td>
            <td>{targetRel?.pm_releasename || '—'}</td>
            <td>{proj?.pm_name || <span style={{ color: 'var(--text-soft)' }}>Backlog</span>}</td>
            <td><span style={{ fontWeight: 600 }}>{req.pm_effort || '—'}d</span></td>
            <td><span className={`badge ${badgeClass(req.pm_status)}`}>{req.pm_status || 'New'}</span></td>
            <td className="actions-cell" onClick={e => e.stopPropagation()}>
              <button className="btn-sm btn-edit" onClick={() => openEditReq(req.id)}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete?')) { DS.delete('pm_requirement', req.id); reload(); showToast('Deleted!') } }}>🗑️</button>
            </td>
          </tr>
          {isExp && reqEpics.length > 0 && reqEpics.map((e: any) => {
            const rag = e.pm_ragstatus === 'G' ? 'badge-green' : e.pm_ragstatus === 'A' ? 'badge-amber' : 'badge-red'
            const epicAssigns = assignments.filter((a: any) => a.pm_epic === e.id)
            const devNames = epicAssigns.map((a: any) => DS.getResourceName(a.pm_resource)).join(', ') || '—'
            return (<tr key={e.id} className="project-epic-row"><td colSpan={8}><div className="project-epic-item"><span className={`badge ${rag}`}>{e.pm_ragstatus || '—'}</span><span className="project-epic-name">{e.pm_title}</span><span className="project-epic-meta">Est: {e.pm_estimatedeffort || '—'}d | {e.pm_startdate || '?'} → {e.pm_releasedate || '?'}</span><span className="project-epic-devs">{devNames}</span></div></td></tr>)
          })}
          {isExp && reqEpics.length === 0 && <tr className="project-epic-row"><td colSpan={8} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No epics linked — backlog item</td></tr>}
          </Fragment>
          ) })}</tbody></table>
      )}
    </div>
  )
}
