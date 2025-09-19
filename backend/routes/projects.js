const express = require('express');
const router = express.Router();
const { projectsData } = require('../data/storage');
const { isValidString, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/projects
 */
router.get('/', asyncHandler(async (req, res) => {
  const projects = projectsData.getAll();
  res.json(projects);
}));

/**
 * GET /api/projects/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = projectsData.getById(id);
  
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(project);
}));

/**
 * POST /api/projects
 */
router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const projectData = {
    name: sanitizeString(name)
  };
  
  const project = projectsData.create(projectData);
  res.status(201).json(project);
}));

/**
 * PUT /api/projects/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!isValidString(name)) {
    return res.status(400).json({ message: 'Project name is required' });
  }
  
  const updates = {
    name: sanitizeString(name)
  };
  
  const updatedProject = projectsData.update(id, updates);
  
  if (!updatedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(updatedProject);
}));

/**
 * DELETE /api/projects/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedProject = projectsData.delete(id);
  
  if (!deletedProject) {
    return res.status(404).json({ message: 'Project not found' });
  }
  
  res.json(deletedProject);
}));

module.exports = router;