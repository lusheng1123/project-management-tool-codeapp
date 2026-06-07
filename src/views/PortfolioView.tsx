import { useState, useMemo } from 'react'
import { DS } from '../data'
import { badgeClass } from '../context/UIContext'
import { useRole } from '../context/RoleContext'
import { useNavigation } from '../context/NavigationContext'
import { StatsCards } from '../components/StatsCards'

export function PortfolioView() {
  const [key] = useState(0)
  const { roles, hasRole } = useRole()
  const { navigate } = useNavigation()
  const vsConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'value_stream' }), [key])
  const flowConfigs = useMemo(() => DS.query('pm_config', { pm_type: 'demand_flow' }), [key])
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const demands = useMemo(() => DS.getAll('pm_demand'), [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const epics = useMemo(() => DS.getAll('pm_epic'), [key])
  const userstories = useMemo(() => DS.getAll('pm_userstory'), [key])
  const risks = useMemo(() => DS.getAll('pm_risk'), [key])
  const deps = useMemo(() => DS.getAll('pm_dependency'), [key])
  const releases = useMemo(() => DS.getAll('pm_release'), [key])
  const items = useMemo(() => DS.getAll('pm_releaseitem'), [key])
  const assignments = useMemo(() => DS.getAll('pm_assignment'), [key])
  const resources = useMemo(() => DS.getAll('pm_resource'), [key])

  const vsoUser = useMemo(() => {
    if (!hasRole('Value Stream Owner')) return null
    if (hasRole('Admin') || hasRole('Value Stream PMO')) return null
    return DS.getAll('pm_user').find((u: any) => u.pm_role === 'Value Stream Owner' && u.pm_valuestream)
  }, [roles])

  const allowedVSIds = useMemo(() => {
    if (hasRole('Admin') || !vsoUser) return null
    return new Set(vsoUser.pm_valuestream?.split(',').map((s: string) => s.trim()).filter(Boolean) || [])
  }, [vsoUser])

  const showVS = (vsId: string) => !allowedVSIds || allowedVSIds.has(vsId)

  const activeDemands = demands.filter((d: any) => d.pm_status !== 'Rejected' && !(d.pm_status === 'Approved' && d.pm_converted_to))

  const getFlowSteps = (vsId: string) => {
    const vs = vsConfigs.find((c: any) => c.id === vsId)
    if (!vs) return '—'
    return flowConfigs.filter((c: any) => c.pm_name.startsWith(vs.pm_name + ':')).length + ' steps'
  }

  const getSPForProduct = (prodId: string) => {
    let totalSP = 0, doneSP = 0
    const prods = projects.filter((pr: any) => pr.pm_productname === prodId)
    prods.forEach((pr: any) => {
      const eList = epics.filter((e: any) => e.pm_projectname === pr.id)
      eList.forEach((e: any) => {
        const stories = userstories.filter((s: any) => s.pm_epicid === e.id)
        totalSP += stories.reduce((s: number, st: any) => s + (st.pm_storypoint || 0), 0)
        if (e.pm_ragstatus === 'G') doneSP += stories.reduce((s: number, st: any) => s + (st.pm_storypoint || 0), 0)
      })
    })
    return { totalSP, doneSP }
  }

  const getSprintsForProduct = (prodId: string) => {
    const names: string[] = []
    releases.forEach((rel: any) => {
      const ri = items.filter((i: any) => i.pm_release === rel.id)
      const match = ri.some((i: any) => {
        const s = userstories.find((st: any) => st.id === i.pm_userstory)
        const e = s ? epics.find((ep: any) => ep.id === s.pm_epicid) : null
        const pr = e ? projects.find((pj: any) => pj.id === e.pm_projectname) : null
        return pr && pr.pm_productname === prodId
      })
      if (match && !names.includes(rel.pm_releasename)) names.push(rel.pm_releasename)
    })
    return names
  }

  const getTeamsForProduct = (prodId: string) => {
    const teams = new Set<string>()
    const prods = projects.filter((pr: any) => pr.pm_productname === prodId)
    prods.forEach((pr: any) => {
      epics.filter((e: any) => e.pm_projectname === pr.id).forEach((e: any) => {
        assignments.filter((a: any) => a.pm_epic === e.id).forEach((a: any) => {
          const res = resources.find((r: any) => r.id === a.pm_resource)
          if (res?.pm_team) teams.add(res.pm_team)
        })
      })
    })
    return [...teams]
  }

  const vsProducts = useMemo(() => {
    return vsConfigs.filter((vs: any) => showVS(vs.id)).map((vs: any) => {
      const prods = products.filter((p: any) => p.pm_valuestream === vs.id)
      const enriched = prods.map((p: any) => {
        const prodDemands = activeDemands.filter((d: any) => d.pm_product === p.id)
        const sp = getSPForProduct(p.id)
        const teamList = getTeamsForProduct(p.id)
        const sprintNames = getSprintsForProduct(p.id)
        return {
          ...p,
          demandCount: prodDemands.length,
          demandBreakdown: prodDemands.reduce((acc: Record<string, number>, d: any) => { acc[d.pm_status] = (acc[d.pm_status] || 0) + 1; return acc }, {}),
          projectList: projects.filter((pr: any) => pr.pm_productname === p.id),
          riskCount: risks.filter((r: any) => r.pm_productname === p.id).length,
          depCount: deps.filter((d: any) => d.pm_productname === p.id).length,
          totalSP: sp.totalSP, doneSP: sp.doneSP,
          teams: teamList,
          activeSprints: sprintNames.filter(name => {
            const rel = releases.find((r: any) => r.pm_releasename === name)
            return rel && ['Open', 'In Review'].includes(rel.pm_status)
          }),
          totalSprints: sprintNames.length
        }
      })
      return { vs, flow: getFlowSteps(vs.id), products: enriched }
    }).filter((s: any) => s.products.length > 0)
  }, [vsConfigs, products, activeDemands, projects, epics, userstories, risks, deps, releases, items, assignments, resources])

  const totalProducts = vsProducts.reduce((s: number, vs: any) => s + vs.products.length, 0)

  return (
    <div>
      <div className="dashboard-header"><h2>📈 Portfolio</h2></div>
      <StatsCards stats={[
        { value: vsProducts.length, label: 'Value Streams' },
        { value: totalProducts, label: 'Products' },
        { value: activeDemands.length, label: 'Active Demands' },
        { value: releases.filter((r: any) => ['Open', 'In Review'].includes(r.pm_status)).length, label: 'Active Sprints' }
      ]} />

      {vsProducts.map(({ vs, flow, products: prodList }: any) => (
        <div key={vs.id} style={{ marginBottom: '28px' }}>
          <h3 style={{
            fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px',
            paddingBottom: '8px', borderBottom: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'
          }}>
            📈 {vs.pm_name}
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{flow}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {vs.pm_description} · {prodList.length} product{prodList.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {prodList.map((p: any) => (
              <div key={p.id}
                onClick={() => navigate('products', p.id)}
                style={{
                  flex: '1 1 280px', maxWidth: '450px', minWidth: '260px',
                  padding: '18px', borderRadius: 'var(--radius)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                  transition: 'box-shadow 0.15s, transform 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = '' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>📦 {p.pm_name}</strong>
                  <span className={`badge ${badgeClass(p.pm_governancestatus)}`} style={{ fontSize: '0.65rem' }}>{p.pm_governancestatus || 'N/A'}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {p.pm_journeyname && <div>{p.pm_journeyname}</div>}
                  {p.pm_contact && <div>Contact: {p.pm_contact}</div>}
                </div>

                {/* Metrics grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginBottom: '8px' }}>
                  <div>📥 Demands: <strong>{p.demandCount}</strong></div>
                  <div>📁 Projects: <strong>{p.projectList.length}</strong></div>
                  <div>⚠️ Risks: <strong style={{ color: p.riskCount > 0 ? 'var(--amber)' : 'inherit' }}>{p.riskCount}</strong></div>
                  <div>🔗 Deps: <strong style={{ color: p.depCount > 0 ? 'var(--blue)' : 'inherit' }}>{p.depCount}</strong></div>
                  <div>📊 SP: <strong>{p.doneSP}/{p.totalSP}</strong></div>
                  <div>🚀 Sprints: <strong style={{ color: p.activeSprints.length > 0 ? 'var(--primary)' : 'inherit' }}>{p.activeSprints.length}</strong></div>
                </div>

                {/* Demand status breakdown */}
                {Object.keys(p.demandBreakdown).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                    {Object.entries(p.demandBreakdown).map(([status, count]: [string, any]) => (
                      <span key={status} className={`badge ${badgeClass(status)}`} style={{ fontSize: '0.6rem' }}>{status} {count}</span>
                    ))}
                  </div>
                )}

                {/* Teams */}
                {p.teams.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    👥 {p.teams.join(', ')}
                  </div>
                )}

                {/* SP progress bar */}
                {p.totalSP > 0 && (
                  <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border-light)', overflow: 'hidden', marginBottom: p.activeSprints.length > 0 ? '6px' : 0 }}>
                    <div style={{ height: '100%', width: `${p.doneSP / p.totalSP * 100}%`, background: 'var(--green)', borderRadius: '2px' }} />
                  </div>
                )}

                {/* Active sprints */}
                {p.activeSprints.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--primary-dark)', background: 'var(--primary-bg)', padding: '4px 8px', borderRadius: '4px' }}>
                    {p.activeSprints.map((n: string) => n).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {vsProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No value streams visible</p>
          <p style={{ fontSize: '0.85rem' }}>Check your role assignment or add products to value streams.</p>
        </div>
      )}
    </div>
  )
}
