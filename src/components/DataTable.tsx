import { useState, useMemo } from 'react'
import { useSearch } from '../context/SearchContext'
import { badgeClass } from '../context/UIContext'
import { EmptyState } from './EmptyState'

export interface ColumnDef { field: string; label: string; format?: string; render?: (record: any) => string }
export interface ActionDef { id: string; label: string; cls?: string; onClick?: (id: string) => void }

export function DataTable({ columns, data, actions, rowKey = 'id', onRowClick }: { columns: ColumnDef[]; data: any[]; actions?: ActionDef[]; rowKey?: string; onRowClick?: (id: string) => void }) {
  const { term } = useSearch()
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const filtered = useMemo(() => { if (!term) return data; const t = term.toLowerCase(); return data.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(t))) }, [data, term])
  const sorted = useMemo(() => { if (!sortField) return filtered; return [...filtered].sort((a: any, b: any) => { const va = a[sortField] ?? ''; const vb = b[sortField] ?? ''; return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va)) }) }, [filtered, sortField, sortDir])
  const handleSort = (field: string) => { if (sortField === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') } else { setSortField(field); setSortDir('asc') } }
  if (!sorted.length) return <EmptyState msg="No records found" />
  return (<table className="data-table"><thead><tr>{columns.map(c => (<th key={c.field} className="sortable-th" onClick={() => handleSort(c.field)}>{c.label}{sortField === c.field && <span className="sort-arrow">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>}</th>))}{actions && <th>Actions</th>}</tr></thead><tbody>{sorted.map(record => (<tr key={record[rowKey]} className="data-row" onClick={() => onRowClick?.(record.id)} style={onRowClick ? { cursor: 'pointer' } : undefined}>{columns.map(c => { let val = record[c.field]; if (c.render) val = c.render(record); if (c.format === 'badge') return <td key={c.field}><span className={`badge ${badgeClass(val)}`}>{val ?? '—'}</span></td>; return <td key={c.field}>{val ?? '—'}</td> })}{actions && (<td className="actions-cell">{actions.map(a => (<button key={a.id} className={`btn-sm btn-${a.cls || 'edit'}`} onClick={e => { e.stopPropagation(); a.onClick?.(record.id) }}>{a.label}</button>))}</td>)}</tr>))}</tbody></table>)
}

