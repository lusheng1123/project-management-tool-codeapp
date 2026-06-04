import { useState, useEffect, useMemo } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI } from '../context/UIContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

const renderRoleCheckboxes = (roleConfigs: any[], currentRoles: string) => {
  const selected = new Set(currentRoles.split(',').map(r => r.trim()).filter(Boolean))
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Roles</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {roleConfigs.map((c: any) => (
          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: selected.has(c.pm_name) ? 'var(--primary-bg)' : 'var(--surface)', cursor: 'pointer', fontSize: '0.83rem', userSelect: 'none' }}>
            <input type="checkbox" data-role-checkbox value={c.pm_name} defaultChecked={selected.has(c.pm_name)} style={{ accentColor: 'var(--primary)' }} />
            {c.pm_name}
          </label>
        ))}
      </div>
    </div>
  )
}

const getCheckedRoles = () => {
  const boxes = document.querySelectorAll<HTMLInputElement>('[data-role-checkbox]')
  return [...boxes].filter(b => b.checked).map(b => b.value).join(',')
}

export function UsersView() {
  const [data, setData] = useState<any[]>([]); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  useEffect(() => { setData(DS.getAll('pm_user')) }, [key])
  const roleConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'user_role' }), [key])
  const { term } = useSearch()
  const filtered = term ? data.filter((u: any) => Object.values(u).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const openEdit = (id: string) => {
    const rec = DS.getById('pm_user', id); if (!rec) return
    showModal({ title: 'Edit User', fields: getFields('pm_user').filter(f => !['pm_role', 'pm_status'].includes(f.name)), data: rec, extraContent: renderRoleCheckboxes(roleConfigs, rec.pm_role || ''), onSave: (fd) => { fd.pm_role = getCheckedRoles(); fd.pm_status = rec.pm_status || 'Active'; DS.update('pm_user', id, fd); reload(); showToast('User updated!') }, onDelete: () => { DS.delete('pm_user', id); reload(); showToast('User deleted!') } })
  }

  return (
    <div>
      <div className="dashboard-header"><h2>👤 User Management</h2><button className="btn btn-primary" onClick={() => { showModal({ title: 'New User', fields: getFields('pm_user').filter(f => !['pm_role', 'pm_status'].includes(f.name)), extraContent: renderRoleCheckboxes(roleConfigs, ''), onSave: (fd) => { fd.pm_role = getCheckedRoles(); fd.pm_status = 'Active'; DS.create('pm_user', fd); reload(); showToast('User created!') } }) }}>+ New User</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Users' },{ value: data.filter((u: any) => u.pm_status === 'Active').length, label: 'Active' },{ value: data.filter((u: any) => u.pm_role?.includes(',')).length, label: 'Multi-Role' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No users found" /> : (
        <table className="data-table"><thead><tr><th>Username</th><th>Display Name</th><th>Role(s)</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((u: any) => (
          <tr key={u.id} className="data-row">
            <td><strong>{u.pm_username}</strong></td>
            <td>{u.pm_displayname}</td>
            <td>{u.pm_role?.split(',').map((r: string) => <span key={r.trim()} className="badge badge-blue" style={{ marginRight: '4px', fontSize: '0.7rem' }}>{r.trim()}</span>) || '—'}</td>
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
