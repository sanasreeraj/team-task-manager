'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { updateTaskStatus, updateTask, deleteTask } from '@/app/dashboard/tasks/actions'
import { addComment, getComments } from '@/app/dashboard/tasks/comments'
import { Calendar, FolderKanban, GripVertical, Pencil, Trash2, X, MessageSquare, Search, Send, Loader2, User, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

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

type Member = { id: string; full_name: string }

type Comment = {
  id: string
  content: string
  created_at: string
  profiles: { full_name: string } | null
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/5', headerColor: 'text-orange-600', dotColor: 'bg-orange-500' },
  { id: 'in_progress', label: 'In Progress', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/5', headerColor: 'text-blue-600', dotColor: 'bg-blue-500' },
  { id: 'code_review', label: 'Code Review', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/5', headerColor: 'text-purple-600', dotColor: 'bg-purple-500' },
  { id: 'done', label: 'Done', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/5', headerColor: 'text-green-600', dotColor: 'bg-green-500' },
]

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
}

export function KanbanBoard({ initialTasks, isAdmin, members }: { initialTasks: Task[]; isAdmin: boolean; members?: Member[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingComment, setSendingComment] = useState(false)
  const editingTaskId = useRef<string | null>(null)

  // Load comments when editing a task
  useEffect(() => {
    const taskId = editingTask?.id || null
    if (taskId && taskId !== editingTaskId.current) {
      editingTaskId.current = taskId
      setLoadingComments(true)
      getComments(taskId).then(res => {
        if (editingTaskId.current === taskId) {
          setComments(res.data as Comment[])
          setLoadingComments(false)
        }
      })
    }
    if (!taskId) {
      editingTaskId.current = null
      setComments([])
      setNewComment('')
    }
  }, [editingTask?.id])

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingTask) {
        setEditingTask(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editingTask])

  const handleDragStart = (taskId: string) => setDraggedTask(taskId)
  const handleDragOver = (e: React.DragEvent, columnId: string) => { e.preventDefault(); setDropTarget(columnId) }
  const handleDragLeave = () => setDropTarget(null)

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDropTarget(null)
    if (!draggedTask) return
    const task = tasks.find(t => t.id === draggedTask)
    if (!task || task.status === columnId) { setDraggedTask(null); return }
    setTasks(prev => prev.map(t => t.id === draggedTask ? { ...t, status: columnId } : t))
    setDraggedTask(null)
    const result = await updateTaskStatus(task.id, task.project_id, columnId)
    if (result.error) {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: task.status } : t))
      toast.error('Failed to update status')
    } else {
      toast.success(`Moved to ${COLUMNS.find(c => c.id === columnId)?.label}`)
    }
  }

  const handleDeleteTask = async (taskId: string, projectId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    // Custom toast confirmation
    toast((t) => (
      <div className="flex items-center gap-3">
        <span className="text-sm">Delete &quot;{task.title}&quot;?</span>
        <div className="flex gap-1">
          <button onClick={() => { toast.dismiss(t.id); performDelete(taskId, projectId) }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium">Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">Cancel</button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  const performDelete = async (taskId: string, projectId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    const result = await deleteTask(taskId, projectId)
    if (result.error) {
      setTasks(initialTasks)
      toast.error('Failed to delete task')
    } else {
      toast.success('Task deleted')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return
    setSaving(true)
    const result = await updateTask(editingTask.id, editingTask.project_id, {
      title: editingTask.title,
      description: editingTask.description || '',
      priority: editingTask.priority,
      status: editingTask.status,
      feedback: editingTask.feedback || '',
      assigned_to: editingTask.assigned_to || null,
      due_date: editingTask.due_date || null,
    })
    setSaving(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t))
    setEditingTask(null)
    toast.success('Task updated')
  }

  const handleAddComment = async () => {
    if (!editingTask || !newComment.trim()) return
    setSendingComment(true)
    const result = await addComment(editingTask.id, newComment.trim())
    if (!result.error) {
      setNewComment('')
      const res = await getComments(editingTask.id)
      setComments(res.data as Comment[])
      toast.success('Feedback added')
    } else {
      toast.error('Failed to add feedback')
    }
    setSendingComment(false)
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority
    const matchesAssignee = filterAssignee === 'all' || t.assigned_to === filterAssignee || (filterAssignee === 'unassigned' && !t.assigned_to)
    return matchesSearch && matchesPriority && matchesAssignee
  })

  const getTasksForColumn = useCallback((columnId: string) => filteredTasks.filter(t => t.status === columnId), [filteredTasks])

  return (
    <>
      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border/50 bg-card text-sm text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-lg border border-border/50 bg-card py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none transition-all appearance-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
        </div>
        {members && members.length > 0 && (
          <div className="relative">
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="rounded-lg border border-border/50 bg-card py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none transition-all appearance-none"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 h-[calc(100vh-240px)] md:h-[calc(100vh-140px)]">
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id)
          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col rounded-xl border transition-all duration-200 ${
                dropTarget === column.id ? `${column.borderColor} ${column.bgColor}` : 'border-border/40 bg-card/30'
              }`}
            >
              <div className="px-3.5 py-2.5 border-b border-border/20 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                <h3 className={`text-xs font-semibold ${column.headerColor}`}>{column.label}</h3>
                <span className="text-[10px] font-bold bg-foreground/5 text-foreground/40 px-1.5 py-0.5 rounded ml-auto">{columnTasks.length}</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`group rounded-lg bg-card border border-border/40 p-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-sm hover:border-primary/20 ${
                      draggedTask === task.id ? 'opacity-30 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingTask(task)} className="p-1 rounded text-foreground/25 hover:text-primary hover:bg-primary/10 transition-all">
                          <Pencil className="w-3 h-3" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDeleteTask(task.id, task.project_id)} className="p-1 rounded text-foreground/25 hover:text-red-500 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <GripVertical className="w-3 h-3 text-foreground/15" />
                      </div>
                    </div>

                    <h4 className="text-[13px] font-medium text-foreground leading-snug line-clamp-2">{task.title}</h4>
                    {task.description && <p className="mt-1 text-[11px] text-foreground/50 line-clamp-2">{task.description}</p>}

                    {task.feedback && (
                      <div className="mt-1.5 flex items-center gap-1 text-[9px] text-purple-500/70">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>Feedback</span>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-border/20 space-y-1">
                      {task.projects?.name && (
                        <div className="flex items-center gap-1 text-[10px] text-foreground/40">
                          <FolderKanban className="w-2.5 h-2.5" />
                          <span className="truncate">{task.projects.name}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-foreground/40">
                        <span className="truncate flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          {task.assigned?.full_name || 'Unassigned'}
                        </span>
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
                  <div className="flex items-center justify-center h-20 text-[10px] text-foreground/20 border border-dashed border-border/20 rounded-lg">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Task Modal with Comments */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingTask(null)}>
          <div className="bg-card rounded-2xl border border-border/50 shadow-2xl w-full max-w-[95%] md:max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
              <h2 className="text-sm font-bold text-foreground">Edit Task</h2>
              <div className="flex items-center gap-1 text-[10px] text-foreground/30">
                <kbd className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border/30 text-[9px]">Esc</kbd>
                <span>to close</span>
              </div>
              <button onClick={() => setEditingTask(null)} className="p-1.5 rounded-lg hover:bg-foreground/5 transition-all">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/20">
              {/* Left: Task Details */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-foreground/50 mb-1">Title</label>
                  <input
                    value={editingTask.title}
                    onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/50 mb-1">Description</label>
                  <textarea rows={3} value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1">Priority</label>
                    <div className="relative">
                      <select value={editingTask.priority} onChange={e => setEditingTask({...editingTask, priority: e.target.value})}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none appearance-none">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1">Due Date</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={editingTask.due_date || ''} onChange={e => setEditingTask({...editingTask, due_date: e.target.value || null})}
                      className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground/50 mb-1">Status</label>
                    <div className="relative">
                      <select value={editingTask.status} onChange={e => setEditingTask({...editingTask, status: e.target.value})}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none appearance-none">
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="code_review">Code Review</option>
                        <option value="done">Done</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
                    </div>
                  </div>
                  {isAdmin && members && (
                    <div>
                      <label className="block text-xs font-medium text-foreground/50 mb-1">Assign To</label>
                      <div className="relative">
                        <select value={editingTask.assigned_to || ''} onChange={e => setEditingTask({...editingTask, assigned_to: e.target.value || null})}
                          className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-8 text-sm text-foreground focus:border-primary focus:outline-none appearance-none">
                          <option value="">Unassigned</option>
                          {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Comments/Feedback Log */}
              <div className="w-full md:w-[320px] flex flex-col bg-foreground/[0.01] shrink-0 min-h-[250px] md:min-h-0">
                <div className="px-4 py-3 border-b border-border/20 shrink-0">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Feedback
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-4 h-4 text-foreground/30 animate-spin" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-xs text-foreground/30 text-center py-8">No feedback yet</p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="rounded-lg bg-card border border-border/30 p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-foreground/70">{c.profiles?.full_name || 'Unknown'}</span>
                          <span className="text-[9px] text-foreground/30">{new Date(c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-foreground/60 leading-relaxed">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-border/20 shrink-0 bg-background md:bg-transparent">
                  <div className="flex items-center gap-2">
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                      placeholder="Add feedback..."
                      className="flex-1 rounded-lg border border-border bg-background py-1.5 px-3 text-xs text-foreground placeholder:text-foreground/25 focus:border-primary focus:outline-none"
                    />
                    <button onClick={handleAddComment} disabled={!newComment.trim() || sendingComment} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all">
                      {sendingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border/30 shrink-0">
              <button onClick={handleSaveEdit} disabled={saving} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditingTask(null)} className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/[0.02] transition-all active:scale-[0.98]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
