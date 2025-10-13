import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, getAccessToken } from '../services/api'
import type { User, AuthContextType, LoginCredentials, RegisterData } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in on mount
    const initAuth = async () => {
      const token = getAccessToken()
      console.log('InitAuth: Token exists?', !!token)
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser()
          console.log('InitAuth: Fetched user:', currentUser)
          setUser(currentUser)
        } catch (error) {
          console.error('Failed to fetch current user:', error)
          // Token might be invalid, clear it
          await authApi.logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const { user } = await authApi.login(credentials)
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const { user } = await authApi.register(data)
      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Pick<User, 'username' | 'email'>>) => {
    const updatedUser = await authApi.updateProfile(updates)
    setUser(updatedUser)
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
