
const STAGES = ['Onboarding', 'Development Phase 1', 'Development Phase 2', 'Review', 'Live']
const STAGE_COLORS: Record<string, string> = { 'Onboarding': 'pipeline-amber', 'Development Phase 1': 'pipeline-blue', 'Development Phase 2': 'pipeline-blue', 'Review': 'pipeline-amber', 'Live': 'pipeline-green' }

export function PipelineBoard({ projects, onUpdate }: { projects: any[]; onUpdate: (id: string, stage: string) => void }) {
  const grouped = STAGES.map(stage => ({ stage, projects: projects.filter((p: any) => p.pm_status === stage), count: projects.filter((p: any) => p.pm_status === stage).length }))
  return (<div className="pipeline-board">{grouped.map(({ stage, projects: sp, count }) => (<div key={stage} className="pipeline-column"><div className={`pipeline-column-header ${STAGE_COLORS[stage]}`}><span>{stage}</span><span className="pipeline-count">{count}</span></div><div className="pipeline-column-body">{sp.length === 0 ? <div className="pipeline-card-empty">—</div> : sp.map((p: any) => (<div key={p.id} className={`pipeline-card ${STAGE_COLORS[stage]}`} onClick={() => onUpdate(p.id, stage)}><div className="pipeline-card-name">{p.pm_name}</div><div className="pipeline-card-meta"><span>{p.pm_overallcompletion || 0}% done</span><span>{p.pm_startdate || '?'} → {p.pm_targetdeliverydate || '?'}</span></div>{p.pm_priority && <div className="pipeline-card-priority">⚡ {p.pm_priority}</div>}</div>))}</div></div>))}</div>)
}





