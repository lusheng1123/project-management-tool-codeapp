import React, { useState, useEffect, useRef, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import type { FieldDef, Record_ } from '../types'

interface ModalConfig {
  title: string; fields?: FieldDef[]; data?: Record_; onSave: (data: Record_) => void | Promise<void>
  onDelete?: () => void | Promise<void>; extraContent?: React.ReactNode; wide?: boolean; onAfterOpen?: () => void
}

export const UIContext = createContext<{ showToast: (m: string, t?: string) => void; showModal: (c: ModalConfig) => void; closeModal: () => void }>(
  { showToast: () => {}, showModal: () => {}, closeModal: () => {} })
export function useUI() { return useContext(UIContext) }

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null)
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null)
  const toastRef = useRef<{ message: string; type: string } | null>(null)
  const showToast = (message: string, type = 'success') => { toastRef.current = { message, type }; setToast({ message, type }); setTimeout(() => { if (toastRef.current?.message === message) { toastRef.current = null; setToast(null) } }, 3000) }
  const ctx = { showToast, showModal: setModalConfig, closeModal: () => setModalConfig(null) }
  return (<UIContext.Provider value={ctx}>{children}{toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}{modalConfig && createPortal(<ModalContent config={modalConfig} onClose={() => setModalConfig(null)} />, document.body)}</UIContext.Provider>)
}

function ModalContent({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  const [formData, setFormData] = useState<Record_>({})
  const [saving, setSaving] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => { const init: Record_ = {}; if (config.fields) config.fields.forEach(f => { init[f.name] = config.data?.[f.name] ?? '' }); setFormData(init); const t = setTimeout(() => config.onAfterOpen?.(), 50); return () => clearTimeout(t) }, [config])
  const update = (name: string, value: any) => setFormData(p => ({ ...p, [name]: value }))
  const handleSave = async () => { setSaving(true); try { const extra: Record_ = {}; if (formRef.current) { formRef.current.querySelectorAll('[data-extra]').forEach(el => { const inp = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; extra[inp.name || inp.id] = inp.value }) }; await config.onSave({ ...formData, ...extra }) } finally { setSaving(false); onClose() } }
  const handleDelete = async () => { if (!config.onDelete) return; if (!confirm('Delete this record?')) return; await config.onDelete(); onClose() }
  const renderField = (f: FieldDef) => { const val = formData[f.name] ?? ''; if (f.type === 'choice') return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><select value={val} onChange={e => update(f.name, e.target.value)}><option value="">--</option>{f.choices?.map(c => <option key={c} value={c}>{c}</option>)}</select></div>); if (f.type === 'multiline') return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><textarea rows={3} value={val} onChange={e => update(f.name, e.target.value)} /></div>); if (f.type === 'date') return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><input type="date" value={val} onChange={e => update(f.name, e.target.value)} /></div>); if (f.type === 'number') return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><input type="number" value={val} step={f.step || '1'} min={f.min ?? ''} max={f.max ?? ''} onChange={e => update(f.name, e.target.value)} /></div>); if (f.type === 'email') return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><input type="email" value={val} onChange={e => update(f.name, e.target.value)} /></div>); return (<div key={f.name}><label>{f.label}{f.required ? ' *' : ''}</label><input type="text" value={val} onChange={e => update(f.name, e.target.value)} /></div>) }
  return (<div className="modal-overlay" onClick={onClose}><div className={`modal${config.wide ? ' modal-wide' : ''}`} onClick={e => e.stopPropagation()}><div className="modal-header"><h3>{config.title}</h3><button className="modal-close" onClick={onClose}>×</button></div><div className="modal-body"><form id="modalForm" ref={formRef} onSubmit={e => e.preventDefault()}>{config.fields?.map(renderField)}{config.extraContent}</form></div><div className="modal-footer">{config.onDelete && <button type="button" className="btn btn-delete" onClick={handleDelete}>🗑️ Delete</button>}<button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button><button type="button" className="btn btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save'}</button></div></div></div>)
}

export function badgeClass(val: string | undefined | null): string { const v = (val ?? '').toLowerCase(); if (['active', 'approved', 'completed', 'linked', 'new', 'live', 'g', 'submitted', 'converted'].includes(v)) return 'badge-green'; if (['in progress', 'prioritized', 'pending', 'on leave', 'onboarding', 'review', 'a', 'triaging'].includes(v)) return 'badge-amber'; if (['inactive', 'rejected', 'on hold', 'critical', 'r', 'development phase 1', 'development phase 2', 'assessed'].includes(v)) return 'badge-blue'; return 'badge-gray' }
