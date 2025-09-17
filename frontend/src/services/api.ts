import type { Project, Task } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status)
  }

  return response.json()
}

// Projects API
export const projectsApi = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    return fetchApi('/projects')
  },

  // Get single project
  async getById(id: string): Promise<Project> {
    return fetchApi(`/projects/${id}`)
  },

  // Create new project
  async create(name: string): Promise<Project> {
    return fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  // Update project
  async update(id: string, name: string): Promise<Project> {
    return fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  // Delete project
  async delete(id: string): Promise<Project> {
    return fetchApi(`/projects/${id}`, {
      method: 'DELETE',
    })
  },
}

// Tasks API
export const tasksApi = {
  // Get all tasks for a project
  async getAll(projectId: string): Promise<Task[]> {
    return fetchApi(`/projects/${projectId}/tasks`)
  },

  // Get single task
  async getById(projectId: string, taskId: string): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`)
  },

  // Create new task
  async create(projectId: string, task: Omit<Task, 'id'>): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    })
  },

  // Update task
  async update(projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  // Delete task
  async delete(projectId: string, taskId: string): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
}

export { ApiError }