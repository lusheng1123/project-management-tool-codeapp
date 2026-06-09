// Re-export from the new data module structure for backward compatibility.
// All existing views import { DS } from '../data' — this still works.
export { DS, genId } from './data/index'
