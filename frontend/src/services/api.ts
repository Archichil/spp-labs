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

export const projectsApi = {
  async getAll(): Promise<Project[]> {
    return fetchApi('/projects')
  },

  async getById(id: string): Promise<Project> {
    return fetchApi(`/projects/${id}`)
  },

  async create(name: string): Promise<Project> {
    return fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  },

  async update(id: string, name: string): Promise<Project> {
    return fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  },

  async delete(id: string): Promise<Project> {
    return fetchApi(`/projects/${id}`, {
      method: 'DELETE',
    })
  },
}

export const tasksApi = {
  async getAll(projectId: string): Promise<Task[]> {
    return fetchApi(`/projects/${projectId}/tasks`)
  },

  async getById(projectId: string, taskId: string): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`)
  },

  async create(projectId: string, task: Omit<Task, 'id'>): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    })
  },

  async update(projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  async delete(projectId: string, taskId: string): Promise<Task> {
    return fetchApi(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },
}

export { ApiError }