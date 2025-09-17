import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Project, Task } from '../types'
import { generateId } from '../utils/id'

interface ProjectsContextValue {
  projects: Project[]
  createProject: (name: string) => Project
  updateProject: (project: Project) => void
  addTask: (projectId: string, task: Omit<Task, 'id'>) => Task
  updateTask: (projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => void
  deleteTask: (projectId: string, taskId: string) => void
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined)

const STORAGE_KEY = 'app-projects'

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    const demoId = generateId('proj')
    return [
      {
        id: demoId,
        name: 'Demo Project',
        tasks: [
          { id: generateId('task'), title: 'Настроить окружение', description: 'Инициализировать проект', assignee: 'Иван', status: 'todo' },
          { id: generateId('task'), title: 'Сверстать карточки', description: 'Tailwind классы', assignee: 'Мария', status: 'in_progress' },
          { id: generateId('task'), title: 'Сборка Docker', description: 'Nginx образ', assignee: '', status: 'done' },
        ]
      }
    ]
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    } catch {}
  }, [projects])

  const value = useMemo<ProjectsContextValue>(() => ({
    projects,
    createProject: (name: string) => {
      const project: Project = { id: generateId('proj'), name: name.trim() || 'Новый проект', tasks: [] }
      setProjects(prev => [project, ...prev])
      return project
    },
    updateProject: (project: Project) => {
      setProjects(prev => prev.map(p => (p.id === project.id ? project : p)))
    },
    addTask: (projectId, taskInput) => {
      const task: Task = { id: generateId('task'), ...taskInput }
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p))
      return task
    },
    updateTask: (projectId, taskId, updates) => {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } as Task : t)
      } : p))
    },
    deleteTask: (projectId, taskId) => {
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        tasks: p.tasks.filter(t => t.id !== taskId)
      } : p))
    }
  }), [projects])

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  )
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}


