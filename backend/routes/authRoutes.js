// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, createTask, getTasksByUser } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/tasks', createTask);
router.get('/tasks/:userId', getTasksByUser);

module.exports = router;