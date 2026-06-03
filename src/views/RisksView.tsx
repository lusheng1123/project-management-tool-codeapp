import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { DataTable } from '../components/DataTable'
import type { ColumnDef, ActionDef } from '../components/DataTable'

export function RisksView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_risk')) }, [key]); const deps = useMemo(() => DS.getAll('pm_dependency'), [key])
  const columns: ColumnDef[] = [{ field: 'pm_summary', label: 'Risk Summary' },{ field: 'pm_detail', label: 'Detail' },{ field: 'pm_projectname', label: 'Project', render: (r: any) => DS.getLookupName('pm_project', r.pm_projectname) }]
  const actions: ActionDef[] = [{ id: 'edit', label: '✏️ Edit', cls: 'edit', onClick: (id) => { const rec = DS.getById('pm_risk', id); const projects = DS.getAll('pm_project'); showModal({ title: 'Edit Risk', fields: getFields('pm_risk').filter(f => f.name !== 'pm_projectname'), data: rec, extraContent: (<div><label>Project</label><select id="riskProject" data-extra defaultValue={rec.pm_projectname || ''}><option value="">None</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_projectname = (document.getElementById('riskProject') as HTMLSelectElement).value; DS.update('pm_risk', id, fd); reload(); showToast('Risk updated!') }, onDelete: () => { DS.delete('pm_risk', id); reload(); showToast('Risk deleted!') } }) } },{ id: 'delete', label: '🗑️', cls: 'delete', onClick: (id) => { if (confirm('Delete this risk?')) { DS.delete('pm_risk', id); reload(); showToast('Risk deleted!') } } }]
  return (<div><div className="dashboard-header"><h2>⚠️ Risk Dashboard</h2><button className="btn btn-primary" onClick={() => { const projects = DS.getAll('pm_project'); showModal({ title: 'New Risk', fields: getFields('pm_risk').filter(f => f.name !== 'pm_projectname'), extraContent: (<div><label>Project</label><select id="riskProject" data-extra><option value="">None</option>{projects.map((p: any) => <option key={p.id} value={p.id}>{p.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_projectname = (document.getElementById('riskProject') as HTMLSelectElement).value; DS.create('pm_risk', fd); reload(); showToast('Risk created!') } }) }}>+ New Risk</button></div><StatsCards stats={[{ value: data.length, label: 'Risks' },{ value: deps.length, label: 'Dependencies' }]} /><SearchBar /><DataTable columns={columns} data={data} actions={actions} /></div>)
}

