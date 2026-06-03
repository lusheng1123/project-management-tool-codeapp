import { useState, useEffect } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { DataTable } from '../components/DataTable'
import type { ColumnDef, ActionDef } from '../components/DataTable'

export function ConfigView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const [typeFilter, setTypeFilter] = useState(''); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_config')) }, [key])
  const { term } = useSearch()
  const filtered = (term ? data.filter((c: any) => Object.values(c).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data).filter((c: any) => !typeFilter || c.pm_type === typeFilter)
  const types = ['value_stream', 'team', 'department', 'enhancement_type', 'capability_type', 'governance_status', 'priority', 'rag_status', 'requirement_status', 'psc_approval_status', 'signoff_status', 'resource_status', 'project_status', 'release_status', 'yes_no', 'tool']
  const columns: ColumnDef[] = [{ field: 'pm_type', label: 'Type', format: 'badge' },{ field: 'pm_name', label: 'Name' },{ field: 'pm_description', label: 'Description' },{ field: 'pm_hardcoded', label: 'Code Change?', format: 'badge' }]
  const actions: ActionDef[] = [{ id: 'edit', label: '✏️ Edit', cls: 'edit', onClick: (id) => { const rec = DS.getById('pm_config', id); showModal({ title: 'Edit Config', fields: getFields('pm_config'), data: rec, onSave: (fd) => { DS.update('pm_config', id, fd); reload(); showToast('Config updated!') }, onDelete: () => { DS.delete('pm_config', id); reload(); showToast('Config deleted!') } }) } },{ id: 'delete', label: '🗑️', cls: 'delete', onClick: (id) => { if (confirm('Delete this config entry?')) { DS.delete('pm_config', id); reload(); showToast('Config deleted!') } } }]
  return (<div><div className="dashboard-header"><h2>⚙️ Configuration</h2><button className="btn btn-primary" onClick={() => showModal({ title: 'New Config', fields: getFields('pm_config'), onSave: (fd) => { DS.create('pm_config', fd); reload(); showToast('Config created!') } })}>+ New Config</button></div><StatsCards stats={[{ value: data.length, label: 'Total' },{ value: data.filter((c: any) => c.pm_type === 'value_stream').length, label: 'Val. Streams' },{ value: data.filter((c: any) => c.pm_type === 'team').length, label: 'Teams' },{ value: data.filter((c: any) => c.pm_type === 'capability_type').length, label: 'Cap. Types' },{ value: data.filter((c: any) => c.pm_type === 'governance_status').length, label: 'Gov. Status' },{ value: data.filter((c: any) => c.pm_type === 'priority').length, label: 'Priorities' }]} /><div className="filter-bar" style={{ gap: 10 }}><SearchBar /><select className="btn-sm btn-reset" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px 14px' }}><option value="">All Types</option>{types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div><DataTable columns={columns} data={filtered} actions={actions} /></div>)
}

