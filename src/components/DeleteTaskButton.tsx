'use client'

import { deleteTask } from '@/app/dashboard/tasks/actions'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function DeleteTaskButton({ taskId, projectId }: { taskId: string, projectId: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    setLoading(true)
    const result = await deleteTask(taskId, projectId)
    if (result.error) {
      alert('Failed to delete task')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
      title="Delete Task"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
