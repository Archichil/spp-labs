import { useState } from "react"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type PageKey = "home" | "projects" | "profile" | "admin" | "login" | "register"

export default function Nav() {
  const [hovered, setHovered] = useState<PageKey | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (key: PageKey) => {
    const path = location.pathname
    if (key === 'home') return path === '/'
    if (key === 'projects') return path.startsWith('/projects')
    if (key === 'profile') return path.startsWith('/profile')
    if (key === 'admin') return path.startsWith('/admin')
    if (key === 'login') return path === '/login'
    if (key === 'register') return path === '/register'
    return false
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const item = (key: PageKey, label: string, path: string) => (
    <Link
      key={key}
      to={path}
      onMouseEnter={() => setHovered(key)}
      onMouseLeave={() => setHovered(null)}
      className={
        `mr-2 rounded-md px-3 py-1.5 border text-sm transition-colors ` +
        (isActive(key)
          ? `border-indigo-500 bg-indigo-50 text-indigo-700`
          : hovered === key
            ? `border-gray-300 bg-gray-100`
            : `border-gray-300 bg-white`)
      }
    >
      {label}
    </Link>
  )

  return (
    <nav className="mb-4 flex items-center justify-between">
      <div className="flex items-center">
        {item("home", "Главная", "/")}
        {isAuthenticated && item("projects", "Проекты", "/projects")}
        {isAuthenticated && item("profile", "Профиль", "/profile")}
        {isAuthenticated && user?.role === 'admin' && item("admin", "Users", "/admin/users")}
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.username}</span>
              {' '}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                user?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-1.5 border border-red-300 bg-white text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {item("login", "Login", "/login")}
            {item("register", "Register", "/register")}
          </>
        )}
      </div>
    </nav>
  )
}


