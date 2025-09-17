import { useMemo, useState } from 'react'
import type { Task } from '../types'
import TaskCard from '../components/TaskCard'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectsContext'

export default function ProjectBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, addTask, updateTask, deleteTask, loading, error } = useProjects()
  const project = projects.find(p => p.id === id)
  const [form, setForm] = useState<{ title: string; description: string; assignee: string; status: Task['status'] }>(
      { title: '', description: '', assignee: '', status: 'todo' }
  )
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const columns = useMemo(() => ([
    { key: 'todo', title: 'ToDo' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ] as const), [])

  // useMemo вызывается вне условий!
  const tasksByStatus = useMemo(() => {
    if (!project) {
      return {
        todo: [],
        in_progress: [],
        done: [],
      }
    }
    return {
      todo: project.tasks.filter(t => t.status === 'todo'),
      in_progress: project.tasks.filter(t => t.status === 'in_progress'),
      done: project.tasks.filter(t => t.status === 'done'),
    }
  }, [project])

  if (loading) {
    return (
        <div>
          <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Загрузка проекта...</div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div>
          <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
          <div className="rounded-md bg-red-50 border border-red-200 p-4">
            <div className="text-red-800">Ошибка загрузки: {error}</div>
          </div>
        </div>
    )
  }

  if (!project) {
    return (
        <div>
          <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
          <div className="text-gray-500">Проект не найден</div>
        </div>
    )
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title || creating || !project) return

    try {
      setCreating(true)
      await addTask(project.id, {
        title,
        description: form.description.trim(),
        assignee: form.assignee.trim(),
        status: form.status,
      })
      setForm({ title: '', description: '', assignee: '', status: 'todo' })
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(taskId: string) {
    if (!project) return
    try {
      setUpdating(taskId)
      await deleteTask(project.id, taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setUpdating(null)
    }
  }

  async function handleEdit(taskId: string, updates: Partial<Omit<Task, 'id'>>) {
    if (!project) return
    try {
      setUpdating(taskId)
      await updateTask(project.id, taskId, updates)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setUpdating(null)
    }
  }

  return (
      <div>
        <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
        <h2 className="mb-4 text-xl font-semibold">{project.name}</h2>

        <div className="mb-6 rounded-md border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-base font-medium">Создать задачу</h3>
          <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Название"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={creating}
            />
            <input
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Исполнитель"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                disabled={creating}
            />
            <textarea
                className="sm:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="Описание"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={creating}
            />
            <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                disabled={creating}
            >
              <option value="todo">ToDo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div>
              <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating || !form.title.trim()}
              >
                {creating ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {columns.map(col => (
              <div
                  key={col.key}
                  className="flex min-h-[420px] flex-col rounded-md border border-gray-200 bg-gray-50 p-3"
              >
                <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
                <div className="flex-1 space-y-2">
                  {tasksByStatus[col.key].map(task => (
                      <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={(updates) => handleEdit(task.id, updates)}
                          onDelete={() => handleDelete(task.id)}
                          disabled={updating === task.id}
                      />
                  ))}
                  {tasksByStatus[col.key].length === 0 && (
                      <div className="text-center text-xs text-gray-400">Нет задач</div>
                  )}
                </div>
              </div>
          ))}
        </div>
      </div>
  )
}