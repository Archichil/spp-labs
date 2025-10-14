import type { TaskStatus } from './utils/tasks'

export interface TaskAttachment {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  uploadedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: TaskStatus
  attachments?: TaskAttachment[]
}

export type UserRole = 'user' | 'manager' | 'admin'

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface ProjectMember {
  id: string
  username: string
  email: string
  role: UserRole
}

export interface Project {
  id: string
  name: string
  description?: string
  owner?: {
    id: string
    username: string
    email: string
  }
  members?: ProjectMember[]
  tasks: Task[]
}

export interface LoginCredentials {
  username?: string
  email?: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  role?: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Pick<User, 'username' | 'email'>>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
}


