import type { Project } from '../types'

export interface ProjectCardProps {
  project: Project
  onOpen: (projectId: string) => void
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <button
      onClick={() => onOpen(project.id)}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow transition-shadow"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{project.name}</h3>
        <span className="text-sm text-gray-500">{project.tasks.length} задач</span>
      </div>
    </button>
  )
}


