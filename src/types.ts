export type FieldDef = {
  name: string; label: string; type?: string; required?: boolean
  choices?: string[]; target?: string; step?: string; min?: number; max?: number
}
export type Model = { name: string; fields: FieldDef[]; isLinkingTable?: boolean }
export type Record_ = Record<string, any>
