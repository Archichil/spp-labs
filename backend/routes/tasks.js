const express = require('express');
const router = express.Router({ mergeParams: true });
const { tasksData } = require('../data/storage');
const { isValidString, isValidTaskStatus, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/projects/:projectId/tasks
 */
router.get('/', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const tasks = tasksData.getAll(projectId);
  
  if (tasks === null) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(tasks);
}));

/**
 * GET /api/projects/:projectId/tasks/:taskId
 */
router.get('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const task = tasksData.getById(projectId, taskId);
  
  if (!task) {
    const tasks = tasksData.getAll(projectId);
    if (tasks === null) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(404).json({ message: 'Task not found' });
  }
  
  res.json(task);
}));

/**
 * POST /api/projects/:projectId/tasks
 */
router.post('/', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignee, status } = req.body;
  
  if (!isValidString(title)) {
    return res.status(400).json({ message: 'Task title is required' });
  }
  
  if (status && !isValidTaskStatus(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be one of: todo, in_progress, done' 
    });
  }
  
  const taskData = {
    title: sanitizeString(title),
    description: sanitizeString(description),
    assignee: sanitizeString(assignee),
    status: status || 'todo'
  };
  
  const task = tasksData.create(projectId, taskData);
  
  if (!task) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.status(201).json(task);
}));

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 */
router.put('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignee, status } = req.body;
  
  if (status && !isValidTaskStatus(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be one of: todo, in_progress, done' 
    });
  }
  
  const updates = {};
  
  if (title !== undefined) {
    if (!isValidString(title)) {
      return res.status(400).json({ message: 'Task title cannot be empty' });
    }
    updates.title = sanitizeString(title);
  }
  
  if (description !== undefined) {
    updates.description = sanitizeString(description);
  }
  
  if (assignee !== undefined) {
    updates.assignee = sanitizeString(assignee);
  }
  
  if (status !== undefined) {
    updates.status = status;
  }
  
  const updatedTask = tasksData.update(projectId, taskId, updates);
  
  if (!updatedTask) {
    const tasks = tasksData.getAll(projectId);
    if (tasks === null) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(404).json({ message: 'Task not found' });
  }
  
  res.json(updatedTask);
}));

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
router.delete('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const deletedTask = tasksData.delete(projectId, taskId);
  
  if (!deletedTask) {
    const tasks = tasksData.getAll(projectId);
    if (tasks === null) {
      return res.status(404).json({ message: 'Project not found' });
    }
    return res.status(404).json({ message: 'Task not found' });
  }
  
  res.json(deletedTask);
}));

module.exports = router;