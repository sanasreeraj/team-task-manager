'use client'

import { useState } from 'react'
import { updateProject } from '@/app/dashboard/projects/actions'
import { Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

export function EditableProjectHeader({ 
  projectId, 
  name, 
  description, 
  isAdmin 
}: { 
  projectId: string
  name: string
  description: string | null
  isAdmin: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [editDesc, setEditDesc] = useState(description || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Project name cannot be empty')
      return
    }
    setSaving(true)
    const result = await updateProject(projectId, { 
      name: editName.trim(), 
      description: editDesc.trim() || null 
    } as any)
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Project updated')
      setEditing(false)
    }
  }

  const handleCancel = () => {
    setEditName(name)
    setEditDesc(description || '')
    setEditing(false)
  }

  if (!isAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{name}</h1>
        <p className="text-sm text-foreground/50 mt-1 max-w-2xl">
          {description || 'No description provided.'}
        </p>
      </div>
    )
  }

  if (!editing) {
    return (
      <div className="group">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{name}</h1>
          <button 
            onClick={() => setEditing(true)} 
            className="p-1 rounded-lg text-foreground/20 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-foreground/50 mt-1 max-w-2xl">
          {description || 'No description provided.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <input
        value={editName}
        onChange={e => setEditName(e.target.value)}
        className="w-full text-2xl font-bold text-foreground tracking-tight bg-transparent border-b-2 border-primary/30 focus:border-primary focus:outline-none pb-1"
        autoFocus
      />
      <textarea
        value={editDesc}
        onChange={e => setEditDesc(e.target.value)}
        rows={2}
        className="w-full text-sm text-foreground/70 bg-transparent border border-border/50 rounded-lg p-2 focus:border-primary focus:outline-none resize-none"
        placeholder="Add a description..."
      />
      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5">
          <Check className="w-3 h-3" />
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleCancel} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/60 hover:bg-foreground/5 transition-all flex items-center gap-1.5">
          <X className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  )
}
