const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Helper function to generate IDs
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Project Management API Server is running', version: '1.0.0' });
});

// In-memory storage (replace with database in production)
const projects = [
  {
    id: generateId('proj'),
    name: 'Demo Project',
    tasks: [
      { 
        id: generateId('task'), 
        title: 'Настроить окружение', 
        description: 'Инициализировать проект', 
        assignee: 'Иван', 
        status: 'todo' 
      },
      { 
        id: generateId('task'), 
        title: 'Сверстать карточки', 
        description: 'Tailwind классы', 
        assignee: 'Мария', 
        status: 'in_progress' 
      },
      { 
        id: generateId('task'), 
        title: 'Сборка Docker', 
        description: 'Nginx образ', 
        assignee: '', 
        status: 'done' 
      }
    ]
  }
];

// Projects CRUD API
app.get('/api/projects', (req, res) => {
  try {
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    
    const project = { 
      id: generateId('proj'), 
      name: name.trim(),
      tasks: []
    };
    projects.unshift(project);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    
    projects[index] = { ...projects[index], name: name.trim() };
    res.json(projects[index]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const deletedProject = projects.splice(index, 1)[0];
    res.json(deletedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// Tasks CRUD API (within projects)
app.get('/api/projects/:projectId/tasks', (req, res) => {
  try {
    const { projectId } = req.params;
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project.tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

app.get('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

app.post('/api/projects/:projectId/tasks', (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignee, status } = req.body;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: todo, in_progress, done' });
    }
    
    const task = {
      id: generateId('task'),
      title: title.trim(),
      description: description?.trim() || '',
      assignee: assignee?.trim() || '',
      status: status || 'todo'
    };
    
    project.tasks.push(task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

app.put('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, assignee, status } = req.body;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: todo, in_progress, done' });
    }
    
    const updatedTask = {
      ...project.tasks[taskIndex],
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(assignee !== undefined && { assignee: assignee.trim() }),
      ...(status !== undefined && { status })
    };
    
    if (updatedTask.title.length === 0) {
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }
    
    project.tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

app.delete('/api/projects/:projectId/tasks/:taskId', (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const deletedTask = project.tasks.splice(taskIndex, 1)[0];
    res.json(deletedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`📁 Projects API: http://localhost:${PORT}/api/projects`);
  console.log(`📋 Demo project with tasks is available`);
});