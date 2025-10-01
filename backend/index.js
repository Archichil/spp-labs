require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB } = require('./config/database');
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Project Management API Server',
    version: '2.0.0',
    database: 'MongoDB',
    endpoints: {
      projects: '/api/projects',
      tasks: '/api/projects/:projectId/tasks'
    }
  });
});

app.use('/api/projects', projectsRoutes);
app.use('/api/projects/:projectId/tasks', tasksRoutes);
app.use('*', notFoundHandler);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Projects API: http://localhost:${PORT}/api/projects`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: MongoDB`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();