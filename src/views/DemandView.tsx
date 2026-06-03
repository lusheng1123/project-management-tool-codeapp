import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function DemandView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_demand')) }, [key])
  const capabilities = useMemo(() => DS.getAll('pm_capability'), [key]); const products = useMemo(() => DS.getAll('pm_product'), [key]); const requirements = useMemo(() => DS.getAll('pm_requirement'), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const { term } = useSearch()
  const filtered = term ? data.filter((d: any) => Object.values(d).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const changeStatus = (id: string, newStatus: string) => { DS.update('pm_demand', id, { pm_status: newStatus }); reload(); showToast(`Demand ${newStatus}!`) }
  const startTriage = (id: string) => changeStatus(id, 'Triaging')
  const assess = (id: string) => changeStatus(id, 'Assessed')
  const approve = (id: string) => changeStatus(id, 'Approved')
  const reject = (id: string) => changeStatus(id, 'Rejected')

  const openConvert = (demId: string) => {
    const dem = DS.getById('pm_demand', demId); if (!dem) return
    const rsConfigs = DS.query('pm_config', { pm_type: 'requirement_status' })
    const ynConfigs = DS.query('pm_config', { pm_type: 'yes_no' })
    const psConfigs = DS.query('pm_config', { pm_type: 'psc_approval_status' })
    const projects = DS.getAll('pm_project')
    showModal({ title: 'Convert to Requirement', fields: [{ name: 'pm_detail', label: 'Requirement Detail', type: 'multiline', required: true }], data: { pm_detail: dem.pm_detail }, extraContent: (<div><label>Capability</label><select id="convCap" data-extra defaultValue={dem.pm_capability || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Project</label><select id="convProj" data-extra><option value="">None</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>Status</label><select id="convStatus" data-extra><option value="New">New</option>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>PSC Approval Required</label><select id="convPSCReq" data-extra><option value="">None</option>{ynConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>PSC Approval Status</label><select id="convPSCStatus" data-extra><option value="">None</option>{psConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { const req = DS.create('pm_requirement', { pm_detail: fd.pm_detail, pm_capabilityid: (document.getElementById('convCap') as HTMLSelectElement)?.value || dem.pm_capability || '', pm_projectname: (document.getElementById('convProj') as HTMLSelectElement)?.value || '', pm_status: (document.getElementById('convStatus') as HTMLSelectElement)?.value || 'New', pm_pscapprovalrequired: (document.getElementById('convPSCReq') as HTMLSelectElement)?.value || '', pm_pscapprovalstatus: (document.getElementById('convPSCStatus') as HTMLSelectElement)?.value || '', pm_effort: dem.pm_effort_estimate || 0 }); DS.update('pm_demand', demId, { pm_status: 'Converted', pm_converted_to: req.id, pm_converted_date: new Date().toISOString().slice(0, 10) }); reload(); showToast('Demand converted to requirement!') } })
  }

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_demand', id); if (!rec) return
    const dtConfigs = DS.query('pm_config', { pm_type: 'demand_type' }); const prConfigs = DS.query('pm_config', { pm_type: 'priority' }); const dsConfigs = DS.query('pm_config', { pm_type: 'demand_status' })
    showModal({ title: 'Edit Demand', fields: getFields('pm_demand').filter(f => !['pm_type', 'pm_priority', 'pm_status', 'pm_capability', 'pm_product', 'pm_converted_to', 'pm_converted_date'].includes(f.name)), data: rec, extraContent: (<div><label>Type</label><select id="demType" data-extra defaultValue={rec.pm_type || ''}><option value="">None</option>{dtConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Priority</label><select id="demPriority" data-extra defaultValue={rec.pm_priority || ''}><option value="">None</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Status</label><select id="demStatus" data-extra defaultValue={rec.pm_status || ''}><option value="">None</option>{dsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Capability</label><select id="demCap" data-extra defaultValue={rec.pm_capability || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Product</label><select id="demProd" data-extra defaultValue={rec.pm_product || ''}><option value="">None</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_type = (document.getElementById('demType') as HTMLSelectElement)?.value || ''; fd.pm_priority = (document.getElementById('demPriority') as HTMLSelectElement)?.value || ''; fd.pm_status = (document.getElementById('demStatus') as HTMLSelectElement)?.value || ''; fd.pm_capability = (document.getElementById('demCap') as HTMLSelectElement)?.value || ''; fd.pm_product = (document.getElementById('demProd') as HTMLSelectElement)?.value || ''; DS.update('pm_demand', id, fd); reload(); showToast('Demand updated!') }, onDelete: () => { DS.delete('pm_demand', id); reload(); showToast('Demand deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>📥 Demand Intake</h2><button className="btn btn-primary" onClick={() => { const dtConfigs = DS.query('pm_config', { pm_type: 'demand_type' }); const prConfigs = DS.query('pm_config', { pm_type: 'priority' }); showModal({ title: 'Raise New Demand', fields: getFields('pm_demand').filter(f => !['pm_type', 'pm_priority', 'pm_status', 'pm_capability', 'pm_product', 'pm_submitted_date', 'pm_converted_to', 'pm_converted_date'].includes(f.name)), extraContent: (<div><label>Type</label><select id="demType" data-extra><option value="">Select Type...</option>{dtConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Priority</label><select id="demPriority" data-extra><option value="">Select Priority...</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Capability</label><select id="demCap" data-extra><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Product</label><select id="demProd" data-extra><option value="">None</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_type = (document.getElementById('demType') as HTMLSelectElement)?.value || ''; fd.pm_priority = (document.getElementById('demPriority') as HTMLSelectElement)?.value || ''; fd.pm_capability = (document.getElementById('demCap') as HTMLSelectElement)?.value || ''; fd.pm_product = (document.getElementById('demProd') as HTMLSelectElement)?.value || ''; fd.pm_status = 'Submitted'; fd.pm_submitted_date = new Date().toISOString().slice(0, 10); DS.create('pm_demand', fd); reload(); showToast('Demand submitted!') } }) }}>+ Raise Demand</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Total' },{ value: data.filter((d: any) => d.pm_status === 'Submitted').length, label: 'Submitted' },{ value: data.filter((d: any) => d.pm_status === 'Triaging').length, label: 'Triaging' },{ value: data.filter((d: any) => d.pm_status === 'Assessed').length, label: 'Assessed' },{ value: data.filter((d: any) => d.pm_status === 'Approved').length, label: 'Approved' },{ value: data.filter((d: any) => d.pm_status === 'Converted').length, label: 'Converted' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No demands found" /> : (
        <table className="data-table"><thead><tr><th>Title</th><th>Type</th><th>Priority</th><th>Status</th><th>Product</th><th>Capability</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((dem: any) => {
          const cap = capabilities.find((c: any) => c.id === dem.pm_capability); const prod = products.find((p: any) => p.id === dem.pm_product); const convertedReq = dem.pm_converted_to ? requirements.find((r: any) => r.id === dem.pm_converted_to) : null; const isExp = expanded.has(dem.id)
          return (<Fragment key={dem.id}>
            <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(dem.id)} style={{ cursor: 'pointer' }}><td><strong>{dem.pm_title}</strong></td><td><span className="badge badge-gray">{dem.pm_type || '—'}</span></td><td><span className={`badge ${badgeClass(dem.pm_priority)}`}>{dem.pm_priority || '—'}</span></td><td><span className={`badge ${badgeClass(dem.pm_status)}`}>{dem.pm_status}</span></td><td>{prod?.pm_name || '—'}</td><td>{cap?.pm_name || '—'}</td><td className="actions-cell" onClick={e => e.stopPropagation()}>
              {dem.pm_status === 'Submitted' && <button className="btn-sm btn-link" onClick={() => startTriage(dem.id)}>🔍 Start Triage</button>}
              {dem.pm_status === 'Triaging' && <><button className="btn-sm btn-link" onClick={() => assess(dem.id)}>📋 Assess</button><button className="btn-sm btn-delete" onClick={() => reject(dem.id)}>❌ Reject</button></>}
              {dem.pm_status === 'Assessed' && <><button className="btn-sm btn-edit" onClick={() => approve(dem.id)}>✅ Approve</button><button className="btn-sm btn-delete" onClick={() => reject(dem.id)}>❌ Reject</button></>}
              {dem.pm_status === 'Approved' && <button className="btn-sm btn-edit" onClick={() => openConvert(dem.id)}>🔄 Convert</button>}
              <button className="btn-sm btn-edit" onClick={() => openEdit(dem.id)}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this demand?')) { DS.delete('pm_demand', dem.id); reload(); showToast('Demand deleted!') } }}>🗑️</button>
            </td></tr>
            {isExp && <tr className="project-epic-row"><td colSpan={7}><div className="project-epic-item"><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}><span className="project-epic-meta">By: {dem.pm_submitted_by || '—'} on {dem.pm_submitted_date || '—'}</span><span className="project-epic-meta">Effort: {dem.pm_effort_estimate ? `${dem.pm_effort_estimate}d` : 'Not estimated'}</span></div>{dem.pm_detail && <div style={{ marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dem.pm_detail}</div>}{dem.pm_assessment_notes && <div style={{ marginBottom: '6px', color: 'var(--text)', fontSize: '0.85rem' }}><strong>Assessment:</strong> {dem.pm_assessment_notes}</div>}{convertedReq && <div style={{ color: 'var(--green)', fontSize: '0.85rem' }}>🔄 Converted to: <strong>{convertedReq.pm_detail?.substring(0, 80)}</strong> on {dem.pm_converted_date}</div>}</div></td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}
