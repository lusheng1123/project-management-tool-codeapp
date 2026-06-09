import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { useRole } from '../context/RoleContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function RequirementsView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [mode, setMode] = useState<'all'|'linked'|'backlog'>('all'); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI(); const { hasRole } = useRole()
  useEffect(() => { setData(DS.getAll('pm_requirement')) }, [key])
  const capabilities = useMemo(() => DS.getAll('pm_capability'), [key]); const projects = useMemo(() => DS.getAll('pm_project'), [key]); const products = useMemo(() => DS.getAll('pm_product'), [key]); const epics = useMemo(() => DS.getAll('pm_epic'), [key]); const assignments = useMemo(() => DS.getAll('pm_assignment'), [key]); const prConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'priority' }), [key]); const rsConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'requirement_status' }), [key]); const ynConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'yes_no' }), [key]); const psConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'psc_approval_status' }), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const { term } = useSearch()

  let display = data
  if (mode === 'linked') display = data.filter((r: any) => r.pm_projectname)
  if (mode === 'backlog') display = data.filter((r: any) => !r.pm_projectname)
  const filtered = term ? display.filter((r: any) => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : display

  const linked = data.filter((r: any) => r.pm_projectname)
  const backlog = data.filter((r: any) => !r.pm_projectname)

  const modalExtra = (rec: any) => (<div>
    <label>Capability</label><select id="reqCapability" data-extra defaultValue={rec?.pm_capabilityid || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select>
    <label>Status</label><select id="reqStatus" data-extra defaultValue={rec?.pm_status || ''}><option value="">None</option>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
    <label>Priority</label><select id="reqPriority" data-extra defaultValue={rec?.pm_priority || ''}><option value="">None</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
    <label>Project</label><select id="reqProject" data-extra defaultValue={rec?.pm_projectname || ''}><option value="">None (Backlog)</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select>
    <label>PSC Approval Required</label><select id="reqPSCReq" data-extra defaultValue={rec?.pm_pscapprovalrequired || ''}><option value="">None</option>{ynConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
    <label>PSC Approval Status</label><select id="reqPSC" data-extra defaultValue={rec?.pm_pscapprovalstatus || ''}><option value="">None</option>{psConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select>
  </div>)

  const collectExtras = () => ({
    pm_capabilityid: (document.getElementById('reqCapability') as HTMLSelectElement)?.value || '',
    pm_status: (document.getElementById('reqStatus') as HTMLSelectElement)?.value || '',
    pm_priority: (document.getElementById('reqPriority') as HTMLSelectElement)?.value || '',
    pm_projectname: (document.getElementById('reqProject') as HTMLSelectElement)?.value || '',
    pm_pscapprovalrequired: (document.getElementById('reqPSCReq') as HTMLSelectElement)?.value || '',
    pm_pscapprovalstatus: (document.getElementById('reqPSC') as HTMLSelectElement)?.value || ''
  })

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_requirement', id); if (!rec) return
    showModal({ title: 'Edit Requirement', fields: getFields('pm_requirement').filter(f => !['pm_capabilityid', 'pm_projectname', 'pm_status', 'pm_priority', 'pm_pscapprovalstatus', 'pm_pscapprovalrequired'].includes(f.name)), data: rec, extraContent: modalExtra(rec), onSave: (fd) => { Object.assign(fd, collectExtras()); DS.update('pm_requirement', id, fd); reload(); showToast('Updated!') }, onDelete: () => { DS.delete('pm_requirement', id); reload(); showToast('Deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>📋 Requirements</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'New Requirement', fields: getFields('pm_requirement').filter(f => !['pm_capabilityid', 'pm_projectname', 'pm_status', 'pm_priority', 'pm_pscapprovalstatus', 'pm_pscapprovalrequired'].includes(f.name)), extraContent: modalExtra(null), onSave: (fd) => { Object.assign(fd, collectExtras()); DS.create('pm_requirement', fd); reload(); showToast('Created!') } }) }}>+ New</button></div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {(['all','linked','backlog'] as const).map(m => (
          <button key={m} className={`btn-sm ${mode === m ? 'btn-primary' : ''}`} onClick={() => setMode(m)} style={{ padding: '5px 14px', fontSize: '0.8rem', background: mode === m ? undefined : 'var(--surface)', color: mode === m ? undefined : 'var(--text-muted)', border: mode === m ? undefined : '1px solid var(--border)' }}>
            {m === 'all' ? 'All' : m === 'linked' ? 'Linked' : 'Backlog'}
          </button>
        ))}
      </div>
      <StatsCards stats={[
        { value: data.length, label: 'Total' },
        { value: linked.length, label: 'Linked' },
        { value: backlog.length, label: 'Backlog' },
        { value: data.filter((r: any) => r.pm_pscapprovalstatus === 'Approved').length, label: 'PSC Approved' }
      ]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No items found" /> : (
        <table className="data-table"><thead><tr><th>Detail</th><th>Priority</th><th>Project</th><th>Product</th><th>Effort</th><th>Status</th><th>PSC</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((req: any) => {
          const proj = projects.find((p: any) => p.id === req.pm_projectname); const prod = proj ? products.find((p: any) => p.id === proj.pm_productname) : null; const reqEpics = req.pm_projectname ? epics.filter((e: any) => e.pm_projectname === req.pm_projectname) : []; const isExp = expanded.has(req.id)
          return (
          <Fragment key={req.id}>
          <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(req.id)} style={{ cursor: 'pointer' }}>
            <td>{req.pm_detail?.substring(0, 70)}{req.pm_detail?.length > 70 ? '...' : ''}</td>
            <td><span className={`badge ${badgeClass(req.pm_priority)}`} style={{ fontSize: '0.7rem' }}>{req.pm_priority || '—'}</span></td>
            <td>{proj ? <>{proj.pm_locked === 'Yes' ? '🔒 ' : ''}{proj.pm_name}</> : <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>Backlog</span>}</td>
            <td>{prod?.pm_name || '—'}</td>
            <td><span style={{ fontWeight: 600 }}>{req.pm_effort || '—'}d</span></td>
            <td><span className={`badge ${badgeClass(req.pm_status)}`}>{req.pm_status}</span></td>
            <td>{req.pm_pscapprovalrequired === 'Yes' ? <span className={`badge ${badgeClass(req.pm_pscapprovalstatus)}`}>{req.pm_pscapprovalstatus}</span> : <span className="badge badge-gray">N/A</span>}</td>
            <td className="actions-cell" onClick={e => e.stopPropagation()}>
              {!req.pm_projectname && (
                <select style={{ padding: '4px 8px', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid var(--primary)', background: 'var(--primary-bg)', color: 'var(--primary-dark)', fontWeight: 600, cursor: 'pointer', maxWidth: '130px' }} value="" onChange={e => { const pid = e.target.value; if (!pid) return; DS.update('pm_requirement', req.id, { pm_projectname: pid, pm_status: 'Linked' }); reload(); showToast('Linked to project!') }}>
                  <option value="">Link to Project ▾</option>
{projects.filter((p: any) => p.pm_locked !== 'Yes').map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}
                </select>
              )}
              {(hasRole('Admin') || hasRole('Value Stream PMO') || hasRole('Value Stream Owner')) && req.pm_projectname && <button className="btn-sm" style={{ padding: '3px 8px', fontSize: '0.7rem', fontWeight: 600, background: 'var(--blue-bg)', color: 'var(--blue)', border: '1px solid var(--blue)', borderRadius: '4px', cursor: 'pointer' }} onClick={() => { if (confirm('Move this requirement back to Backlog?')) { DS.update('pm_requirement', req.id, { pm_projectname: '', pm_status: 'Prioritized' }); reload(); showToast('Moved to Backlog!') } }}>📦 Backlog</button>}
              <button className="btn-sm btn-edit" onClick={() => { if (proj?.pm_locked === 'Yes') { showToast('🔒 Project is locked — cannot edit'); return }; openEdit(req.id) }}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete?')) { DS.delete('pm_requirement', req.id); reload(); showToast('Deleted!') } }}>🗑️</button>
            </td></tr>
          {isExp && reqEpics.length > 0 && reqEpics.map((e: any) => { const rag = e.pm_ragstatus === 'G' ? 'badge-green' : e.pm_ragstatus === 'A' ? 'badge-amber' : 'badge-red'; const epicAssigns = assignments.filter((a: any) => a.pm_epic === e.id); const devNames = epicAssigns.map((a: any) => DS.getResourceName(a.pm_resource)).join(', ') || '—'; return (<tr key={e.id} className="project-epic-row"><td colSpan={8}><div className="project-epic-item"><span className={`badge ${rag}`}>{e.pm_ragstatus || '—'}</span><span className="project-epic-name">{e.pm_title}</span><span className="project-epic-meta">Est: {e.pm_estimatedeffort || '—'}d | {e.pm_startdate || '?'} → {e.pm_releasedate || '?'}</span><span className="project-epic-devs">{devNames}</span></div></td></tr>) })}
          {isExp && reqEpics.length === 0 && !req.pm_projectname && <tr className="project-epic-row"><td colSpan={8} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Backlog item — not yet linked to a project</td></tr>}
          {isExp && reqEpics.length === 0 && req.pm_projectname && <tr className="project-epic-row"><td colSpan={8} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No epics in this project</td></tr>}
          </Fragment>
          ) })}</tbody></table>
      )}
    </div>
  )
}
