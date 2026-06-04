import { useState, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useNavigation } from '../context/NavigationContext'
import { StatsCards } from '../components/StatsCards'

export function DashboardView() {
  const [key] = useState(0)
  const { navigate } = useNavigation()
  const demands = useMemo(() => DS.getAll('pm_demand'), [key])
  const risks = useMemo(() => DS.getAll('pm_risk'), [key])
  const deps = useMemo(() => DS.getAll('pm_dependency'), [key])
  const releases = useMemo(() => DS.getAll('pm_release'), [key])
  const releaseItems = useMemo(() => DS.getAll('pm_releaseitem'), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const vsConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'value_stream' }), [key])

  const pendingDemands = demands.filter((d: any) => !['Converted', 'Rejected'].includes(d.pm_status))
  const pendingSignoffs = releaseItems.filter((ri: any) => ri.pm_signoff_status === 'Pending')
  const activeReleases = releases.filter((r: any) => ['Open', 'In Review'].includes(r.pm_status))
  const getProduct = (id: string) => products.find((p: any) => p.id === id)
  const getVS = (id: string) => vsConfigs.find((c: any) => c.id === id)?.pm_name

  const actionLabel: Record<string, string> = {
    Submitted: '🔍 Triage',
    Triaging: '📋 Assess',
    Assessed: '✅ Approve',
    Approved: '🔄 Convert'
  }
  const productSummary = products.map((p: any) => ({
    product: p,
    vs: getVS(p.pm_valuestream),
    demandCount: demands.filter((d: any) => d.pm_product === p.id).length,
    riskCount: risks.filter((r: any) => r.pm_productname === p.id).length,
    depCount: deps.filter((d: any) => d.pm_productname === p.id).length
  })).filter((s: any) => s.demandCount + s.riskCount + s.depCount > 0)

  return (
    <div>
      <div className="dashboard-header"><h2>📊 Dashboard</h2></div>
      <StatsCards stats={[
        { value: demands.length, label: 'Total Demands' },
        { value: pendingDemands.length, label: 'Active Demands' },
        { value: risks.length, label: 'Open Risks' },
        { value: pendingSignoffs.length, label: 'Pending Signoffs' },
        { value: activeReleases.length, label: 'Active Releases' }
      ]} />

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        {/* Left: Pending Action */}
        <div style={{ flex: '1 1 0', minWidth: '340px' }}>
          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: 600 }}>📥 Action Items</h3>
            {pendingDemands.length === 0 && pendingSignoffs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nothing pending — all clear.</p>
            )}
            {pendingDemands.map((dem: any) => {
              const prod = getProduct(dem.pm_product)
              return (
                <div key={dem.id} onClick={() => navigate('demand', dem.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: 'var(--border-light)', border: '1px solid var(--border)', fontSize: '0.85rem',
                  transition: 'background 0.15s'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dem.pm_title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Demand · {prod?.pm_name || '—'} · <span className={`badge ${badgeClass(dem.pm_status)}`} style={{ fontSize: '0.7rem' }}>{dem.pm_status}</span>
                    </div>
                  </div>
                  {actionLabel[dem.pm_status] && (
                    <span style={{
                      marginLeft: '10px', whiteSpace: 'nowrap', fontSize: '0.8rem',
                      color: 'var(--primary)', fontWeight: 600
                    }}>
                      → {actionLabel[dem.pm_status]}
                    </span>
                  )}
                </div>
              )
            })}
            {pendingSignoffs.map((ri: any) => {
              const rel = releases.find((r: any) => r.id === ri.pm_release)
              return (
                <div key={ri.id} onClick={() => navigate('releases', ri.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: 'var(--amber-bg)', border: '1px solid var(--amber)', fontSize: '0.85rem',
                  transition: 'background 0.15s'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rel?.pm_releasename || 'Unknown Release'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Story #{ri.pm_userstory?.substring(0, 8) || '—'} · Signoff pending · By: {ri.pm_registered_by || '—'}
                    </div>
                  </div>
                  <span style={{
                    marginLeft: '10px', whiteSpace: 'nowrap', fontSize: '0.8rem',
                    color: 'var(--amber)', fontWeight: 600
                  }}>
                    → ✍️ Signoff
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Product Overview + Releases */}
        <div style={{ flex: '1 1 0', minWidth: '340px' }}>
          <div className="card" style={{ padding: '18px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: 600 }}>📦 Product Overview</h3>
            {productSummary.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>VS</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>📥</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>⚠️</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>🔗</th>
                  </tr>
                </thead>
                <tbody>
                  {productSummary.map((s: any) => (
                      <tr key={s.product.id} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => navigate('products', s.product.id)}>
                        <td style={{ padding: '8px', fontWeight: 500 }}>{s.product.pm_name}</td>
                      <td style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.vs || '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); navigate('demand') }}><span className={`badge ${s.demandCount > 0 ? 'badge-green' : 'badge-gray'}`}>{s.demandCount}</span></td>
                      <td style={{ padding: '8px', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); navigate('risks') }}><span className={`badge ${s.riskCount > 0 ? 'badge-amber' : 'badge-gray'}`}>{s.riskCount}</span></td>
                      <td style={{ padding: '8px', textAlign: 'center' }} onClick={(e) => { e.stopPropagation(); navigate('dependencies') }}><span className={`badge ${s.depCount > 0 ? 'badge-blue' : 'badge-gray'}`}>{s.depCount}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card" style={{ padding: '18px' }}>
            <h3 style={{ marginBottom: '14px', fontSize: '1rem', fontWeight: 600 }}>🚀 Releases</h3>
            {releases.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No releases yet.</p>
            ) : (
              <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)' }}>Release</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>Items</th>
                    <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text-muted)' }}>Signoffs</th>
                  </tr>
                </thead>
                <tbody>
                  {releases.map((rel: any) => {
                    const items = releaseItems.filter((ri: any) => ri.pm_release === rel.id)
                    const signed = items.filter((ri: any) => ri.pm_signoff_status === 'Approved').length
                    return (
                      <tr key={rel.id} style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                        onClick={() => navigate('releases', rel.id)}>
                        <td style={{ padding: '8px', fontWeight: 500 }}>{rel.pm_releasename}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}><span className={`badge ${badgeClass(rel.pm_status)}`}>{rel.pm_status}</span></td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{items.length}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {items.length > 0
                            ? <span>{signed}/{items.length} approved</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
