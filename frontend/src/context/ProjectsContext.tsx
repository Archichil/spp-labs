import React, {createContext, useContext, useEffect, useMemo, useState} from 'react'
import type { Project, Task } from '../types'
import { projectsApi, tasksApi, ApiError } from '../services/api'

interface ProjectsContextValue {
  projects: Project[]
  loading: boolean
  error: string | null
  createProject: (name: string) => Promise<Project>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  addTask: (projectId: string, task: Omit<Task, 'id'>) => Promise<Task>
  updateTask: (projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>
  deleteTask: (projectId: string, taskId: string) => Promise<void>
  refreshProjects: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextValue | undefined>(undefined)

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectsApi.getAll()
      setProjects(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load projects'
      setError(errorMessage)
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const value = useMemo<ProjectsContextValue>(() => ({
    projects,
    loading,
    error,
    
    createProject: async (name: string) => {
      try {
        setError(null)
        const project = await projectsApi.create(name)
        setProjects(prev => [project, ...prev])
        return project
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to create project'
        setError(errorMessage)
        throw err
      }
    },
    
    updateProject: async (updatedProject: Project) => {
      try {
        setError(null)
        await projectsApi.update(updatedProject.id, updatedProject.name)
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to update project'
        setError(errorMessage)
        throw err
      }
    },
    
    deleteProject: async (projectId: string) => {
      try {
        setError(null)
        await projectsApi.delete(projectId)
        setProjects(prev => prev.filter(p => p.id !== projectId))
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete project'
        setError(errorMessage)
        throw err
      }
    },
    
    addTask: async (projectId: string, taskInput: Omit<Task, 'id'>) => {
      try {
        setError(null)
        const task = await tasksApi.create(projectId, taskInput)
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p
        ))
        return task
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to create task'
        setError(errorMessage)
        throw err
      }
    },
    
    updateTask: async (projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
      try {
        setError(null)
        const updatedTask = await tasksApi.update(projectId, taskId, updates)
        setProjects(prev => prev.map(p => 
          p.id === projectId ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? updatedTask : t)
          } : p
        ))
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to update task'
        setError(errorMessage)
        throw err
      }
    },
    
    deleteTask: async (projectId: string, taskId: string) => {
      try {
        setError(null)
        await tasksApi.delete(projectId, taskId)
        setProjects(prev => prev.map(p => 
          p.id === projectId ? {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          } : p
        ))
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to delete task'
        setError(errorMessage)
        throw err
      }
    },
    
    refreshProjects: loadProjects
  }), [projects, loading, error])

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  )
}

export function useProjects(): ProjectsContextValue {
  const ctx = useContext(ProjectsContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider')
  return ctx
}