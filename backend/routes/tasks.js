const express = require('express');
const router = express.Router({ mergeParams: true });
const Project = require('../models/Project');
const Task = require('../models/Task');
const { isValidString, isValidTaskStatus, sanitizeString } = require('../utils/helpers');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const mongoose = require('mongoose');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const tasks = await Task.find({ project: projectId }).lean();
  
  const response = tasks.map(task => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    assignee: task.assignee,
    attachments: (task.attachments || []).map(att => ({
      id: att._id.toString(),
      filename: att.filename,
      originalName: att.originalName,
      mimetype: att.mimetype,
      size: att.size,
      uploadedAt: att.uploadedAt
    }))
  }));
  
  res.json(response);
}));

router.get('/:taskId', authenticate, asyncHandler(async (req, res) => {
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
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
    assignee: task.assignee,
    attachments: (task.attachments || []).map(att => ({
      id: att._id.toString(),
      filename: att.filename,
      originalName: att.originalName,
      mimetype: att.mimetype,
      size: att.size,
      uploadedAt: att.uploadedAt
    }))
  };
  
  res.json(response);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
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
    assignee: task.assignee,
    attachments: []
  };
  
  res.status(201).json(response);
}));

router.put('/:taskId', authenticate, asyncHandler(async (req, res) => {
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
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
    assignee: updatedTask.assignee,
    attachments: (updatedTask.attachments || []).map(att => ({
      id: att._id.toString(),
      filename: att.filename,
      originalName: att.originalName,
      mimetype: att.mimetype,
      size: att.size,
      uploadedAt: att.uploadedAt
    }))
  };
  
  res.json(response);
}));

router.delete('/:taskId', authenticate, asyncHandler(async (req, res) => {
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const deletedTask = await Task.findOneAndDelete({ _id: taskId, project: projectId }).lean();
  
  if (!deletedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Delete all associated files
  if (deletedTask.attachments && deletedTask.attachments.length > 0) {
    deletedTask.attachments.forEach(att => {
      const filePath = path.join(__dirname, '../uploads', att.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
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

/**
 * POST /api/projects/:projectId/tasks/:taskId/attachments
 * Upload file attachment to task (max 3 files per task, 10MB each)
 */
router.post('/:taskId/attachments', authenticate, upload.single('file'), asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const project = await Project.findById(projectId);
  if (!project) {
    // Delete uploaded file if project not found
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Project not found' });
  }

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const task = await Task.findOne({ _id: taskId, project: projectId });
  
  if (!task) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Task not found' });
  }

  // Check if task already has 3 attachments
  if (task.attachments && task.attachments.length >= 3) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Maximum 3 attachments per task allowed' });
  }

  // Add attachment info to task
  const attachment = {
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  };

  task.attachments.push(attachment);
  await task.save();

  const newAttachment = task.attachments[task.attachments.length - 1];

  res.status(201).json({
    id: newAttachment._id.toString(),
    filename: newAttachment.filename,
    originalName: newAttachment.originalName,
    mimetype: newAttachment.mimetype,
    size: newAttachment.size,
    uploadedAt: newAttachment.uploadedAt
  });
}));

/**
 * GET /api/projects/:projectId/tasks/:taskId/attachments/:attachmentId/download
 * Download file attachment
 */
router.get('/:taskId/attachments/:attachmentId/download', authenticate, asyncHandler(async (req, res) => {
  const { projectId, taskId, attachmentId } = req.params;
  
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const task = await Task.findOne({ _id: taskId, project: projectId });
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const attachment = task.attachments.id(attachmentId);
  
  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  const filePath = path.join(__dirname, '../uploads', attachment.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found on server' });
  }

  res.download(filePath, attachment.originalName);
}));

/**
 * DELETE /api/projects/:projectId/tasks/:taskId/attachments/:attachmentId
 * Delete file attachment
 */
router.delete('/:taskId/attachments/:attachmentId', authenticate, asyncHandler(async (req, res) => {
  const { projectId, taskId, attachmentId } = req.params;
  
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

  const isOwner = project.owner && project.owner.toString() === req.user.id;
  const isMember = project.members && project.members.some(memberId => 
    memberId.toString() === req.user.id
  );
  
  if (req.user.role === 'user' && !isOwner && !isMember) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const task = await Task.findOne({ _id: taskId, project: projectId });
  
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const attachment = task.attachments.id(attachmentId);
  
  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  // Delete file from filesystem
  const filePath = path.join(__dirname, '../uploads', attachment.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove attachment from task
  task.attachments.pull(attachmentId);
  await task.save();

  res.json({ message: 'Attachment deleted successfully' });
}));

module.exports = router;