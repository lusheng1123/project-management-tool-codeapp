// Re-exports for test compatibility — keeps test imports
// from pulling the full App entry chunk.

export { DS, genId } from './data'
export { MODELS, getFields, getModelName } from './models'
export { seedAllIfNeeded } from './seed'
export { badgeClass } from './context/UIContext'
