import { useState, useEffect, useMemo, useCallback, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useNavigation } from '../context/NavigationContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function DemandView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [openDropdown, setOpenDropdown] = useState<string | null>(null); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  const { focusId, clearFocus } = useNavigation()
  useEffect(() => { setData(DS.getAll('pm_demand')) }, [key])
  const capabilities = useMemo(() => DS.getAll('pm_capability'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const requirements = useMemo(() => DS.getAll('pm_requirement'), [key])
  const vsConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'value_stream' }), [key])
  const flowConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'demand_flow' }), [key])
  const dtConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'demand_type' }), [key])
  const prConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'priority' }), [key])

  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const { term } = useSearch()
  const activeData = data.filter((d: any) => !(d.pm_status === 'Approved' && d.pm_converted_to) && !['Backlogged', 'Rejected'].includes(d.pm_status) && d.pm_status !== 'Converted')
  const filtered = term ? activeData.filter((d: any) => Object.values(d).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : activeData

  const getVSName = (vsId: string) => vsConfigs.find((c: any) => c.id === vsId)?.pm_name || ''

  const getFlowStatuses = (vsId: string): string[] => {
    const vsName = getVSName(vsId)
    if (!vsName) return ['Submitted', 'Triaging', 'Assessed']
    return flowConfigs
      .filter((c: any) => c.pm_name.startsWith(vsName + ':'))
      .sort((a: any, b: any) => parseInt(a.pm_name.split(':').pop()) - parseInt(b.pm_name.split(':').pop()))
      .map((c: any) => c.pm_description)
  }

  const getAvailableStatuses = (demand: any): string[] => {
    const flow = getFlowStatuses(demand.pm_valuestream)
    const idx = flow.indexOf(demand.pm_status)
    if (idx < 0) return []
    return flow.slice(idx + 1)
  }

  const handleStatusAction = useCallback((demId: string, status: string) => {
    setOpenDropdown(null)
    if (status === 'Approved') { changeStatus(demId, 'Approved'); openConvert(demId) }
    else if (status === 'Backlog') saveToBacklog(demId)
    else if (status === 'Rejected') changeStatus(demId, 'Rejected')
    else changeStatus(demId, status)
    reload()
  }, [])

  useEffect(() => {
    if (!openDropdown) return
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(`status-popup-${openDropdown}`)
      const btn = document.getElementById(`status-btn-${openDropdown}`)
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openDropdown])

  useEffect(() => {
    if (!focusId) return
    setExpanded(prev => new Set([...prev, focusId]))
    setTimeout(() => {
      const el = document.getElementById(`row-${focusId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.classList.add('row-focus-flash')
      setTimeout(() => el?.classList.remove('row-focus-flash'), 2000)
      clearFocus()
    }, 120)
  }, [focusId])

  const changeStatus = (id: string, newStatus: string) => { DS.update('pm_demand', id, { pm_status: newStatus }); reload(); showToast(`Demand ${newStatus}!`) }

  const saveToBacklog = (demId: string) => {
    const dem = DS.getById('pm_demand', demId); if (!dem) return
    DS.create('pm_requirement', {
      pm_detail: dem.pm_detail, pm_priority: dem.pm_priority, pm_capabilityid: dem.pm_capability,
      pm_status: 'Prioritized', pm_effort: 0
    })
    DS.update('pm_demand', demId, { pm_status: 'Backlogged' })
    showToast('Demand saved to backlog!')
  }

  const reopenDemand = (demId: string) => {
    const dem = DS.getById('pm_demand', demId); if (!dem) return
    const flow = getFlowStatuses(dem.pm_valuestream)
    const firstStatus = flow[0] || 'Submitted'
    DS.update('pm_demand', demId, { pm_status: firstStatus })
    reload(); showToast('Demand reopened!')
  }

  const openConvert = (demId: string) => {
    const dem = DS.getById('pm_demand', demId); if (!dem) return
    const rsConfigs = DS.query('pm_config', { pm_type: 'requirement_status' })
    const ynConfigs = DS.query('pm_config', { pm_type: 'yes_no' })
    const psConfigs = DS.query('pm_config', { pm_type: 'psc_approval_status' })
    const prConfigs = DS.query('pm_config', { pm_type: 'priority' })
    const projects = DS.getAll('pm_project')
    showModal({ title: 'Convert Demand', fields: [{ name: 'pm_detail', label: 'Requirement Detail', type: 'multiline', required: true }], data: { pm_detail: dem.pm_detail }, extraContent: (<div><label>Target</label><select id="convTarget" data-extra><option value="requirement">Requirement (linked to project)</option><option value="backlog">Backlog (unlinked)</option></select><label>Priority</label><select id="convPriority" data-extra><option value="">None</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Capability</label><select id="convCap" data-extra defaultValue={dem.pm_capability || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Project</label><select id="convProj" data-extra><option value="">None</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>Status</label><select id="convStatus" data-extra><option value="New">New</option>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>PSC Approval Required</label><select id="convPSCReq" data-extra><option value="">None</option>{ynConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>PSC Approval Status</label><select id="convPSCStatus" data-extra><option value="">None</option>{psConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { const target = (document.getElementById('convTarget') as HTMLSelectElement)?.value; const proj = (document.getElementById('convProj') as HTMLSelectElement)?.value || ''; const req = DS.create('pm_requirement', { pm_detail: fd.pm_detail, pm_priority: (document.getElementById('convPriority') as HTMLSelectElement)?.value || '', pm_capabilityid: (document.getElementById('convCap') as HTMLSelectElement)?.value || dem.pm_capability || '', pm_projectname: target === 'requirement' ? proj : '', pm_status: target === 'requirement' ? ((document.getElementById('convStatus') as HTMLSelectElement)?.value || 'New') : 'Prioritized', pm_pscapprovalrequired: (document.getElementById('convPSCReq') as HTMLSelectElement)?.value || '', pm_pscapprovalstatus: (document.getElementById('convPSCStatus') as HTMLSelectElement)?.value || '', pm_effort: 0 }); DS.update('pm_demand', demId, { pm_status: 'Approved', pm_converted_to: req.id, pm_converted_date: new Date().toISOString().slice(0, 10) }); reload(); showToast(target === 'backlog' ? 'Demand saved to backlog!' : 'Demand converted to requirement!') } })
  }

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_demand', id); if (!rec) return
    const flowStatuses = getFlowStatuses(rec.pm_valuestream)
    const statusOptions = flowStatuses.length > 0 ? flowStatuses : ['Submitted','Triaging','Assessed']
    showModal({ title: 'Edit Demand', fields: getFields('pm_demand').filter(f => !['pm_type', 'pm_priority', 'pm_status', 'pm_valuestream', 'pm_capability', 'pm_product', 'pm_converted_to', 'pm_converted_date'].includes(f.name)), data: rec, wide: true, extraContent: (<div><label>Type</label><select id="demType" data-extra defaultValue={rec.pm_type || ''}><option value="">None</option>{dtConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Priority</label><select id="demPriority" data-extra defaultValue={rec.pm_priority || ''}><option value="">None</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Status</label><select id="demStatus" data-extra defaultValue={rec.pm_status || ''}><option value="">None</option>{statusOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}</select><label>Value Stream</label><select id="demVS" data-extra defaultValue={rec.pm_valuestream || ''}><option value="">None</option>{vsConfigs.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Capability</label><select id="demCap" data-extra defaultValue={rec.pm_capability || ''}><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Product</label><select id="demProd" data-extra defaultValue={rec.pm_product || ''}><option value="">None</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onAfterOpen: () => { const vsSel = document.getElementById('demVS') as HTMLSelectElement; vsSel?.addEventListener('change', () => { const newFlow = getFlowStatuses(vsSel.value); const newOpts = newFlow.length > 0 ? newFlow : ['Submitted','Triaging','Assessed']; const statusSel = document.getElementById('demStatus') as HTMLSelectElement; if (!statusSel) return; const curVal = statusSel.value; statusSel.innerHTML = '<option value="">None</option>' + newOpts.map(s => `<option value="${s}" ${s === curVal ? 'selected' : ''}>${s}</option>`).join('') }) }, onSave: (fd) => { fd.pm_type = (document.getElementById('demType') as HTMLSelectElement)?.value || ''; fd.pm_priority = (document.getElementById('demPriority') as HTMLSelectElement)?.value || ''; fd.pm_status = (document.getElementById('demStatus') as HTMLSelectElement)?.value || ''; fd.pm_valuestream = (document.getElementById('demVS') as HTMLSelectElement)?.value || ''; fd.pm_capability = (document.getElementById('demCap') as HTMLSelectElement)?.value || ''; fd.pm_product = (document.getElementById('demProd') as HTMLSelectElement)?.value || ''; DS.update('pm_demand', id, fd); reload(); showToast('Demand updated!') }, onDelete: () => { DS.delete('pm_demand', id); reload(); showToast('Demand deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>📥 Demand Intake</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'Raise New Demand', fields: getFields('pm_demand').filter(f => !['pm_type', 'pm_priority', 'pm_status', 'pm_valuestream', 'pm_capability', 'pm_product', 'pm_submitted_date', 'pm_converted_to', 'pm_converted_date'].includes(f.name)), extraContent: (<div><label>Type</label><select id="demType" data-extra><option value="">Select Type...</option>{dtConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Priority</label><select id="demPriority" data-extra><option value="">Select Priority...</option>{prConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select><label>Value Stream</label><select id="demVS" data-extra><option value="">None</option>{vsConfigs.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Capability</label><select id="demCap" data-extra><option value="">None</option>{capabilities.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select><label>Product *</label><select id="demProd" data-extra><option value="">Select Product...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_type = (document.getElementById('demType') as HTMLSelectElement)?.value || ''; fd.pm_priority = (document.getElementById('demPriority') as HTMLSelectElement)?.value || ''; fd.pm_valuestream = (document.getElementById('demVS') as HTMLSelectElement)?.value || ''; fd.pm_capability = (document.getElementById('demCap') as HTMLSelectElement)?.value || ''; fd.pm_product = (document.getElementById('demProd') as HTMLSelectElement)?.value || ''; const flow = getFlowStatuses(fd.pm_valuestream); fd.pm_status = flow[0] || 'Submitted'; fd.pm_submitted_date = new Date().toISOString().slice(0, 10); DS.create('pm_demand', fd); reload(); showToast('Demand submitted!') } }) }}>+ Raise Demand</button></div>
      <StatsCards stats={[{ value: activeData.length, label: 'Active' },{ value: activeData.filter((d: any) => d.pm_status === 'Submitted').length, label: 'Submitted' },{ value: activeData.filter((d: any) => d.pm_status === 'Triaging').length, label: 'Triaging' },{ value: activeData.filter((d: any) => d.pm_status === 'Assessed').length, label: 'Assessed' },{ value: activeData.filter((d: any) => d.pm_status === 'Approved' && !d.pm_converted_to).length, label: 'Pending Conv' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No demands found" /> : (
        <table className="data-table"><thead><tr><th>Title</th><th>Type</th><th>Priority</th><th>Status</th><th>Product</th><th>Value Stream</th><th>Capability</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((dem: any) => {
          const cap = capabilities.find((c: any) => c.id === dem.pm_capability); const prod = products.find((p: any) => p.id === dem.pm_product); const convertedReq = dem.pm_converted_to ? requirements.find((r: any) => r.id === dem.pm_converted_to) : null; const vs = dem.pm_valuestream ? vsConfigs.find((c: any) => c.id === dem.pm_valuestream) : null; const isExp = expanded.has(dem.id)
          const available = getAvailableStatuses(dem)
          const isBacklogged = dem.pm_status === 'Backlogged'
          const isTerminal = dem.pm_status === 'Rejected' || (dem.pm_status === 'Approved' && dem.pm_converted_to) || isBacklogged
          const showDropdown = !isTerminal && !(dem.pm_status === 'Approved' && dem.pm_converted_to)
          return (<Fragment key={dem.id}>
            <tr id={`row-${dem.id}`} className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(dem.id)} style={{ cursor: 'pointer' }}><td><strong>{dem.pm_title}</strong></td><td><span className="badge badge-gray">{dem.pm_type || '—'}</span></td><td><span className={`badge ${badgeClass(dem.pm_priority)}`}>{dem.pm_priority || '—'}</span></td><td><span className={`badge ${badgeClass(dem.pm_status)}`}>{dem.pm_status}</span></td><td>{prod?.pm_name || '—'}</td><td>{vs?.pm_name || '—'}</td><td>{cap?.pm_name || '—'}</td><td className="actions-cell" onClick={e => e.stopPropagation()}>
              {showDropdown && (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button id={`status-btn-${dem.id}`} className="btn btn-primary btn-sm" style={{ fontWeight: 600, fontSize: '0.8rem', padding: '6px 16px', position: 'relative' }} onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === dem.id ? null : dem.id) }}>
                    Change Status ▾
                  </button>
                  {openDropdown === dem.id && (
                    <div id={`status-popup-${dem.id}`} style={{
                      position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '4px',
                      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      boxShadow: 'var(--shadow-lg)', minWidth: '170px', overflow: 'hidden'
                    }}>
                      {available.length > 0 ? available.map((s: string) => (
                        <div key={s} style={{
                          padding: '8px 14px', fontSize: '0.83rem', cursor: 'pointer', fontWeight: 500,
                          transition: 'background 0.1s'
                        }} onClick={(e) => { e.stopPropagation(); handleStatusAction(dem.id, s) }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >{s}</div>
                      )) : (<>
                        <div style={{
                          padding: '8px 14px', fontSize: '0.83rem', cursor: 'pointer', fontWeight: 600,
                          color: 'var(--green)'
                        }} onClick={(e) => { e.stopPropagation(); handleStatusAction(dem.id, 'Approved') }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--green-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >✅ Approve</div>
                        <div style={{
                          padding: '8px 14px', fontSize: '0.83rem', cursor: 'pointer', fontWeight: 600,
                          color: 'var(--blue)'
                        }} onClick={(e) => { e.stopPropagation(); handleStatusAction(dem.id, 'Backlog') }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >📥 Save to Backlog</div>
                        <div style={{
                          padding: '8px 14px', fontSize: '0.83rem', cursor: 'pointer', fontWeight: 500,
                          color: 'var(--red)'
                        }} onClick={(e) => { e.stopPropagation(); handleStatusAction(dem.id, 'Rejected') }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >❌ Reject</div>
                      </>)}
                    </div>
                  )}
                </div>
              )}
              {isBacklogged && (
                <button className="btn-sm btn-link" onClick={() => reopenDemand(dem.id)} style={{ color: 'var(--primary)', fontWeight: 600 }}>🔄 Reopen</button>
              )}
              <button className="btn-sm btn-edit" onClick={() => openEdit(dem.id)}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this demand?')) { DS.delete('pm_demand', dem.id); reload(); showToast('Demand deleted!') } }}>🗑️</button>
            </td></tr>
            {isExp && <tr className="project-epic-row"><td colSpan={8}><div className="project-epic-item"><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}><span className="project-epic-meta">By: {dem.pm_submitted_by || '—'} on {dem.pm_submitted_date || '—'}</span></div>{dem.pm_detail && <div style={{ marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dem.pm_detail}</div>}{dem.pm_assessment_notes && <div style={{ marginBottom: '6px', color: 'var(--text)', fontSize: '0.85rem' }}><strong>Assessment:</strong> {dem.pm_assessment_notes}</div>}{convertedReq && <div style={{ color: 'var(--green)', fontSize: '0.85rem' }}>🔄 Converted to: <strong>{convertedReq.pm_detail?.substring(0, 80)}</strong> on {dem.pm_converted_date}</div>}</div></td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}
