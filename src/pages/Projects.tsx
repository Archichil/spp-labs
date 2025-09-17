import type { Project } from '../types'
import ProjectList from '../components/ProjectList'

export interface ProjectsProps {
  projects: Project[]
  onOpen: (projectId: string) => void
}

export default function Projects({ projects, onOpen }: ProjectsProps) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Проекты</h2>
      <ProjectList projects={projects} onOpen={onOpen} />
    </section>
  )
}


