import { useState, useEffect } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { DataTable } from '../components/DataTable'
import type { ColumnDef, ActionDef } from '../components/DataTable'

export function UserStoriesView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_userstory')) }, [key])
  const columns: ColumnDef[] = [{ field: 'pm_detail', label: 'Detail' },{ field: 'pm_epicid', label: 'Epic', render: (r: any) => DS.getLookupName('pm_epic', r.pm_epicid) },{ field: 'pm_storypoint', label: 'Story Points' },{ field: 'pm_acceptancecriteria', label: 'Acceptance Criteria' }]
  const actions: ActionDef[] = [{ id: 'edit', label: '✏️ Edit', cls: 'edit', onClick: (id) => { const rec = DS.getById('pm_userstory', id); showModal({ title: 'Edit User Story', fields: getFields('pm_userstory'), data: rec, onSave: (fd) => { DS.update('pm_userstory', id, fd); reload(); showToast('User Story updated!') }, onDelete: () => { DS.delete('pm_userstory', id); reload(); showToast('User Story deleted!') } }) } },{ id: 'delete', label: '🗑️', cls: 'delete', onClick: (id) => { if (confirm('Delete this story?')) { DS.delete('pm_userstory', id); reload(); showToast('Story deleted!') } } }]
  return (<div><div className="dashboard-header"><h2>📝 User Stories</h2><button className="btn btn-primary" onClick={() => { const epics = DS.getAll('pm_epic'); showModal({ title: 'New User Story', fields: getFields('pm_userstory').filter(f => f.name !== 'pm_epicid'), extraContent: (<div><label>Epic</label><select id="storyEpic" data-extra><option value="">None</option>{epics.map((e: any) => <option key={e.id} value={e.id}>{e.pm_title}</option>)}</select></div>), onSave: (fd) => { fd.pm_epicid = (document.getElementById('storyEpic') as HTMLSelectElement).value; DS.create('pm_userstory', fd); reload(); showToast('Story created!') } }) }}>+ New Story</button></div><StatsCards stats={[{ value: data.length, label: 'Total Stories' }]} /><SearchBar /><DataTable columns={columns} data={data} actions={actions} /></div>)
}

