import { useState } from "react"
import { Link, useLocation } from 'react-router-dom'

type PageKey = "home" | "projects" | "profile"

export default function Nav() {
  const [hovered, setHovered] = useState<PageKey | null>(null)
  const location = useLocation()

  const isActive = (key: PageKey) => {
    const path = location.pathname
    if (key === 'home') return path === '/'
    if (key === 'projects') return path.startsWith('/projects')
    if (key === 'profile') return path.startsWith('/profile')
    return false
  }

  const item = (key: PageKey, label: string) => (
    <Link
      key={key}
      to={key === 'home' ? '/' : key === 'projects' ? '/projects' : '/profile'}
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
    <nav className="mb-4">
      {item("home", "Главная")}
      {item("projects", "Проекты")}
      {item("profile", "Профиль")}
    </nav>
  )
}


