import React, { useMemo, useState, useEffect } from 'react'
import type { Task, ProjectMember } from '../types'
import TaskCard from '../components/TaskCard'
import ProjectMembers from '../components/ProjectMembers'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectsContext'
import { useAuth } from '../context/AuthContext'
import { projectMembersApi } from '../services/api'

export default function ProjectBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, addTask, updateTask, deleteTask, deleteProject, refreshProjects, loading, error } = useProjects()
  const project = projects.find(p => p.id === id)
  const [form, setForm] = useState<{ title: string; description: string; assignee: string; status: Task['status'] }>(
      { title: '', description: '', assignee: '', status: 'todo' }
  )
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    async function loadMembers() {
      if (!id) return
      
      setLoadingMembers(true)
      try {
        const members = await projectMembersApi.getMembers(id)
        setProjectMembers(members)
      } catch (error) {
        console.error('Error loading project members:', error)
        setProjectMembers([])
      } finally {
        setLoadingMembers(false)
      }
    }

    void loadMembers()
  }, [id, showMembers])

  const columns = useMemo(() => ([
    { key: 'todo', title: 'ToDo' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ] as const), [])

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

  async function handleDeleteProject() {
    if (!project) return
    
    if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This will also delete all associated tasks.`)) {
      try {
        await deleteProject(project.id)
        navigate('/projects')
      } catch (error) {
        console.error('Error deleting project:', error)
        alert('Failed to delete project. You may not have permission.')
      }
    }
  }

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager'
  const isAdmin = user?.role === 'admin'

  return (
      <div>
        <button onClick={() => navigate('/projects')} className="mb-4 text-sm text-indigo-600 hover:underline">← К списку проектов</button>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <div className="flex gap-2">
            {isAdminOrManager && (
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showMembers ? 'Hide Members' : 'Manage Members'}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700"
              >
                Delete Project
              </button>
            )}
          </div>
        </div>

        {showMembers && id && (
          <div className="mb-6">
            <ProjectMembers projectId={id} />
          </div>
        )}

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
            <select
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                disabled={creating || loadingMembers}
            >
              <option value="">Выберите исполнителя</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.username}>
                  {member.username} ({member.email})
                </option>
              ))}
            </select>
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
                          projectMembers={projectMembers}
                          projectId={project.id}
                          onAttachmentChange={refreshProjects}
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