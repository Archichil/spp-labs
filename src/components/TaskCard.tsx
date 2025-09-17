import type { Task } from '../types'
import { useState } from 'react'

export interface TaskCardProps {
  task: Task
  onEdit?: (updates: Partial<Omit<Task, 'id'>>) => void
  onDelete?: () => void
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status as Task['status']
  })

  function startEdit() {
    if (!onEdit) return
    setForm({ title: task.title, description: task.description, assignee: task.assignee, status: task.status })
    setIsEditing(true)
  }

  function saveEdit() {
    if (!onEdit) return
    const updates = {
      title: form.title.trim(),
      description: form.description.trim(),
      assignee: form.assignee.trim(),
      status: form.status
    }
    onEdit(updates)
    setIsEditing(false)
  }

  function cancelEdit() {
    setIsEditing(false)
    setForm({ title: task.title, description: task.description, assignee: task.assignee, status: task.status })
  }

  if (isEditing) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
        <input
          className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={form.title}
          placeholder="Название"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          rows={3}
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          placeholder="Исполнитель"
          value={form.assignee}
          onChange={(e) => setForm({ ...form, assignee: e.target.value })}
        />
        <select
          className="mb-3 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
        >
          <option value="todo">ToDo</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div className="flex gap-2">
          <button onClick={saveEdit} className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700">Сохранить</button>
          <button onClick={cancelEdit} className="rounded bg-gray-200 px-2 py-1 text-xs">Отмена</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex-1 text-left text-sm font-medium truncate" title={task.title}>{task.title}</div>
        <div className="flex gap-1.5">
          {onEdit && (
            <button
              onClick={startEdit}
              aria-label="Редактировать"
              title="Редактировать"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Удалить"
              title="Удалить"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              🗑
            </button>
          )}
        </div>
      </div>
      <div className="mb-2 whitespace-pre-wrap break-words text-xs text-gray-600">{task.description}</div>
      <div className="text-xs text-gray-500">Исполнитель: {task.assignee || 'Неизвестно'}</div>
    </div>
  )
}


