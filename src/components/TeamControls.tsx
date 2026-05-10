'use client'

import { updateMemberDesignation, deleteMember } from '@/app/dashboard/team/actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const PRESET_DESIGNATIONS = ['Member', 'Developer', 'Designer', 'Tester', 'Manager', 'Team Lead', 'DevOps', 'Analyst']

export function DesignationSelect({ memberId, currentDesignation }: { memberId: string; currentDesignation: string }) {
  const [value, setValue] = useState(currentDesignation || 'Member')
  const [isCustom, setIsCustom] = useState(!PRESET_DESIGNATIONS.includes(currentDesignation || 'Member'))
  const [loading, setLoading] = useState(false)

  const handleChange = async (newVal: string) => {
    if (newVal === '__custom__') {
      setIsCustom(true)
      return
    }
    setLoading(true)
    setValue(newVal)
    const result = await updateMemberDesignation(memberId, newVal)
    if (result.error) toast.error(result.error)
    else toast.success('Designation updated')
    setLoading(false)
  }

  const handleCustomSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      // Validate length
      if (value.trim().length > 30) {
        toast.error('Designation must be 30 characters or less')
        return
      }
      setLoading(true)
      const result = await updateMemberDesignation(memberId, value.trim())
      if (result.error) toast.error(result.error)
      else toast.success('Designation updated')
      setLoading(false)
    }
  }

  if (isCustom) {
    return (
      <input
        value={value}
        onChange={e => setValue(e.target.value.slice(0, 30))}
        onKeyDown={handleCustomSubmit}
        onBlur={() => { if (!value.trim()) { setIsCustom(false); setValue('Member') } }}
        placeholder="Type role..."
        disabled={loading}
        maxLength={30}
        className="w-32 rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
        autoFocus
      />
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
    >
      {PRESET_DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
      <option value="__custom__">Custom...</option>
    </select>
  )
}

export function RemoveMemberButton({ memberId, memberName, isSelf }: { memberId: string; memberName: string; isSelf: boolean }) {
  const [loading, setLoading] = useState(false)

  if (isSelf) return null

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Remove {memberName}?</span>
        <div className="flex gap-1">
          <button onClick={() => { toast.dismiss(t.id); performDelete() }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">Remove</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const performDelete = async () => {
    setLoading(true)
    const result = await deleteMember(memberId)
    if (result.error) {
      toast.error('Failed: ' + result.error)
      setLoading(false)
    } else {
      toast.success('Member removed')
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1 rounded text-foreground/25 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
