import { useState, useEffect, useMemo, Fragment } from 'react'
import { DS } from '../data'
import { getFields } from '../models'
import { useUI, badgeClass } from '../context/UIContext'
import { useNavigation } from '../context/NavigationContext'
import { useSearch } from '../context/SearchContext'
import { StatsCards } from '../components/StatsCards'
import { SearchBar } from '../components/SearchBar'
import { EmptyState } from '../components/EmptyState'

export function ReleasesView() {
  const [data, setData] = useState<any[]>([]); const [expanded, setExpanded] = useState<Set<string>>(new Set()); const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set()); const [key, setKey] = useState(0); const reload = () => setKey(k => k + 1); const { showToast, showModal } = useUI()
  const { focusId, clearFocus } = useNavigation()
  useEffect(() => { setData(DS.getAll('pm_release')) }, [key])
  const items = useMemo(() => DS.getAll('pm_releaseitem'), [key]); const stories = useMemo(() => DS.getAll('pm_userstory'), [key]); const epics = useMemo(() => DS.getAll('pm_epic'), [key])
  const toggle = (id: string) => { setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s }) }
  const toggleEpic = (id: string) => { setExpandedEpics(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s }) }
  const { term } = useSearch()

  useEffect(() => {
    if (!focusId) return
    setExpanded(prev => new Set([...prev, focusId]))
    setTimeout(() => {
      const el = document.getElementById(`row-${focusId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.classList.add('row-focus-flash')
      setTimeout(() => el?.classList.remove('row-focus-flash'), 2000)
      clearFocus()
    }, 120)
  }, [focusId])
  const filtered = term ? data.filter((r: any) => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(term.toLowerCase()))) : data

  const changeReleaseStatus = (id: string, newStatus: string) => { DS.update('pm_release', id, { pm_status: newStatus }); reload(); showToast(`Release ${newStatus}!`) }
  const openRelease = (id: string) => changeReleaseStatus(id, 'Open')
  const reviewRelease = (id: string) => changeReleaseStatus(id, 'In Review')
  const completeRelease = (id: string) => changeReleaseStatus(id, 'Released')

  const showSignoffModal = (riId: string) => { const ri = DS.getById('pm_releaseitem', riId); if (!ri) return; const story = DS.getById('pm_userstory', ri.pm_userstory); const ssConfigs = DS.query('pm_config', { pm_type: 'signoff_status' }); showModal({ title: `Signoff: ${story?.pm_detail?.substring(0, 50) || '—'}`, fields: [{ name: 'pm_signoff_status', label: 'Decision', type: 'choice', choices: ssConfigs.map((c: any) => c.pm_name), required: true },{ name: 'pm_signoff_note', label: 'Note', type: 'text' }], data: { pm_signoff_status: ri.pm_signoff_status === 'Pending' ? '' : ri.pm_signoff_status, pm_signoff_note: ri.pm_signoff_note || '' }, onSave: (fd) => { DS.update('pm_releaseitem', riId, { pm_signoff_status: fd.pm_signoff_status, pm_signoff_note: fd.pm_signoff_note || '', pm_signoff_by: 'PO', pm_signoff_date: new Date().toISOString().slice(0, 10) }); reload(); showToast('Signoff recorded!') } }) }

  const registerStory = (relId: string) => { const unregistered = stories.filter((s: any) => !items.some((ri: any) => ri.pm_release === relId && ri.pm_userstory === s.id)); const toolConfigs = DS.query('pm_config', { pm_type: 'tool' }); showModal({ title: 'Register User Story', fields: [], extraContent: (<div>{unregistered.length === 0 ? <p>All stories already registered</p> : (<div><label>User Story</label><select id="regStory" data-extra>{unregistered.map((s: any) => <option key={s.id} value={s.id}>{s.pm_detail?.substring(0, 80)}</option>)}</select><label>Developer</label><input type="text" id="regDev" data-extra placeholder="Your name" /><label>Tool</label><select id="regTool" data-extra><option value="">None</option>{toolConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>)}</div>), onSave: () => { const sid = (document.getElementById('regStory') as HTMLSelectElement)?.value; const dev = (document.getElementById('regDev') as HTMLInputElement)?.value; const tool = (document.getElementById('regTool') as HTMLSelectElement)?.value || ''; if (!sid) return; DS.create('pm_releaseitem', { pm_release: relId, pm_userstory: sid, pm_signoff_status: 'Pending', pm_registered_by: dev || 'Dev', pm_registered_date: new Date().toISOString().slice(0, 10), pm_tool: tool }); reload(); showToast('Story registered!') } }) }

  const groupByEpic = (ri: any[]) => {
    const groups: Record<string, any[]> = {}
    const unlinked: any[] = []
    ri.forEach((i: any) => {
      const story = stories.find((s: any) => s.id === i.pm_userstory)
      const epicId = story?.pm_epicid
      if (!epicId) { unlinked.push({ ...i, story }); return }
      if (!groups[epicId]) groups[epicId] = []
      groups[epicId].push({ ...i, story })
    })
    return { groups, unlinked }
  }

  return (
    <div>
      <div className="dashboard-header"><h2>🚀 Release Management</h2><button className="btn btn-primary" onClick={() => { const rsConfigs = DS.query('pm_config', { pm_type: 'release_status' }); showModal({ title: 'New Release', fields: getFields('pm_release').filter(f => f.name !== 'pm_status'), extraContent: (<div><label>Status</label><select id="relStatus" data-extra>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_status = (document.getElementById('relStatus') as HTMLSelectElement)?.value || 'Draft'; DS.create('pm_release', fd); reload(); showToast('Release created!') } }) }}>+ New Release</button></div>
      <StatsCards stats={[{ value: data.length, label: 'Releases' },{ value: data.filter((r: any) => r.pm_status === 'Open').length, label: 'Open' },{ value: data.filter((r: any) => r.pm_status === 'In Review').length, label: 'In Review' },{ value: data.filter((r: any) => r.pm_status === 'Released').length, label: 'Released' }]} />
      <SearchBar />
      {!filtered.length ? <EmptyState msg="No releases found" /> : (
        <table className="data-table"><thead><tr><th>Release</th><th>Status</th><th>Release Date</th><th>Cutoff</th><th>Items</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map((rel: any) => {
          const ri = items.filter((i: any) => i.pm_release === rel.id)
          const approved = ri.filter((i: any) => i.pm_signoff_status === 'Approved').length
          const isExp = expanded.has(rel.id)
          return (<Fragment key={rel.id}>
            <tr id={`row-${rel.id}`} className={`data-row${isExp ? ' project-row-expanded' : ''} project-main-row`} onClick={() => toggle(rel.id)} style={{ cursor: 'pointer' }}><td><strong>{rel.pm_releasename}</strong><br /><small>{rel.pm_description?.substring(0, 60)}</small></td><td><span className={`badge ${badgeClass(rel.pm_status)}`}>{rel.pm_status}</span></td><td>{rel.pm_releasedate || '—'}</td><td>{rel.pm_cutoffdate || '—'}</td><td>{ri.length} items ({approved} approved)</td><td className="actions-cell" onClick={e => e.stopPropagation()}>
              {rel.pm_status === 'Draft' && <button className="btn-sm btn-link" onClick={() => openRelease(rel.id)}>🔓 Open</button>}
              {rel.pm_status === 'Open' && <><button className="btn-sm btn-link" onClick={() => registerStory(rel.id)}>➕ Register</button><button className="btn-sm btn-link" onClick={() => reviewRelease(rel.id)}>🔍 Review</button></>}
              {rel.pm_status === 'In Review' && <button className="btn-sm btn-edit" onClick={() => completeRelease(rel.id)}>✅ Complete</button>}
              <button className="btn-sm btn-edit" onClick={() => { const rec = DS.getById('pm_release', rel.id); const rsConfigs = DS.query('pm_config', { pm_type: 'release_status' }); showModal({ title: 'Edit Release', fields: getFields('pm_release').filter(f => f.name !== 'pm_status'), data: rec, extraContent: (<div><label>Status</label><select id="relStatus" data-extra defaultValue={rec.pm_status || ''}>{rsConfigs.map((c: any) => <option key={c.id} value={c.pm_name}>{c.pm_name}</option>)}</select></div>), onSave: (fd) => { fd.pm_status = (document.getElementById('relStatus') as HTMLSelectElement)?.value || ''; DS.update('pm_release', rel.id, fd); reload(); showToast('Release updated!') }, onDelete: () => { DS.delete('pm_release', rel.id); reload(); showToast('Release deleted!') } }) }}>✏️ Edit</button>
              <button className="btn-sm btn-delete" onClick={() => { if (confirm('Delete this release?')) { DS.delete('pm_release', rel.id); reload(); showToast('Release deleted!') } }}>🗑️</button>
            </td></tr>
            {isExp && (() => {
              const { groups, unlinked } = groupByEpic(ri)
              const epicEntries = Object.entries(groups)
              return (<>
                {epicEntries.map(([epicId, group]: [string, any[]]) => {
                  const epic = epics.find((e: any) => e.id === epicId)
                  const signedCount = group.filter((g: any) => g.pm_signoff_status === 'Approved').length
                  const isEpicExp = expandedEpics.has(epicId)
                  return (<Fragment key={epicId}>
                    <tr className="project-epic-row" onClick={(e) => { e.stopPropagation(); toggleEpic(epicId) }} style={{ cursor: 'pointer' }}>
                      <td colSpan={6}><div className="project-epic-item"><span style={{ fontWeight: 600, color: 'var(--primary)' }}>⚡ {epic?.pm_title || '—'}</span><span className="project-epic-meta">{group.length} stories · {signedCount}/{group.length} signed off</span>{epic?.pm_ragstatus && <span className={`badge ${badgeClass(epic.pm_ragstatus)}`}>{epic.pm_ragstatus}</span>}<span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isEpicExp ? '▲' : '▼'}</span></div></td>
                    </tr>
                    {isEpicExp && group.map((g: any) => (
                      <tr key={g.id} className="project-epic-row"><td colSpan={6}><div className="project-epic-item" style={{ paddingLeft: '30px' }}><span className={`badge ${badgeClass(g.pm_signoff_status)}`}>{g.pm_signoff_status}</span><span className="project-epic-name" style={{ fontSize: '0.85rem' }}>{g.story?.pm_detail?.substring(0, 60) || '—'}</span><span className="project-epic-meta" style={{ fontSize: '0.78rem' }}>By: {g.pm_registered_by || '—'}{g.pm_tool ? ` | ${g.pm_tool}` : ''}{g.pm_signoff_by ? ` | Signoff: ${g.pm_signoff_by}` : ''}</span>{g.pm_signoff_status === 'Pending' && <button className="btn-sm btn-edit" onClick={(e) => { e.stopPropagation(); showSignoffModal(g.id) }}>✍️ Signoff</button>}</div></td></tr>
                    ))}
                  </Fragment>)
                })}
                {unlinked.map((g: any) => (
                  <tr key={g.id} className="project-epic-row"><td colSpan={6}><div className="project-epic-item"><span className={`badge ${badgeClass(g.pm_signoff_status)}`}>{g.pm_signoff_status}</span><span className="project-epic-name" style={{ fontSize: '0.85rem' }}>{g.story?.pm_detail?.substring(0, 60) || '—'}</span><span className="project-epic-meta" style={{ fontSize: '0.78rem' }}>By: {g.pm_registered_by || '—'}{g.pm_tool ? ` | ${g.pm_tool}` : ''}</span>{g.pm_signoff_status === 'Pending' && <button className="btn-sm btn-edit" onClick={(e) => { e.stopPropagation(); showSignoffModal(g.id) }}>✍️ Signoff</button>}</div></td></tr>
                ))}
              </>)
            })()}
            {isExp && ri.length === 0 && <tr className="project-epic-row"><td colSpan={6} style={{ padding: '10px 14px 10px 44px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No items registered</td></tr>}
          </Fragment>)
        })}</tbody></table>
      )}
    </div>
  )
}
