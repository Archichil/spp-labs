import type { Task } from '../types'

export interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-1 text-sm font-medium">{task.title}</div>
      <div className="mb-2 text-xs text-gray-600">{task.description}</div>
      <div className="text-xs text-gray-500">Исполнитель: {task.assignee || 'Неизвестно'}</div>
    </div>
  )
}


