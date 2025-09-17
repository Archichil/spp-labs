import { useState } from 'react'
import ProjectList from '../components/ProjectList'
import { useProjects } from '../context/ProjectsContext'

export default function Projects() {
  const { projects, createProject } = useProjects()
  const [name, setName] = useState('')

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createProject(name.trim())
    setName('')
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Проекты</h2>
      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Название проекта" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700" type="submit">Создать</button>
      </form>
      <ProjectList projects={projects} onOpen={() => {}} />
    </section>
  )
}


