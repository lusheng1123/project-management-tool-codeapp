import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function CapabilitiesView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_capability')) }, [key]); const { term } = useSearch()
  const products = useMemo(() => DS.getAll('pm_product'), [key]); const requirements = useMemo(() => DS.getAll('pm_requirement'), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s }) }
  const filtered = term ? data.filter((c: any) => Object.values(c).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data
  const handleLink = (capId: string) => { const linked = DS.getProductsByCapability(capId); const linkedIds = linked.map((p: any) => p.id); showModal({ title: 'Link Products to Capability', fields: [], extraContent: (<div className="checkbox-group">{products.map((p: any) => (<label key={p.id} className="checkbox-label"><input type="checkbox" name={`prod_${p.id}`} defaultChecked={linkedIds.includes(p.id)} data-extra />{p.pm_name} ({p.pm_shortname || 'N/A'})</label>))}</div>), onSave: () => { const existing = DS.query('pm_capabilityproduct', { pm_capabilityid: capId }); existing.forEach((l: any) => DS.delete('pm_capabilityproduct', l.id)); const checks = document.querySelectorAll<HTMLInputElement>('#modalForm input[type=checkbox]:checked'); checks.forEach(cb => { DS.create('pm_capabilityproduct', { pm_capabilityid: capId, pm_productname: cb.name.replace('prod_', '') }) }); reload(); showToast('Products linked!') } }) }
  return (
    <div>
      <div className="dashboard-header"><h2>🎯 Capability Dashboard</h2><button className="btn btn-primary" onClick={() => { const ctConfigs = DS.query('pm_config', { pm_type: 'capability_type' }); showModal({ title: 'New Capability', fields: getFields('pm_capability').filter(f => f.name !== 'pm_capabilitytype'), extraContent: (<div><label>Type</label><select id="capCT" data-extra><option value="">None</option>{ctConfigs.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_capabilitytype = (document.getElementById('capCT') as HTMLSelectElement)?.value || ''; DS.create('pm_capability', fd); reload(); showToast('Capability created!') } }) }}>+ New Capability</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Capabilities' },{ value: products.length, label: 'Products' },{ value: requirements.length, label: 'Requirements' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No capabilities found" /> : (
        <table className="data-table"><thead><tr><th>Capability</th><th>Type</th><th>Effort</th><th>Linked Products</th><th>Requirements</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((cap: any) => {
          const lp = DS.getProductsByCapability(cap.id); const capReqs = requirements.filter((r: any) => r.pm_capabilityid === cap.id)
          const rc = capReqs.length; const pn = lp.map((p: any) => p.pm_name).join(', ') || 'None'; const capType = DS.getLookupName('pm_config', cap.pm_capabilitytype)
          const capEffort = capReqs.reduce((sum: number, r: any) => sum + (Number(r.pm_effort) || 0), 0); const isExp = expanded.has(cap.id)
          return (<Fragment key={cap.id}>
            <tr className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(cap.id)} style={{ cursor: 'pointer' }}><td><strong>{cap.pm_name}</strong><br /><small>{cap.pm_description || ''}</small></td><td>{capType}</td><td><span style={{ fontWeight: 700 }}>{capEffort}d</span></td><td>{pn}</td><td>{rc} reqs</td><td className="actions-cell" onClick={e => e.stopPropagation()}><button className="btn-sm btn-edit" onClick={() => { const rec = DS.getById('pm_capability', cap.id); const ctConfigs = DS.query('pm_config', { pm_type: 'capability_type' }); showModal({ title: 'Edit Capability', fields: getFields('pm_capability').filter(f => f.name !== 'pm_capabilitytype'), data: rec, extraContent: (<div><label>Type</label><select id="capCT" data-extra defaultValue={rec.pm_capabilitytype || ''}><option value="">None</option>{ctConfigs.map((c: any) => <option key={c.id} value={c.id}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_capabilitytype = (document.getElementById('capCT') as HTMLSelectElement)?.value || ''; DS.update('pm_capability', cap.id, fd); reload(); showToast('Capability updated!') }, onDelete: () => { DS.delete('pm_capability', cap.id); reload(); showToast('Capability deleted!') } }) }}>✏️ Edit</button><button className="btn-sm btn-link" onClick={() => handleLink(cap.id)}>🔗 Link Products</button><button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this capability?')) { DS.delete('pm_capability', cap.id); reload(); showToast('Capability deleted!') } }}>🗑️</button></td></tr>
            {isExp && capReqs.map((r: any) => (<tr key={r.id} className="project-epic-row"><td colSpan={6}><div className="project-epic-item"><span className="project-epic-name">{r.pm_detail?.substring(0, 70)}</span><span className="project-epic-meta">Effort: {r.pm_effort || '—'}d | Status: <span className={`badge ${badgeClass(r.pm_status)}`}>{r.pm_status || '—'}</span></span></div></td></tr>))}
            {isExp && capReqs.length === 0 && <tr className="project-epic-row"><td colSpan={6} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No requirements linked</td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}

