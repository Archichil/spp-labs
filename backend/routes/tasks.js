const express = require('express');
const router = express.Router({ mergeParams: true });
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isValidString, isValidTaskStatus, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

/**
 * GET /api/projects/:projectId/tasks
 */
router.get('/', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const tasks = await Task.find({ project: projectId }).lean();
  
  const response = tasks.map(task => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    assignee: task.assignee
  }));
  
  res.json(response);
}));

/**
 * GET /api/projects/:projectId/tasks/:taskId
 */
router.get('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const task = await Task.findOne({ _id: taskId, project: projectId }).lean();
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const response = {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    assignee: task.assignee
  };
  
  res.json(response);
}));

/**
 * POST /api/projects/:projectId/tasks
 */
router.post('/', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignee, status } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!isValidString(title)) {
    return res.status(400).json({ message: 'Task title is required' });
  }
  
  if (status && !isValidTaskStatus(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be one of: todo, in_progress, done' 
    });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const taskData = {
    title: sanitizeString(title),
    description: sanitizeString(description),
    assignee: sanitizeString(assignee),
    status: status || 'todo',
    project: projectId
  };
  
  const task = await Task.create(taskData);
  
  const response = {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    assignee: task.assignee
  };
  
  res.status(201).json(response);
}));

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 */
router.put('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, assignee, status } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  if (status && !isValidTaskStatus(status)) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be one of: todo, in_progress, done' 
    });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
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
  
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, project: projectId },
    updates,
    { new: true, runValidators: true }
  ).lean();
  
  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const response = {
    id: updatedTask._id.toString(),
    title: updatedTask.title,
    description: updatedTask.description,
    status: updatedTask.status,
    assignee: updatedTask.assignee
  };
  
  res.json(response);
}));

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
router.delete('/:taskId', asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  const deletedTask = await Task.findOneAndDelete({ _id: taskId, project: projectId }).lean();
  
  if (!deletedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  const response = {
    id: deletedTask._id.toString(),
    title: deletedTask.title,
    description: deletedTask.description,
    status: deletedTask.status,
    assignee: deletedTask.assignee
  };
  
  res.json(response);
}));

module.exports = router;