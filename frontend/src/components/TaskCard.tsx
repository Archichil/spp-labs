import type { Task, ProjectMember } from '../types'
import { useState } from 'react'
import { tasksApi } from '../services/api'

export interface TaskCardProps {
  task: Task
  onEdit?: (updates: Partial<Omit<Task, 'id'>>) => void
  onDelete?: () => void
  disabled?: boolean
  projectMembers?: ProjectMember[]
  projectId: string
  onAttachmentChange?: () => void
}

export default function TaskCard({ task, onEdit, onDelete, disabled = false, projectMembers = [], projectId, onAttachmentChange }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: task.title,
    description: task.description,
    assignee: task.assignee,
    status: task.status as Task['status']
  })

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    if (task.attachments && task.attachments.length >= 3) {
      alert('Maximum 3 attachments per task')
      return
    }

    try {
      setUploading(true)
      await tasksApi.uploadAttachment(projectId, task.id, file)
      onAttachmentChange?.()
      e.target.value = '' // Reset input
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  async function handleDownload(attachmentId: string, originalName: string) {
    try {
      await tasksApi.downloadAttachment(projectId, task.id, attachmentId, originalName)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Failed to download file')
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm('Are you sure you want to delete this attachment?')) return

    try {
      await tasksApi.deleteAttachment(projectId, task.id, attachmentId)
      onAttachmentChange?.()
    } catch (error) {
      console.error('Error deleting attachment:', error)
      alert('Failed to delete attachment')
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function startEdit() {
    if (!onEdit || disabled) return
    setForm({ title: task.title, description: task.description, assignee: task.assignee, status: task.status })
    setIsEditing(true)
  }

  function saveEdit() {
    if (!onEdit || disabled) return
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
        {projectMembers.length > 0 ? (
          <select
            className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          >
            <option value="">Выберите исполнителя</option>
            {projectMembers.map((member) => (
              <option key={member.id} value={member.username}>
                {member.username} ({member.email})
              </option>
            ))}
          </select>
        ) : (
          <input
            className="mb-2 w-full rounded border border-gray-300 px-2 py-1 text-xs"
            placeholder="Исполнитель"
            value={form.assignee}
            onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          />
        )}
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
          <button 
            onClick={saveEdit} 
            className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Сохранить
          </button>
          <button 
            onClick={cancelEdit} 
            className="rounded bg-gray-200 px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
          >
            Отмена
          </button>
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
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Удалить"
              title="Удалить"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              🗑
            </button>
          )}
        </div>
      </div>
      <div className="mb-2 whitespace-pre-wrap break-words text-xs text-gray-600">{task.description}</div>
      <div className="text-xs text-gray-500 mb-2">Исполнитель: {task.assignee || 'Неизвестно'}</div>
      
      {/* Attachments Section */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-700 mb-1">Attachments:</div>
          <div className="space-y-1">
            {task.attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between text-xs bg-gray-50 p-1 rounded">
                <button
                  onClick={() => handleDownload(att.id, att.originalName)}
                  className="flex-1 text-left text-blue-600 hover:underline truncate"
                  title={att.originalName}
                >
                  📎 {att.originalName} ({formatFileSize(att.size)})
                </button>
                <button
                  onClick={() => handleDeleteAttachment(att.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Delete attachment"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      {(!task.attachments || task.attachments.length < 3) && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <label className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded cursor-pointer">
            <span className="mr-1">📎</span>
            {uploading ? 'Uploading...' : 'Add Attachment'}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || disabled}
            />
          </label>
          <span className="ml-2 text-xs text-gray-500">
            ({task.attachments?.length || 0}/3)
          </span>
        </div>
      )}
    </div>
  )
}


