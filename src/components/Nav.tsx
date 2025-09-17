import { useState } from "react"

type PageKey = "home" | "projects" | "profile"

export interface NavProps {
  current: PageKey
  onChange: (page: PageKey) => void
}

export default function Nav({ current, onChange }: NavProps) {
  const [hovered, setHovered] = useState<PageKey | null>(null)

  const item = (key: PageKey, label: string) => (
    <button
      key={key}
      onClick={() => onChange(key)}
      onMouseEnter={() => setHovered(key)}
      onMouseLeave={() => setHovered(null)}
      className={
        `mr-2 rounded-md px-3 py-1.5 border text-sm transition-colors ` +
        (current === key
          ? `border-indigo-500 bg-indigo-50 text-indigo-700`
          : hovered === key
            ? `border-gray-300 bg-gray-100`
            : `border-gray-300 bg-white`)
      }
    >
      {label}
    </button>
  )

  return (
    <nav className="mb-4">
      {item("home", "Главная")}
      {item("projects", "Проекты")}
      {item("profile", "Профиль")}
    </nav>
  )
}


