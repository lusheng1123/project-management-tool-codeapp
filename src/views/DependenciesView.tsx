import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function DependenciesView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_dependency')) }, [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key]); const projects = useMemo(() => DS.getAll('pm_project'), [key]); const requirements = useMemo(() => DS.getAll('pm_requirement'), [key])
  const getReqsForProduct = (prodId: string) => prodId ? requirements.filter((r: any) => { const p = projects.find((pj: any) => pj.id === r.pm_projectname); return p && p.pm_productname === prodId }) : []
  const { term } = useSearch()
  const filtered = term ? data.filter((d: any) => Object.values(d).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_dependency', id); if (!rec) return
    const selReqs = getReqsForProduct(rec.pm_productname || '')
    showModal({ title: 'Edit Dependency', fields: getFields('pm_dependency').filter(f => !['pm_productname', 'pm_requirementid'].includes(f.name)), data: rec, wide: true, extraContent: (<div><label>Product</label><select id="depProd" data-extra defaultValue={rec.pm_productname || ''}><option value="">Select Product...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>Requirement (optional)</label><select id="depReq" data-extra defaultValue={rec.pm_requirementid || ''}><option value="">None</option>{selReqs.map((r: any) => <option key={r.id} value={r.id}>{r.pm_detail?.substring(0, 80)}</option>)}</select></div>), onAfterOpen: () => { const prodSel = document.getElementById('depProd') as HTMLSelectElement; prodSel?.addEventListener('change', () => { const reqSel = document.getElementById('depReq') as HTMLSelectElement; if (!reqSel) return; const newReqs = getReqsForProduct(prodSel.value); reqSel.innerHTML = '<option value="">None</option>' + newReqs.map((r: any) => `<option value="${r.id}">${r.pm_detail?.substring(0, 80)}</option>`).join('') }) }, onSave: (fd) => { fd.pm_productname = (document.getElementById('depProd') as HTMLSelectElement)?.value || ''; fd.pm_requirementid = (document.getElementById('depReq') as HTMLSelectElement)?.value || ''; DS.update('pm_dependency', id, fd); reload(); showToast('Dependency updated!') }, onDelete: () => { DS.delete('pm_dependency', id); reload(); showToast('Dependency deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>🔗 Dependencies</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'New Dependency', fields: getFields('pm_dependency').filter(f => !['pm_productname', 'pm_requirementid'].includes(f.name)), wide: true, extraContent: (<div><label>Product</label><select id="depProd" data-extra><option value="">Select Product...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select><label>Requirement (optional)</label><select id="depReq" data-extra><option value="">None</option></select></div>), onAfterOpen: () => { const prodSel = document.getElementById('depProd') as HTMLSelectElement; prodSel?.addEventListener('change', () => { const reqSel = document.getElementById('depReq') as HTMLSelectElement; if (!reqSel) return; const newReqs = getReqsForProduct(prodSel.value); reqSel.innerHTML = '<option value="">None</option>' + newReqs.map((r: any) => `<option value="${r.id}">${r.pm_detail?.substring(0, 80)}</option>`).join('') }) }, onSave: (fd) => { fd.pm_productname = (document.getElementById('depProd') as HTMLSelectElement)?.value || ''; fd.pm_requirementid = (document.getElementById('depReq') as HTMLSelectElement)?.value || ''; DS.create('pm_dependency', fd); reload(); showToast('Dependency created!') } }) }}>+ New Dependency</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Dependencies' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No dependencies found" /> : (
        <table className="data-table"><thead><tr><th>Summary</th><th>Detail</th><th>Product</th><th>Requirement</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((dep: any) => { const prod = products.find((p: any) => p.id === dep.pm_productname); const req = dep.pm_requirementid ? requirements.find((r: any) => r.id === dep.pm_requirementid) : null; return (<tr key={dep.id} className="data-row"><td><strong>{dep.pm_summary}</strong></td><td>{dep.pm_detail?.substring(0, 100)}</td><td>{prod?.pm_name || '—'}</td><td>{req?.pm_detail?.substring(0, 60) || '—'}</td><td className="actions-cell"><button className="btn-sm btn-edit" onClick={() => openEdit(dep.id)}>✏️ Edit</button><button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this dependency?')) { DS.delete('pm_dependency', dep.id); reload(); showToast('Dependency deleted!') } }}>🗑️</button></td></tr>) })}</tbody></table>
      )}
    </div>
  )
}
