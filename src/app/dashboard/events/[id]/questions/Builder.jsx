"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

const FIELD_TEMPLATES = [
  { type: 'text', label: 'Short Text', name: 'text_field', required: false },
  { type: 'email', label: 'Email', name: 'email_field', required: false },
  { type: 'tel', label: 'Phone', name: 'phone_field', required: false },
  { type: 'select', label: 'Select', name: 'select_field', required: false, options: ['Option 1','Option 2'] },
  { type: 'checkbox', label: 'Checkbox', name: 'checkbox_field', required: false },
]

export default function Builder({ initialSchema }) {
  const [fields, setFields] = useState(initialSchema || [])
  const [selectedIdx, setSelectedIdx] = useState(null)
  
  // Navigation links for the project
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/events', label: 'Events' },
    { href: '/dashboard/events/new', label: 'New Event' },
    { href: '/dashboard/events', label: 'Customize Questions' }
  ]

  const selected = selectedIdx !== null ? fields[selectedIdx] : null

  const loadStarterTemplate = () => {
    const starterFields = [
      { type: 'text', label: 'Name', name: 'name', required: true },
      { type: 'email', label: 'Email', name: 'email', required: true },
      { type: 'tel', label: 'Phone', name: 'phone', required: false }
    ]
    setFields(starterFields)
    setSelectedIdx(0)
  }

  const addField = (tpl) => {
  const base = { ...tpl }
  base.name = uniqueName(fields, base.name)
  setFields(prev => [...prev, base])
  setSelectedIdx(fields.length)
  }

  const removeField = (idx) => {
    setFields(prev => {
      const newFields = prev.filter((_, i) => i !== idx)
      // If the removed field was selected, select the next one, or previous, or null
      if (selectedIdx === idx) {
        if (newFields.length === 0) {
          setSelectedIdx(null)
        } else if (idx < newFields.length) {
          setSelectedIdx(idx)
        } else {
          setSelectedIdx(newFields.length - 1)
        }
      } else if (selectedIdx > idx) {
        setSelectedIdx(selectedIdx - 1)
      }
      return newFields
    })
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
    <>
     

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Field Types */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-full shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Field Types</h2>
          <div className="flex flex-col gap-2">
            {FIELD_TEMPLATES.map((tpl, i) => (
              <button type="button" key={i} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg shadow transition" onClick={() => addField(tpl)}>
                + {tpl.label}
              </button>
            ))}
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <p className="text-xs text-gray-400 mb-0">
            Drag-and-drop is simulated with Move Up/Down. You can add, edit, reorder, and delete fields.
          </p>
        </div>

        {/* Form Preview */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-full shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Form Preview</h2>
          {!fields.length && <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 mb-0 text-center">No fields yet. Add from the left.</div>}
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {fields.map((f, i) => (
              <li key={i} className={`flex items-center px-3 py-2 cursor-pointer rounded-lg transition ${i===selectedIdx?'bg-blue-100 dark:bg-blue-900':''}`} onClick={() => setSelectedIdx(i)}>
                <div className="flex-grow">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{f.label || f.name}</span>
                  <span className="ml-2 text-xs text-gray-500">[{f.type}{f.required?' • required':''}]</span>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1 text-xs" onClick={(e)=>{e.stopPropagation();move(i,-1)}}>↑</button>
                  <button type="button" className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded px-2 py-1 text-xs" onClick={(e)=>{e.stopPropagation();move(i,1)}}>↓</button>
                  <button type="button" className="bg-red-100 hover:bg-red-200 dark:bg-red-700 dark:hover:bg-red-600 text-red-700 dark:text-red-200 rounded px-2 py-1 text-xs" onClick={(e)=>{e.stopPropagation();removeField(i)}}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Field Settings */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 h-full shadow">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Field Settings</h2>
          {!selected ? (
            <div className="text-gray-400">Select a field to edit its settings.</div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Label</label>
                <input className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={selected.label || ''} onChange={e=>updateSelected({label:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Name</label>
                <input className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={selected.name || ''} onChange={e=>updateSelected({name:e.target.value})} />
                <div className="text-xs text-gray-400 mt-1">Key used in the submission payload.</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Type</label>
                <select className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={selected.type} onChange={e=>updateSelected({type:e.target.value})}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="select">Select</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              {selected.type !== 'checkbox' && selected.type !== 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Placeholder (optional)</label>
                  <input className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={selected.placeholder || ''} onChange={e=>updateSelected({placeholder:e.target.value})} />
                </div>
              )}
              {selected.type === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Options (one per line)</label>
                  <textarea className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" rows={5} value={(selected.options||[]).map(o=>typeof o==='string'?o:(o.label??o.value)).join('\n')} onChange={e=>updateSelected({options: e.target.value.split(/\r?\n/).filter(Boolean)})} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input className="rounded border-gray-300 dark:border-gray-700 focus:ring-blue-500" type="checkbox" id="req" checked={!!selected.required} onChange={e=>updateSelected({required:e.target.checked})} />
                <label className="text-sm text-gray-700 dark:text-gray-200" htmlFor="req">Required</label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Starter Template Button at Bottom */}
      <div className="mt-6 flex justify-end">
        <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition" onClick={loadStarterTemplate}>
          Load Starter Template
        </button>
      </div>
    </>
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