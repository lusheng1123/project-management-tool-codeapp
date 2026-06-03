import { useState, useEffect } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { DataTable } from '../components/DataTable'
import type { ColumnDef, ActionDef } from '../components/DataTable'

export function DependenciesView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_dependency')) }, [key])
  const columns: ColumnDef[] = [{ field: 'pm_summary', label: 'Dependency Summary' },{ field: 'pm_detail', label: 'Detail' },{ field: 'pm_riskid', label: 'Risk', render: (r: any) => DS.getLookupName('pm_risk', r.pm_riskid) }]
  const actions: ActionDef[] = [{ id: 'edit', label: '✏️ Edit', cls: 'edit', onClick: (id) => { const rec = DS.getById('pm_dependency', id); const risks = DS.getAll('pm_risk'); showModal({ title: 'Edit Dependency', fields: getFields('pm_dependency').filter(f => f.name !== 'pm_riskid'), data: rec, extraContent: (<div><label>Risk</label><select id="depRisk" data-extra defaultValue={rec.pm_riskid || ''}><option value="">None</option>{risks.map((r: any) => <option key={r.id} value={r.id}>{r.pm_summary}</option>)}</select></div>), onSave: (fd) => { fd.pm_riskid = (document.getElementById('depRisk') as HTMLSelectElement).value; DS.update('pm_dependency', id, fd); reload(); showToast('Dependency updated!') }, onDelete: () => { DS.delete('pm_dependency', id); reload(); showToast('Dependency deleted!') } }) } },{ id: 'delete', label: '🗑️', cls: 'delete', onClick: (id) => { if (confirm('Delete this dependency?')) { DS.delete('pm_dependency', id); reload(); showToast('Dependency deleted!') } } }]
  return (<div><div className="dashboard-header"><h2>🔗 Dependencies</h2><button className="btn btn-primary" onClick={() => { const risks = DS.getAll('pm_risk'); showModal({ title: 'New Dependency', fields: getFields('pm_dependency').filter(f => f.name !== 'pm_riskid'), extraContent: (<div><label>Risk</label><select id="depRisk" data-extra><option value="">None</option>{risks.map((r: any) => <option key={r.id} value={r.id}>{r.pm_summary}</option>)}</select></div>), onSave: (fd) => { fd.pm_riskid = (document.getElementById('depRisk') as HTMLSelectElement).value; DS.create('pm_dependency', fd); reload(); showToast('Dependency created!') } }) }}>+ New Dependency</button></div><StatsCards stats={[{ value: data.length, label: 'Dependencies' }]} /><SearchBar /><DataTable columns={columns} data={data} actions={actions} /></div>)
}

