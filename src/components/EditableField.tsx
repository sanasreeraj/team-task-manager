'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/dashboard/settings/actions'
import { Pencil, Check, X, Loader2, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const ICONS: Record<string, any> = {
  user: User,
  phone: Phone,
}

export function EditableField({ 
  label, 
  value, 
  field, 
  iconName,
  prefix
}: { 
  label: string
  value: string
  field: 'full_name' | 'phone_number'
  iconName: string
  prefix?: string
}) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [saving, setSaving] = useState(false)

  const Icon = ICONS[iconName] || User

  const handleSave = async () => {
    setSaving(true)
    const result = await updateProfile({ [field]: editValue })
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${label} updated`)
      setEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setEditing(false)
  }

  return (
    <div className="px-5 py-3.5 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-foreground/35" />
        <span className="text-sm text-foreground/60">{label}</span>
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          {prefix && <span className="text-sm text-foreground/50">{prefix}</span>}
          <input
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="w-48 rounded-lg border border-border bg-background py-1 px-2 text-sm text-foreground focus:border-primary focus:outline-none"
            autoFocus
          />
          <button onClick={handleSave} disabled={saving} className="p-1 rounded-lg text-green-600 hover:bg-green-500/10 transition-all">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleCancel} className="p-1 rounded-lg text-foreground/40 hover:bg-foreground/5 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{prefix}{value}</span>
          <button 
            onClick={() => setEditing(true)} 
            className="p-1 rounded-lg text-foreground/15 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
