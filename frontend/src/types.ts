import type { TaskStatus } from './utils/tasks'

export interface Task {
  id: string
  title: string
  description: string
  assignee: string
  status: TaskStatus
}

export interface Project {
  id: string
  name: string
  tasks: Task[]
}


