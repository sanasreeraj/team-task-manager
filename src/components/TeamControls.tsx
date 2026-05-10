'use client'

import { deleteMember, updateMemberDetails } from '@/app/dashboard/team/actions'
import { Trash2, Edit2, X, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ROLES = ['Developer', 'Designer', 'Tester', 'Manager', 'Team Lead', 'DevOps', 'Analyst', 'Member']

export function MemberControls({ 
  member, 
  currentUserId 
}: { 
  member: { id: string; full_name: string; phone_number: string; email: string; role: string; is_admin: boolean };
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  
  const [editData, setEditData] = useState({
    full_name: member.full_name || '',
    phone_number: member.phone_number || '',
    email: member.email || '',
    role: member.role || 'Member',
  })
  
  const isSelf = member.id === currentUserId
  const isOtherAdmin = member.is_admin && !isSelf
  const disabled = loading || isOtherAdmin

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Remove {member.full_name}?</span>
        <div className="flex gap-1">
          <button onClick={() => { toast.dismiss(t.id); performDelete() }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">Remove</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const performDelete = async () => {
    setLoading(true)
    const result = await deleteMember(member.id)
    if (result.error) {
      toast.error('Failed: ' + result.error)
      setLoading(false)
    } else {
      toast.success('Member removed')
    }
  }

  const handleSave = async () => {
    if (!editData.full_name || !editData.email) {
      toast.error('Name and Email are required')
      return
    }
    setLoading(true)
    const result = await updateMemberDetails(member.id, editData)
    if (result.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Member updated')
      setEditing(false)
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button 
          onClick={() => setEditing(true)} 
          disabled={disabled} 
          className="p-1.5 rounded-lg text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title={isOtherAdmin ? "Cannot edit other admins" : "Edit member"}
        >
          <Edit2 className="w-4 h-4" />
        </button>
        {!isSelf && (
          <button 
            onClick={handleDelete} 
            disabled={disabled} 
            className="p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title={isOtherAdmin ? "Cannot delete other admins" : "Delete member"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditing(false)}>
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Edit Member</h2>
              <button onClick={() => setEditing(false)} className="text-foreground/40 hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">Full Name</label>
                <input value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})} className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">Email</label>
                <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">Phone Number</label>
                <input value={editData.phone_number} onChange={e => setEditData({...editData, phone_number: e.target.value})} className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/60 mb-1">Role</label>
                <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm focus:border-primary focus:outline-none">
                  <option value={editData.role}>{editData.role}</option>
                  {ROLES.filter(r => r !== editData.role).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border/30 bg-foreground/[0.02] flex items-center justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground/70 hover:bg-foreground/5 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
