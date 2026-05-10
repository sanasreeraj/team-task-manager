'use client'

import { deleteProject } from '@/app/dashboard/projects/actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function DeleteProjectButton({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Delete "${projectName}" and all its tasks? This cannot be undone.`)) return
    
    setLoading(true)
    const result = await deleteProject(projectId)
    if (result?.error) {
      alert('Failed to delete project: ' + result.error)
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
