const express = require('express');
const cors = require('cors');

const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    version: '1.0.0',
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

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api/projects`);
  console.log(`Env: ${process.env.NODE_ENV || 'development'}`);
});