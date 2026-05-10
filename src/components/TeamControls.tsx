'use client'

import { updateMemberDesignation, deleteMember } from '@/app/dashboard/team/actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

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
    await updateMemberDesignation(memberId, newVal)
    setLoading(false)
  }

  const handleCustomSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      setLoading(true)
      await updateMemberDesignation(memberId, value.trim())
      setLoading(false)
    }
  }

  if (isCustom) {
    return (
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleCustomSubmit}
        onBlur={() => { if (!value.trim()) { setIsCustom(false); setValue('Member') } }}
        placeholder="Type role..."
        disabled={loading}
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
    if (!confirm(`Remove ${memberName} from the team?`)) return
    setLoading(true)
    const result = await deleteMember(memberId)
    if (result.error) { alert('Failed: ' + result.error); setLoading(false) }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1 rounded text-foreground/25 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
