import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function UsersView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_user')) }, [key])
  const roleConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'user_role' }), [key])
  const { term } = useSearch()
  const filtered = term ? data.filter((u: any) => Object.values(u).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_user', id); if (!rec) return
    showModal({ title: 'Edit User', fields: getFields('pm_user').filter(f => !['pm_role', 'pm_status'].includes(f.name)), data: rec, extraContent: (<div><label>Role</label><select id="userRole" data-extra defaultValue={rec.pm_role || ''}><option value="">Select Role...</option>{roleConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_role = (document.getElementById('userRole') as HTMLSelectElement)?.value || ''; fd.pm_status = rec.pm_status || 'Active'; DS.update('pm_user', id, fd); reload(); showToast('User updated!') }, onDelete: () => { DS.delete('pm_user', id); reload(); showToast('User deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>👤 User Management</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'New User', fields: getFields('pm_user').filter(f => !['pm_role', 'pm_status'].includes(f.name)), extraContent: (<div><label>Role</label><select id="userRole" data-extra><option value="">Select Role...</option>{roleConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_role = (document.getElementById('userRole') as HTMLSelectElement)?.value || ''; fd.pm_status = 'Active'; DS.create('pm_user', fd); reload(); showToast('User created!') } }) }}>+ New User</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Users' },{ value: data.filter((u: any) => u.pm_status === 'Active').length, label: 'Active' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No users found" /> : (
        <table className="data-table"><thead><tr><th>Username</th><th>Display Name</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((u: any) => (
          <tr key={u.id} className="data-row">
            <td><strong>{u.pm_username}</strong></td>
            <td>{u.pm_displayname}</td>
            <td><span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>{u.pm_role || '—'}</span></td>
            <td>{u.pm_email || '—'}</td>
            <td><span className="badge badge-green">{u.pm_status || 'Active'}</span></td>
            <td className="actions-cell">
              <button className="btn-sm btn-edit" onClick={() => openEdit(u.id)}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this user?')) { DS.delete('pm_user', u.id); reload(); showToast('User deleted!') } }}>🗑️</button>
            </td>
          </tr>
        ))}</tbody></table>
      )}
    </div>
  )
}
