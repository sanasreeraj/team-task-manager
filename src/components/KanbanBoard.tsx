'use client'

import { useState, useCallback } from 'react'
import { updateTaskStatus, updateTask, deleteTask } from '@/app/dashboard/tasks/actions'
import { Calendar, FolderKanban, GripVertical, Pencil, Trash2, X, MessageSquare, Search, Filter } from 'lucide-react'

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  feedback: string | null
  project_id: string
  due_date: string | null
  assigned_to: string | null
  projects?: { name: string } | null
  assigned?: { full_name: string } | null
}

type Member = {
  id: string
  full_name: string
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/5', headerColor: 'text-orange-600', dotColor: 'bg-orange-500' },
  { id: 'in_progress', label: 'In Progress', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/5', headerColor: 'text-blue-600', dotColor: 'bg-blue-500' },
  { id: 'code_review', label: 'Code Review', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/5', headerColor: 'text-purple-600', dotColor: 'bg-purple-500' },
  { id: 'done', label: 'Done', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/5', headerColor: 'text-green-600', dotColor: 'bg-green-500' },
]

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-500 border-green-500/20',
}

export function KanbanBoard({ 
  initialTasks, 
  isAdmin,
  members
}: { 
  initialTasks: Task[]
  isAdmin: boolean
  members?: Member[]
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDropTarget(columnId)
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDropTarget(null)
    
    if (!draggedTask) return
    
    const task = tasks.find(t => t.id === draggedTask)
    if (!task || task.status === columnId) {
      setDraggedTask(null)
      return
    }

    setTasks(prev => prev.map(t => t.id === draggedTask ? { ...t, status: columnId } : t))
    setDraggedTask(null)

    const result = await updateTaskStatus(task.id, task.project_id, columnId)
    if (result.error) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t))
    }
  }

  const handleDeleteTask = async (taskId: string, projectId: string) => {
    if (!confirm('Delete this task?')) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    const result = await deleteTask(taskId, projectId)
    if (result.error) {
      setTasks(initialTasks)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return
    
    const result = await updateTask(editingTask.id, editingTask.project_id, {
      title: editingTask.title,
      description: editingTask.description || '',
      priority: editingTask.priority,
      feedback: editingTask.feedback || '',
      assigned_to: editingTask.assigned_to || null,
      due_date: editingTask.due_date || null,
    })

    if (result.error) {
      alert('Failed to save changes')
      return
    }

    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t))
    setEditingTask(null)
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getTasksForColumn = useCallback((columnId: string) => {
    return filteredTasks.filter(t => t.status === columnId)
  }, [filteredTasks])

  return (
    <>
      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/50 bg-card/50 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded-xl border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all appearance-none"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 h-[calc(100vh-260px)]">
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id)
          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 ${
                dropTarget === column.id 
                  ? `${column.borderColor} ${column.bgColor} scale-[1.005]` 
                  : 'border-border/30 bg-card/20'
              }`}
            >
              {/* Column Header */}
              <div className="px-4 py-3 border-b border-border/15 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                <h3 className={`text-xs font-semibold ${column.headerColor}`}>{column.label}</h3>
                <span className="text-[10px] font-bold bg-foreground/5 text-foreground/40 px-1.5 py-0.5 rounded-full ml-auto">
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`group rounded-xl bg-card/90 backdrop-blur-sm border border-border/40 p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:border-primary/15 ${
                      draggedTask === task.id ? 'opacity-30 scale-95' : ''
                    }`}
                  >
                    {/* Priority & Actions */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 rounded-lg text-foreground/25 hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteTask(task.id, task.project_id)}
                            className="p-1 rounded-lg text-foreground/25 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <GripVertical className="w-3 h-3 text-foreground/15" />
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{task.title}</h4>
                    
                    {task.description && (
                      <p className="mt-1 text-[11px] text-foreground/45 line-clamp-2 leading-relaxed">{task.description}</p>
                    )}

                    {task.feedback && (
                      <div className="mt-2 flex items-center gap-1 text-[9px] text-purple-500/70">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Feedback</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-3 pt-2.5 border-t border-border/20 space-y-1">
                      {task.projects?.name && (
                        <div className="flex items-center gap-1 text-[10px] text-foreground/35">
                          <FolderKanban className="w-2.5 h-2.5" />
                          <span className="truncate">{task.projects.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-foreground/35">
                        <span className="truncate">{task.assigned?.full_name || 'Unassigned'}</span>
                        {task.due_date && (
                          <span className={`flex items-center gap-0.5 shrink-0 ${task.due_date < new Date().toISOString().split('T')[0] && task.status !== 'done' ? 'text-red-500 font-semibold' : ''}`}>
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[10px] text-foreground/20 border border-dashed border-border/15 rounded-xl">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingTask(null)}>
          <div className="bg-card rounded-3xl border border-border/50 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border/20">
              <h2 className="text-base font-semibold text-foreground">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="p-1.5 rounded-lg hover:bg-foreground/5 transition-all">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-1.5">Title</label>
                <input
                  value={editingTask.title}
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/50 mb-1.5">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={e => setEditingTask({...editingTask, priority: e.target.value})}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/50 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={e => setEditingTask({...editingTask, due_date: e.target.value || null})}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              {isAdmin && members && (
                <div>
                  <label className="block text-xs font-medium text-foreground/50 mb-1.5">Assign To</label>
                  <select
                    value={editingTask.assigned_to || ''}
                    onChange={e => setEditingTask({...editingTask, assigned_to: e.target.value || null})}
                    className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground/50 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Feedback / Notes
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={editingTask.feedback || ''}
                  onChange={e => setEditingTask({...editingTask, feedback: e.target.value})}
                  placeholder="Add feedback, review comments, or notes..."
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-3.5 text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-foreground/25"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-border/20">
              <button
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-card transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
