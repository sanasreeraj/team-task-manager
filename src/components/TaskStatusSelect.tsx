'use client'

import { updateTaskStatus } from '@/app/dashboard/tasks/actions'
import { useState } from 'react'

export function TaskStatusSelect({ 
  taskId, 
  projectId, 
  initialStatus 
}: { 
  taskId: string, 
  projectId: string, 
  initialStatus: string 
}) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: string) => {
    setLoading(true)
    setStatus(newStatus)
    const result = await updateTaskStatus(taskId, projectId, newStatus)
    if (result.error) {
      setStatus(initialStatus)
      alert('Failed to update status')
    }
    setLoading(false)
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'done': return "bg-green-500/10 text-green-500"
      case 'in_progress': return "bg-blue-500/10 text-blue-500"
      case 'code_review': return "bg-purple-500/10 text-purple-500"
      default: return "bg-orange-500/10 text-orange-500"
    }
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value)}
      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-primary cursor-pointer transition-all appearance-none ${statusColor(status)}`}
    >
      <option value="todo">To Do</option>
      <option value="in_progress">In Progress</option>
      <option value="code_review">Code Review</option>
      <option value="done">Done</option>
    </select>
  )
}
