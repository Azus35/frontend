// backend/controllers/authController.js
const db = require('../firestore');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  // Validaciones
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Formato de email inválido' });
  }

  try {
    // Verificar si el usuario ya existe
    const userRef = db.collection('USERS').where('email', '==', email);
    const snapshot = await userRef.get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const userId = uuidv4();
    await db.collection('USERS').doc(userId).set({
      email,
      username,
      password: hashedPassword,
      rol: 'user', // Rol por defecto
      last_login: new Date(),
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// backend/controllers/authController.js
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    // Buscar el usuario en Firestore
    const userRef = db.collection('USERS').where('email', '==', email);
    const snapshot = await userRef.get();
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar token JWT (expira en 10 minutos)
    const token = jwt.sign({ userId: userDoc.id }, 'secretKey', { expiresIn: '10m' });

    // Devolver el token y el ID del usuario
    res.status(200).json({ token, userId: userDoc.id, username: user.username});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const createTask = async (req, res) => {
  const { nameTask, description, category, deadline, status, userId } = req.body;

  // Validaciones
  if (!nameTask || !description || !category || !deadline || !status || !userId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Crear la tarea en Firestore
    const taskRef = await db.collection('TASK').add({
      NameTask: nameTask,
      Description: description,
      Category: category,
      DeadLine: new Date(deadline),
      Status: status,
      IdUser: userId,
    });

    res.status(201).json({ message: 'Tarea creada exitosamente', taskId: taskRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getTasksByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Obtener las tareas del usuario desde Firestore
    const tasksRef = db.collection('TASK').where('IdUser', '==', userId);
    const snapshot = await tasksRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron tareas' });
    }

    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        nameTask: doc.data().NameTask,
        status: doc.data().Status,
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { registerUser, loginUser, createTask, getTasksByUser};