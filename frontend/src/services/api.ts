import type { Project, Task, User, ProjectMember, LoginCredentials, RegisterData, AuthTokens } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiError extends Error {
  status: number
  code?: string
  
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

// Token management
let accessToken: string | null = localStorage.getItem('accessToken')
let refreshToken: string | null = localStorage.getItem('refreshToken')
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

export function setTokens(tokens: AuthTokens | null) {
  if (tokens) {
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
  } else {
    accessToken = null
    refreshToken = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export function getAccessToken(): string | null {
  return accessToken
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) {
    throw new ApiError('No refresh token available', 401)
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    setTokens(null)
    throw new ApiError('Session expired. Please login again.', 401)
  }

  const data = await response.json()
  setTokens(data.tokens)
  return data.tokens.accessToken
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (accessToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  let response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle token expiration
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const errorData = await response.json().catch(() => ({}))
    
    if (errorData.code === 'TOKEN_EXPIRED') {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const newToken = await refreshAccessToken()
          isRefreshing = false
          onRefreshed(newToken)
          
          // Retry the original request with new token
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(url, {
            ...options,
            headers,
          })
        } catch (error) {
          isRefreshing = false
          throw error
        }
      } else {
        // Wait for token refresh to complete
        const newToken = await new Promise<string>((resolve) => {
          addRefreshSubscriber(resolve)
        })
        
        // Retry with new token
        headers['Authorization'] = `Bearer ${newToken}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(
      errorData.message || `HTTP ${response.status}`, 
      response.status,
      errorData.code
    )
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

export const usersApi = {
  async getAll(): Promise<User[]> {
    return fetchApi('/users')
  },

  async getById(id: string): Promise<User> {
    return fetchApi(`/users/${id}`)
  },

  async updateRole(userId: string, role: string): Promise<User> {
    return fetchApi(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  },
}

export const projectMembersApi = {
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    return fetchApi(`/projects/${projectId}/members`)
  },

  async addMember(projectId: string, userId: string): Promise<Project> {
    return fetchApi(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },

  async removeMember(projectId: string, userId: string): Promise<Project> {
    return fetchApi(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    })
  },
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    setTokens(result.tokens)
    return result
  },

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    setTokens(result.tokens)
    return result
  },

  async logout(): Promise<void> {
    try {
      await fetchApi('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    } finally {
      setTokens(null)
    }
  },

  async getCurrentUser(): Promise<User> {
    return fetchApi('/auth/me')
  },

  async updateProfile(updates: Partial<Pick<User, 'username' | 'email'>>): Promise<User> {
    return fetchApi('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return fetchApi('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

export { ApiError }