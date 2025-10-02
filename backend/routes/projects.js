const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isValidString, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

/**
 * GET /api/projects
 */
router.get('/', asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .sort({ createdAt: -1 })
    .lean();
  
  // Get tasks for each project
  for (const project of projects) {
    const tasks = await Task.find({ project: project._id }).lean();
    project.id = project._id.toString();
    project.tasks = tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee
    }));
    delete project._id;
    delete project.__v;
  }
  
  res.json(projects);
}));

/**
 * GET /api/projects/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const project = await Project.findById(id).lean();
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Get tasks for this project
  const tasks = await Task.find({ project: project._id }).lean();
  
  const response = {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    participants: project.participants,
    tasks: tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee
    }))
  };
  
  res.json(response);
}));

/**
 * POST /api/projects
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, participants } = req.body;
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const projectData = {
    name: sanitizeString(name),
    description: sanitizeString(description),
    participants: participants || []
  };
  
  const project = await Project.create(projectData);
  
  const response = {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    participants: project.participants,
    tasks: []
  };
  
  res.status(201).json(response);
}));

/**
 * PUT /api/projects/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, participants } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const updates = {
    name: sanitizeString(name)
  };
  
  if (description !== undefined) {
    updates.description = sanitizeString(description);
  }
  
  if (participants !== undefined) {
    updates.participants = participants;
  }
  
  const updatedProject = await Project.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).lean();
  
  if (!updatedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Get tasks for this project
  const tasks = await Task.find({ project: updatedProject._id }).lean();
  
  const response = {
    id: updatedProject._id.toString(),
    name: updatedProject.name,
    description: updatedProject.description,
    participants: updatedProject.participants,
    tasks: tasks.map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      assignee: task.assignee
    }))
  };
  
  res.json(response);
}));

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const deletedProject = await Project.findByIdAndDelete(id).lean();
  
  if (!deletedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  // Delete all tasks associated with this project
  await Task.deleteMany({ project: id });
  
  const response = {
    id: deletedProject._id.toString(),
    name: deletedProject.name,
    description: deletedProject.description,
    participants: deletedProject.participants
  };
  
  res.json(response);
}));

module.exports = router;