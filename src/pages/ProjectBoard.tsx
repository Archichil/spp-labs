import { useMemo, useState } from 'react'
import type { Task } from '../types'
import TaskCard from '../components/TaskCard'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectsContext'

export default function ProjectBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, addTask, updateTask, deleteTask } = useProjects()
  const project = projects.find(p => p.id === id)
  if (!project) return <div className="text-gray-500">Проект не найден</div>
  const proj = project
  const [form, setForm] = useState<{ title: string; description: string; assignee: string; status: Task['status'] }>(
    { title: '', description: '', assignee: '', status: 'todo' }
  )

  const columns = useMemo(() => ([
    { key: 'todo', title: 'ToDo' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ] as const), [])

  const tasksByStatus = useMemo(() => {
    return {
      todo: proj.tasks.filter(t => t.status === 'todo'),
      in_progress: proj.tasks.filter(t => t.status === 'in_progress'),
      done: proj.tasks.filter(t => t.status === 'done'),
    }
  }, [proj.tasks])

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    const title = form.title.trim()
    if (!title) return
    addTask(proj.id, {
      title,
      description: form.description.trim(),
      assignee: form.assignee.trim(),
      status: form.status,
    })
    setForm({ title: '', description: '', assignee: '', status: 'todo' })
  }

  function handleDelete(taskId: string) {
    deleteTask(proj.id, taskId)
  }

  function handleEdit(taskId: string, updates: Partial<Omit<Task, 'id'>>) {
    updateTask(proj.id, taskId, updates)
  }

  // DnD removed per request

  return (
    <div>
      <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
      <h2 className="mb-4 text-xl font-semibold">{proj.name}</h2>

      <div className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-base font-medium">Создать задачу</h3>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Название"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Исполнитель"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          />
          <textarea
            className="sm:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Описание"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
          >
            <option value="todo">ToDo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div>
            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Добавить</button>
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


