import { useMemo, useState } from 'react'
import './App.css'
import Nav from './components/Nav'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import type { Project } from './types'
import { generateId } from './utils/id'
import ProjectBoard from './pages/ProjectBoard'

type PageKey = 'home' | 'projects' | 'profile'

function App() {
  const [page, setPage] = useState<PageKey>('home')
  const [projects, setProjects] = useState<Project[]>(() => {
    const p1Id = generateId('proj')
    return [
      {
        id: p1Id,
        name: 'Demo Project',
        tasks: [
          { id: generateId('task'), title: 'Настроить окружение', description: 'Инициализировать проект', assignee: 'Иван', status: 'todo' },
          { id: generateId('task'), title: 'Сверстать карточки', description: 'Tailwind классы', assignee: 'Мария', status: 'in_progress' },
          { id: generateId('task'), title: 'Сборка Docker', description: 'Nginx образ', assignee: '—', status: 'done' },
        ]
      }
    ]
  })
  const [openedProjectId, setOpenedProjectId] = useState<string | null>(null)

  const openedProject = useMemo(() => projects.find(p => p.id === openedProjectId) || null, [projects, openedProjectId])

  function handleOpenProject(projectId: string) {
    setOpenedProjectId(projectId)
  }

  function handleUpdateProject(updated: Project) {
    setProjects(prev => prev.map(p => (p.id === updated.id ? updated : p)))
  }

  function handleBackToProjects() {
    setOpenedProjectId(null)
  }

  return (
    <div className="p-4">
      <Nav current={page} onChange={(p) => { setPage(p); if (p !== 'projects') setOpenedProjectId(null) }} />
      {page === 'home' && <Home />}
      {page === 'projects' && (
        openedProject ? (
          <ProjectBoard project={openedProject} onBack={handleBackToProjects} onUpdateProject={handleUpdateProject} />
        ) : (
          <Projects projects={projects} onOpen={handleOpenProject} />
        )
      )}
      {page === 'profile' && <Profile />}
    </div>
  )
}

export default App