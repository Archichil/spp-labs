import React, { useState } from 'react'
import ProjectList from '../components/ProjectList'
import { useProjects } from '../context/ProjectsContext'
import { useAuth } from '../context/AuthContext'

export default function Projects() {
  const { projects, createProject, loading, error } = useProjects()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const canCreateProject = user?.role === 'admin' || user?.role === 'manager'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || creating) return
    
    try {
      setCreating(true)
      await createProject(name.trim())
      setName('')
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-xl font-semibold">Projects</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h2 className="mb-3 text-xl font-semibold">Projects</h2>
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="text-red-800">Loading error: {error}</div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Projects</h2>
      {canCreateProject && (
        <form onSubmit={handleCreate} className="mb-4 flex gap-2">
          <input 
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" 
            placeholder="Project name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            disabled={creating}
          />
          <button 
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed" 
            type="submit"
            disabled={creating || !name.trim()}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}
      <ProjectList projects={projects} onOpen={() => {}} />
    </section>
  )
}


