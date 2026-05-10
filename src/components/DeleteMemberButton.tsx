'use client'

import { deleteMember } from '@/app/dashboard/team/actions'
import { UserMinus } from 'lucide-react'
import { useState } from 'react'

export function DeleteMemberButton({ memberId, memberName }: { memberId: string, memberName: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) return
    
    setLoading(true)
    const result = await deleteMember(memberId)
    if (result.error) {
      alert('Failed to remove member: ' + result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-xl text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
      title="Remove Member"
    >
      <UserMinus className="w-5 h-5" />
    </button>
  )
}
