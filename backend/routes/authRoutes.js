// backend/routes/authRoutes.js
const express = require('express');
const {
  registerUser,
  loginUser,
  createTask,
  getTasksByGroup,
  deleteTask,
  updateTask,
  createGroup,
  addMemberToGroup,
  getUsers,
  getGroupsByUser,
  getTasksByUser,
  getGroupTasks,
  updateUser,
} = require('../controllers/authController');

const router = express.Router();

// Rutas existentes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/tasks', createTask);
router.get('/tasks/:selectedGroup', getTasksByGroup);
router.get('/task/:userId', getTasksByUser);
router.delete('/tasks/:taskId', deleteTask);
router.put('/tasks/:taskId', updateTask);
router.get('/users/:userId', getUsers)
router.post('/groups', createGroup);
router.get('/groups/:userId', getGroupsByUser);
router.post('/groups/:groupId/members/:userId', addMemberToGroup);
router.get('/groups/:groupId/tasks', getGroupTasks);
router.put('/users/:userId', updateUser);

module.exports = router;