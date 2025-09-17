import type { Project } from '../types'
import ProjectCard from './ProjectCard'

export interface ProjectListProps {
  projects: Project[]
  onOpen: (projectId: string) => void
}

export default function ProjectList({ projects, onOpen }: ProjectListProps) {
  if (!projects.length) {
    return <p className="text-gray-500">Проекты отсутствуют</p>
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} onOpen={onOpen} />
      ))}
    </div>
  )
}


