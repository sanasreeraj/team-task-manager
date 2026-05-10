'use client'

import { deleteProject } from '@/app/dashboard/projects/actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function DeleteProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete &quot;{projectName}&quot; and all tasks?</span>
        <div className="flex gap-1">
          <button onClick={() => { toast.dismiss(t.id); performDelete() }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const performDelete = async () => {
    setLoading(true)
    const result = await deleteProject(projectId)
    if (result?.error) {
      toast.error('Failed: ' + result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all active:scale-95 disabled:opacity-50"
      title="Delete Project"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  )
}
