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
  const products = useMemo(() => DS.getAll('pm_product'), [key])
  const demands = useMemo(() => DS.getAll('pm_demand'), [key])
  const projects = useMemo(() => DS.getAll('pm_project'), [key])
  const risks = useMemo(() => DS.getAll('pm_risk'), [key])
  const deps = useMemo(() => DS.getAll('pm_dependency'), [key])

  // Get VSO's assigned value streams
  const vsoUser = useMemo(() => {
    if (!hasRole('Value Stream Owner')) return null
    if (hasRole('Admin')) return null // Admin sees everything
    return DS.getAll('pm_user').find((u: any) => u.pm_role === 'Value Stream Owner' && u.pm_valuestream)
  }, [roles])

  const allowedVSIds = useMemo(() => {
    if (hasRole('Admin') || !vsoUser) return null // null = show all
    return new Set(vsoUser.pm_valuestream?.split(',').map((s: string) => s.trim()).filter(Boolean) || [])
  }, [vsoUser])

  const showVS = (vsId: string) => !allowedVSIds || allowedVSIds.has(vsId)

  const activeDemands = demands.filter((d: any) => d.pm_status !== 'Rejected' && !(d.pm_status === 'Approved' && d.pm_converted_to))

  const vsProducts = useMemo(() => {
    return vsConfigs.filter((vs: any) => showVS(vs.id)).map((vs: any) => {
      const prods = products.filter((p: any) => p.pm_valuestream === vs.id)
      const enriched = prods.map((p: any) => ({
        ...p,
        demandCount: activeDemands.filter((d: any) => d.pm_product === p.id).length,
        projectCount: projects.filter((pr: any) => pr.pm_productname === p.id).length,
        riskCount: risks.filter((r: any) => r.pm_productname === p.id).length,
        depCount: deps.filter((d: any) => d.pm_productname === p.id).length
      }))
      return { vs, products: enriched }
    }).filter((s: any) => s.products.length > 0)
  }, [vsConfigs, products, activeDemands, projects, risks, deps])

  const totalProducts = vsProducts.reduce((s: number, vs: any) => s + vs.products.length, 0)

  return (
    <div>
      <div className="dashboard-header"><h2>📊 Portfolio</h2></div>
      <StatsCards stats={[
        { value: vsProducts.length, label: 'Value Streams' },
        { value: totalProducts, label: 'Products' },
        { value: activeDemands.length, label: 'Active Demands' }
      ]} />

      {vsProducts.map(({ vs, products: prodList }: any) => (
        <div key={vs.id} style={{ marginBottom: '28px' }}>
          <h3 style={{
            fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px',
            paddingBottom: '8px', borderBottom: '2px solid var(--primary)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            📈 {vs.pm_name}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {vs.pm_description}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              {prodList.length} product{prodList.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {prodList.map((p: any) => (
              <div key={p.id}
                onClick={() => navigate('products', p.id)}
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
                  <strong style={{ fontSize: '0.95rem' }}>📦 {p.pm_name}</strong>
                  <span className={`badge ${badgeClass(p.pm_governancestatus)}`} style={{ fontSize: '0.65rem' }}>{p.pm_governancestatus || 'N/A'}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                  {p.pm_journeyname && <div>{p.pm_journeyname}</div>}
                  {p.pm_contact && <div>Contact: {p.pm_contact}</div>}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                  <span title="Active demands">
                    📥 <strong style={{ color: p.demandCount > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{p.demandCount}</strong> demands
                  </span>
                  <span title="Projects">
                    📁 <strong style={{ color: 'var(--text-muted)' }}>{p.projectCount}</strong> projects
                  </span>
                  <span title="Risks">
                    ⚠️ <strong style={{ color: p.riskCount > 0 ? 'var(--amber)' : 'var(--text-muted)' }}>{p.riskCount}</strong>
                  </span>
                  <span title="Dependencies">
                    🔗 <strong style={{ color: p.depCount > 0 ? 'var(--blue)' : 'var(--text-muted)' }}>{p.depCount}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {vsProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No value streams found</p>
          <p style={{ fontSize: '0.85rem' }}>Assign value streams to products from the 📦 Products tab.</p>
        </div>
      )}
    </div>
  )
}
