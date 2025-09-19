function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isValidTaskStatus(status) {
  const validStatuses = ['todo', 'in_progress', 'done'];
  return validStatuses.includes(status);
}

function isValidString(value) {
  return value && typeof value === 'string' && value.trim().length > 0;
}

function sanitizeString(value) {
  return value && typeof value === 'string' ? value.trim() : '';
}

module.exports = {
  generateId,
  isValidTaskStatus,
  isValidString,
  sanitizeString
};