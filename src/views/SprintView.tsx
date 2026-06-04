import { useState, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useNavigation } from '../context/NavigationContext'
import { StatsCards } from '../components/StatsCards'

export function SprintView() {
  const [key] = useState(0)
  const { navigate } = useNavigation()
  const releases = useMemo(() => DS.getAll('pm_release'), [key])
  const items = useMemo(() => DS.getAll('pm_releaseitem'), [key])
  const stories = useMemo(() => DS.getAll('pm_userstory'), [key])
  const epics = useMemo(() => DS.getAll('pm_epic'), [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])

  const activeReleases = releases.filter((r: any) => ['Open', 'In Review'].includes(r.pm_status))
  const totalStories = items.length

  const productReleases = useMemo(() => {
    const map: Record<string, { product: any; releases: any[] }> = {}
    releases.forEach((rel: any) => {
      const ri = items.filter((i: any) => i.pm_release === rel.id)
      const productIds = new Set<string>()
      ri.forEach((i: any) => {
        const story = stories.find((s: any) => s.id === i.pm_userstory)
        const epic = story ? epics.find((e: any) => e.id === story.pm_epicid) : null
        const proj = epic ? projects.find((p: any) => p.id === epic.pm_projectname) : null
        if (proj) productIds.add(proj.pm_productname)
      })
      const entry = {
        ...rel, ri, storyCount: ri.length,
        signed: ri.filter((i: any) => i.pm_signoff_status === 'Approved').length,
        pending: ri.filter((i: any) => i.pm_signoff_status === 'Pending').length
      }
      if (productIds.size === 0) {
        if (!map['__unlinked__']) map['__unlinked__'] = { product: { pm_name: 'Unlinked' }, releases: [] }
        map['__unlinked__'].releases.push(entry)
      } else {
        productIds.forEach((pid: string) => {
          if (!map[pid]) { const pr = products.find((p: any) => p.id === pid); map[pid] = { product: pr || { pm_name: 'Unknown' }, releases: [] } }
          if (!map[pid].releases.find((r: any) => r.id === rel.id)) map[pid].releases.push(entry)
        })
      }
    })
    return Object.values(map).sort((a, b) => a.product.pm_name?.localeCompare(b.product.pm_name || ''))
  }, [releases, items, stories, epics, projects, products])

  return (
    <div>
      <div className="dashboard-header"><h2>📋 Sprint Board</h2></div>
      <StatsCards stats={[
        { value: releases.length, label: 'Total Sprints' },
        { value: activeReleases.length, label: 'Active' },
        { value: totalStories, label: 'Stories' }
      ]} />

      {productReleases.map(({ product, releases: rels }: any) => (
        <div key={product.id || product.pm_name} style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px',
            paddingBottom: '8px', borderBottom: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            📦 {product.pm_name}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {rels.length} sprint{rels.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {rels.map((rel: any) => (
              <div key={rel.id}
                onClick={() => navigate('releases', rel.id)}
                style={{
                  flex: '1 1 260px', maxWidth: '420px', minWidth: '240px',
                  padding: '16px', borderRadius: 'var(--radius)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                  transition: 'box-shadow 0.15s, transform 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = '' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{rel.pm_releasename}</strong>
                  <span className={`badge ${badgeClass(rel.pm_status)}`} style={{ fontSize: '0.7rem' }}>{rel.pm_status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {rel.pm_releasedate && <div>📅 Release: {rel.pm_releasedate}</div>}
                  {rel.pm_cutoffdate && <div>✂️ Cutoff: {rel.pm_cutoffdate}</div>}
                  {rel.pm_description && <div style={{ marginTop: '4px' }}>{rel.pm_description}</div>}
                </div>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span title="Total stories">{rel.storyCount} stories</span>
                  <span title="Approved" style={{ color: 'var(--green)' }}>{rel.signed} approved</span>
                  {rel.pending > 0 && <span title="Pending signoff" style={{ color: 'var(--amber)' }}>{rel.pending} pending</span>}
                </div>
                {rel.pending > 0 && (
                  <div style={{ marginTop: '10px', width: '100%', height: '4px', borderRadius: '2px', background: 'var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${rel.storyCount > 0 ? (rel.signed / rel.storyCount * 100) : 0}%`, background: 'var(--green)', borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {productReleases.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No sprints yet</p>
          <p style={{ fontSize: '0.85rem' }}>Create sprints from the 🚀 Releases tab.</p>
        </div>
      )}
    </div>
  )
}
