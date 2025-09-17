# Project Management API Server

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks

- `GET /api/projects/:projectId/tasks` - Get all tasks for a project
- `GET /api/projects/:projectId/tasks/:taskId` - Get a specific task
- `POST /api/projects/:projectId/tasks` - Create a new task
- `PUT /api/projects/:projectId/tasks/:taskId` - Update a task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete a task

## Data Models

### Project
```json
{
  "id": "string",
  "name": "string",
  "tasks": [Task]
}
```

### Task
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "assignee": "string",
  "status": "todo" | "in_progress" | "done"
}
```

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker build -t backend .
docker run -p 3000:3000 backend
```

### Docker Compose
```bash
docker-compose up
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:5173)