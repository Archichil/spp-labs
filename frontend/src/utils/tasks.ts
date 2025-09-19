export type TaskStatus = "todo" | "in_progress" | "done"

export interface TaskItem {
  id: string
  title: string
  status: TaskStatus
}


