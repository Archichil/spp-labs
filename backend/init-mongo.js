db = db.getSiblingDB('project-management');

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['login', 'password', 'role'],
      properties: {
        login: {
          bsonType: 'string',
          description: 'Login must be a string and is required'
        },
        password: {
          bsonType: 'string',
          description: 'Password must be a string and is required'
        },
        role: {
          enum: ['admin', 'manager', 'developer', 'viewer'],
          description: 'Role must be one of the specified values'
        }
      }
    }
  }
});

db.createCollection('projects', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Project name must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'Description must be a string'
        },
        participants: {
          bsonType: 'array',
          description: 'Participants must be an array of user IDs'
        }
      }
    }
  }
});

db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'status', 'project'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Task title must be a string and is required'
        },
        description: {
          bsonType: 'string',
          description: 'Description must be a string'
        },
        status: {
          enum: ['todo', 'in_progress', 'done'],
          description: 'Status must be one of the specified values'
        },
        assignee: {
          bsonType: 'string',
          description: 'Assignee must be a string'
        },
        project: {
          bsonType: 'objectId',
          description: 'Project must be an ObjectId reference'
        }
      }
    }
  }
});

db.users.createIndex({ login: 1 }, { unique: true });
db.projects.createIndex({ name: 1 });
db.projects.createIndex({ createdAt: -1 });
db.tasks.createIndex({ project: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ project: 1, status: 1 });
