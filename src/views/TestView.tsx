import { useState } from 'react'
import { DS } from '../data'
import { StatsCards } from '../components/StatsCards'

export function TestView() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newStatus, setNewStatus] = useState('Active')

  const fetchAll = () => {
    setLoading(true); setError('')
    try {
      const data = DS.getAll('pm_test')
      setRecords(data)
      setLastAction(`GET All — ${data.length} records`)
    } catch (e: any) {
      setError(e.message)
      setLastAction('FAILED')
    } finally { setLoading(false) }
  }

  const createRecord = () => {
    if (!newName) return
    setLoading(true); setError('')
    try {
      DS.create('pm_test', { pm_name: newName, pm_value: newValue, pm_status: newStatus })
      setNewName(''); setNewValue(''); setNewStatus('Active')
      setLastAction('CREATE — success')
      fetchAll()
    } catch (e: any) {
      setError(e.message)
      setLastAction('CREATE — FAILED')
    } finally { setLoading(false) }
  }

  const deleteRecord = (id: string) => {
    if (!confirm('Delete this test record?')) return
    setLoading(true); setError('')
    try {
      DS.delete('pm_test', id)
      setLastAction('DELETE — success')
      fetchAll()
    } catch (e: any) {
      setError(e.message)
      setLastAction('DELETE — FAILED')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="dashboard-header"><h2>🧪 Dataverse Test</h2></div>
      <StatsCards stats={[
        { value: records.length, label: 'Records' },
        { value: 0, label: 'Errors' }
      ]} />

      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Using: <strong>localStorage (via DS)</strong>
          {' · '}<code>DS.getAll('pm_test')</code>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <button className="btn btn-primary" onClick={fetchAll} disabled={loading}>
            {loading ? '...' : 'Fetch All'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: 600 }}>Create Record</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Name *</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Test name" style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: '150px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Value</label>
            <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Test value" style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: '150px' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>Status</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.82rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <option value="Active">Active</option>
              <option value="Done">Done</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={createRecord} disabled={loading || !newName}>Create</button>
        </div>
      </div>

      {lastAction && (
        <div style={{ marginBottom: '12px', padding: '8px 14px', borderRadius: 'var(--radius-sm)', background: error ? 'var(--red-bg)' : 'var(--green-bg)', border: `1px solid ${error ? 'var(--red)' : 'var(--green)'}`, fontSize: '0.82rem' }}>
          <strong>{lastAction}</strong>
          {error && <div style={{ color: 'var(--red)', marginTop: '4px' }}>{error}</div>}
        </div>
      )}

      {records.length > 0 && (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id} className="data-row">
                <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{(r.id || '').substring(0, 8)}...</td>
                <td><strong>{r.pm_name || '—'}</strong></td>
                <td>{r.pm_value || '—'}</td>
                <td><span className="badge badge-green">{r.pm_status || '—'}</span></td>
                <td className="actions-cell">
                  <button className="btn-sm btn-delete" onClick={() => deleteRecord(r.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {records.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '4px' }}>No records yet</p>
          <p style={{ fontSize: '0.82rem' }}>Click "Fetch All" to load from localStorage.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--text-soft)' }}>
            Using localStorage — deploy to Power Apps and register a Dataverse table to switch.
          </p>
        </div>
      )}
    </div>
  )
}
