const { generateId } = require('../utils/helpers');

const projects = [
  {
    id: 'proj_1758306032508_uykqi95ei',
    name: 'Demo Project',
    tasks: [
      { 
        id: 'task_1758306032508_k5gv4uxpy',
        title: 'Настроить окружение', 
        description: 'Инициализировать проект', 
        assignee: 'Иван', 
        status: 'todo' 
      },
      { 
        id: 'task_1758306032508_5v37nftpc',
        title: 'Сверстать карточки', 
        description: 'Tailwind классы', 
        assignee: 'Мария', 
        status: 'in_progress' 
      },
      { 
        id: 'task_1758306032508_n451d4kfk',
        title: 'Сборка Docker', 
        description: 'Nginx образ', 
        assignee: '', 
        status: 'done' 
      }
    ]
  }
];

const projectsData = {
  getAll() {
    return projects;
  },

  getById(id) {
    return projects.find(p => p.id === id);
  },

  create(projectData) {
    const project = { 
      id: generateId('proj'), 
      ...projectData,
      tasks: []
    };
    projects.unshift(project);
    return project;
  },

  update(id, updates) {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    projects[index] = { ...projects[index], ...updates };
    return projects[index];
  },

  delete(id) {
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    return projects.splice(index, 1)[0];
  }
};

const tasksData = {
  getAll(projectId) {
    const project = projectsData.getById(projectId);
    return project ? project.tasks : null;
  },

  getById(projectId, taskId) {
    const project = projectsData.getById(projectId);
    if (!project) return null;
    
    return project.tasks.find(t => t.id === taskId);
  },

  create(projectId, taskData) {
    const project = projectsData.getById(projectId);
    if (!project) return null;
    
    const task = {
      id: generateId('task'),
      ...taskData
    };
    
    project.tasks.push(task);
    return task;
  },

  update(projectId, taskId, updates) {
    const project = projectsData.getById(projectId);
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    project.tasks[taskIndex] = { ...project.tasks[taskIndex], ...updates };
    return project.tasks[taskIndex];
  },

  delete(projectId, taskId) {
    const project = projectsData.getById(projectId);
    if (!project) return null;
    
    const taskIndex = project.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    return project.tasks.splice(taskIndex, 1)[0];
  }
};

module.exports = {
  projectsData,
  tasksData
};