import { useState } from 'react'
import { StatsCards } from '../components/StatsCards'

const TABLE_NAME = 'cr506_pmt_pm_test1s'
const API_BASE = '/api/data/v9.2'
const FIELDS = { name: 'cr506_pmt_pm_test', value: 'cr506_pmt_value', status: 'cr506_pmt_status' }

const getId = (r: any) => {
  const link = r['@odata.editLink'] || r['@odata.id'] || ''
  const m = link.match(/\(([^)]+)\)/)
  return m ? m[1] : r.cr506_pmt_pm_test1id || r.id || ''
}

export function TestView() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAction, setLastAction] = useState('')
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newStatus, setNewStatus] = useState('Active')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'OData-Version': '4.0',
    'OData-MaxVersion': '4.0',
    'Prefer': 'return=representation'
  }

  const fetchAll = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/${TABLE_NAME}`, { headers })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const data = await res.json()
      setRecords(data.value || [])
      setLastAction(`GET All — ${(data.value || []).length} records`)
    } catch (e: any) {
      setError(e.message)
      setLastAction('GET All — FAILED')
    } finally { setLoading(false) }
  }

  const createRecord = async () => {
    if (!newName) return
    setLoading(true); setError('')
    try {
      const body = { [FIELDS.name]: newName, [FIELDS.value]: newValue, [FIELDS.status]: newStatus }
      const res = await fetch(`${API_BASE}/${TABLE_NAME}`, { method: 'POST', headers, body: JSON.stringify(body) })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setNewName(''); setNewValue(''); setNewStatus('Active')
      setLastAction(`CREATE — success`)
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
      setLastAction('CREATE — FAILED')
    } finally { setLoading(false) }
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this test record?')) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/${TABLE_NAME}(${id})`, { method: 'DELETE', headers })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setLastAction(`DELETE — success`)
      await fetchAll()
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
        { value: error ? 1 : 0, label: 'Errors' }
      ]} />

      <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Table: <strong>{TABLE_NAME}</strong> · API: <code>{API_BASE}/{TABLE_NAME}</code>
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
              <tr key={getId(r)} className="data-row">
                <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getId(r).substring(0, 8)}...</td>
                <td><strong>{r[FIELDS.name] || '—'}</strong></td>
                <td>{r[FIELDS.value] || '—'}</td>
                <td><span className="badge badge-green">{r[FIELDS.status] || '—'}</span></td>
                <td className="actions-cell">
                  <button className="btn-sm btn-delete" onClick={() => deleteRecord(getId(r))}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {records.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '4px' }}>No records yet</p>
          <p style={{ fontSize: '0.82rem' }}>Click "Fetch All" to load from Dataverse, or "Create" to add a test record.</p>
          <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--text-soft)' }}>In DEV (localhost) this will fail — deploy to Power Apps for Dataverse access.</p>
        </div>
      )}
    </div>
  )
}
