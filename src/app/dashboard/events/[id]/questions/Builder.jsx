"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

const FIELD_TEMPLATES = [
  { type: 'text', label: 'Short Text', name: 'text_field', required: false },
  { type: 'email', label: 'Email', name: 'email_field', required: false },
  { type: 'tel', label: 'Phone', name: 'phone_field', required: false },
  { type: 'select', label: 'Select', name: 'select_field', required: false, options: ['Option 1','Option 2'] },
  { type: 'checkbox', label: 'Checkbox', name: 'checkbox_field', required: false },
]

export default function Builder ({ initialSchema }) {
  const [fields, setFields] = useState(() => Array.isArray(initialSchema) ? initialSchema : [])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const hiddenInputRef = useRef(null)

  // Keep hidden input in sync so server action can read it
  useEffect(() => {
    hiddenInputRef.current = document.getElementById('schema_json')
  }, [])
  useEffect(() => {
    if (hiddenInputRef.current) hiddenInputRef.current.value = JSON.stringify(fields)
  }, [fields])

  const selected = fields[selectedIdx] || null

  const addField = (tpl) => {
    const base = { ...tpl }
    base.name = uniqueName(fields, base.name)
    setFields(prev => [...prev, base])
    setSelectedIdx(fields.length)
  }
  const removeField = (idx) => {
    setFields(prev => prev.filter((_, i) => i !== idx))
    setSelectedIdx(0)
  }
  const move = (idx, dir) => {
    const to = idx + dir
    if (to < 0 || to >= fields.length) return
    const next = fields.slice()
    const [item] = next.splice(idx, 1)
    next.splice(to, 0, item)
    setFields(next)
    setSelectedIdx(to)
  }
  const updateSelected = (patch) => {
    if (selectedIdx == null || !fields[selectedIdx]) return
    const next = fields.slice()
    next[selectedIdx] = { ...next[selectedIdx], ...patch }
    // Normalize types
    if (patch.type === 'select' && !next[selectedIdx].options) next[selectedIdx].options = ['Option 1','Option 2']
    if (patch.type !== 'select') delete next[selectedIdx].options
    setFields(next)
  }

  return (
    <div className="row g-3">
      <div className="col-lg-4">
        <div className="border rounded p-3 h-100">
          <h2 className="h6 text-uppercase text-muted mb-3">Field Types</h2>
          <div className="d-grid gap-2">
            {FIELD_TEMPLATES.map((tpl, i) => (
              <button type="button" key={i} className="btn btn-outline-secondary" onClick={() => addField(tpl)}>
                + {tpl.label}
              </button>
            ))}
          </div>
          <hr />
          <p className="small text-muted mb-0">
            Drag-and-drop is simulated with Move Up/Down. You can add, edit, reorder, and delete fields.
          </p>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="border rounded p-3 h-100">
          <h2 className="h6 text-uppercase text-muted mb-3">Form Preview</h2>
          {!fields.length && <div className="alert alert-info">No fields yet. Add from the left.</div>}
          <ul className="list-group">
            {fields.map((f, i) => (
              <li key={i} className={`list-group-item d-flex align-items-center ${i===selectedIdx?'active':''}`} style={{cursor:'pointer'}} onClick={() => setSelectedIdx(i)}>
                <div className="flex-grow-1">
                  <strong>{f.label || f.name}</strong>
                  <small className="ms-2">[{f.type}{f.required?' • required':''}]</small>
                </div>
                <div className="btn-group btn-group-sm">
                  <button type="button" className="btn btn-light" onClick={(e)=>{e.stopPropagation();move(i,-1)}}>↑</button>
                  <button type="button" className="btn btn-light" onClick={(e)=>{e.stopPropagation();move(i,1)}}>↓</button>
                  <button type="button" className="btn btn-danger" onClick={(e)=>{e.stopPropagation();removeField(i)}}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="border rounded p-3 h-100">
          <h2 className="h6 text-uppercase text-muted mb-3">Field Settings</h2>
          {!selected ? (
            <div className="text-muted">Select a field to edit its settings.</div>
          ) : (
            <div className="vstack gap-3">
              <div>
                <label className="form-label">Label</label>
                <input className="form-control" value={selected.label || ''} onChange={e=>updateSelected({label:e.target.value})} />
              </div>
              <div>
                <label className="form-label">Name</label>
                <input className="form-control" value={selected.name || ''} onChange={e=>updateSelected({name:e.target.value})} />
                <div className="form-text">Key used in the submission payload.</div>
              </div>
              <div>
                <label className="form-label">Type</label>
                <select className="form-select" value={selected.type} onChange={e=>updateSelected({type:e.target.value})}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              {selected.type !== 'checkbox' && selected.type !== 'select' && (
                <div>
                  <label className="form-label">Placeholder (optional)</label>
                  <input className="form-control" value={selected.placeholder || ''} onChange={e=>updateSelected({placeholder:e.target.value})} />
                </div>
              )}
              {selected.type === 'select' && (
                <div>
                  <label className="form-label">Options (one per line)</label>
                  <textarea className="form-control" rows={5} value={(selected.options||[]).map(o=>typeof o==='string'?o:(o.label??o.value)).join('\n')} onChange={e=>updateSelected({options: e.target.value.split(/\r?\n/).filter(Boolean)})} />
                </div>
              )}
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="req" checked={!!selected.required} onChange={e=>updateSelected({required:e.target.checked})} />
                <label className="form-check-label" htmlFor="req">Required</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function uniqueName(fields, base) {
  const norm = (s) => s.replace(/[^a-z0-9_]/gi, '_').toLowerCase()
  let name = norm(base)
  if (!fields.find(f => f.name === name)) return name
  let i = 2
  while (fields.find(f => f.name === `${name}_${i}`)) i++
  return `${name}_${i}`
}
