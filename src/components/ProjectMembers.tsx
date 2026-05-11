'use client'

import { useState } from 'react'
import { addProjectMember, removeProjectMember } from '@/app/dashboard/projects/[id]/member-actions'
import { UserPlus, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export function ProjectMembers({ 
  projectId, 
  currentMembers, 
  allProfiles, 
  isAdmin 
}: { 
  projectId: string
  currentMembers: any[]
  allProfiles: any[]
  isAdmin: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const handleAdd = async (userId: string) => {
    setLoading(userId)
    const result = await addProjectMember(projectId, userId)
    if (result.error) toast.error(result.error)
    else toast.success('Member added to project')
    setLoading(null)
  }

  const handleRemove = async (userId: string, name: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Remove {name}?</span>
        <div className="flex gap-1">
          <button onClick={() => { toast.dismiss(t.id); performRemove(userId) }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">Remove</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const performRemove = async (userId: string) => {
    setLoading(userId)
    const result = await removeProjectMember(projectId, userId)
    if (result.error) toast.error(result.error)
    else toast.success('Member removed from project')
    setLoading(null)
  }

  // Filter out profiles that are already members
  const availableProfiles = allProfiles.filter(
    p => !currentMembers.some(m => m.id === p.id)
  )

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-foreground/50" />
          <h2 className="text-sm font-semibold text-foreground">Project Members</h2>
          <span className="text-[10px] font-bold bg-foreground/5 text-foreground/40 px-1.5 py-0.5 rounded">
            {currentMembers.length}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            {showAdd ? 'Close' : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Add Member
              </>
            )}
          </button>
        )}
      </div>

      {showAdd && isAdmin && (
        <div className="mb-6 bg-foreground/[0.02] border border-border/30 rounded-xl p-4">
          <p className="text-xs font-medium text-foreground/50 mb-3 uppercase tracking-wider">Available Team Members</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableProfiles.length === 0 ? (
              <p className="text-xs text-foreground/30 italic">No other members available to add.</p>
            ) : (
              availableProfiles.map(profile => (
                <div key={profile.id} className="flex items-center justify-between bg-card border border-border/40 rounded-lg p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{profile.full_name}</p>
                    <p className="text-[10px] text-foreground/40 truncate">{profile.role}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(profile.id)}
                    disabled={loading === profile.id}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {currentMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between bg-card border border-border/40 rounded-xl p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                {member.full_name?.charAt(0) || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{member.full_name}</p>
                <p className="text-[9px] font-medium text-foreground/40 uppercase tracking-tight">{member.role}</p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => handleRemove(member.id, member.full_name)}
                disabled={loading === member.id}
                className="p-1.5 rounded-lg text-foreground/20 hover:text-red-500 hover:bg-red-500/10 disabled:opacity-50 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
