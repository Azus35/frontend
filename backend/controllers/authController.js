// backend/controllers/authController.js
const db = require('../firestore');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const handleResponse = (res, statusCode, message, data = null) => {
  if (data) {
    res.status(statusCode).json({ message, data });
  } else {
    res.status(statusCode).json({ message });
  }
};

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
  const { nameTask, description, category, deadline, status, userId, group } = req.body;

  // Validaciones
  if (!nameTask || !description || !category || !deadline || !status || !userId) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, excepto el grupo' });
  }

  try {
    // Crear el objeto de la tarea
    const taskData = {
      NameTask: nameTask,
      Description: description,
      Category: category,
      DeadLine: new Date(deadline),
      Status: status,
      IdUser: userId
    };

    // Agregar la propiedad 'Group' solo si está presente en el cuerpo de la solicitud
    if (group) {
      taskData.Group = group;
    }

    // Crear la tarea en Firestore
    const taskRef = await db.collection('TASK').add(taskData);

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
      const data = doc.data();

      // Solo agregar tareas que NO tengan el campo 'Grupo'
      if (!data.hasOwnProperty('Group')) {
        tasks.push({
          id: doc.id,
          nameTask: data.NameTask,
          status: data.Status,
          deadline: data.DeadLine ? data.DeadLine.toDate() : null,
          category: data.Category,
          description: data.Description
        });
      }
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No hay tareas sin grupo' });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const getTasksByGroup = async (req, res) => {
  const { selectedGroup } = req.params; // Corregido el orden

  try {
    if (!selectedGroup) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos' });
    }

    const tasksRef = db.collection('TASK')
      .where('Group', '==', selectedGroup);

    const snapshot = await tasksRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron tareas' });
    }

    const tasks = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      tasks.push({
        id: doc.id,
        nameTask: data.NameTask || 'Sin nombre',
        status: data.Status || 'Pendiente',
        description: data.Description || '',
        category: data.Category || 'Sin categoría',
        deadline: data.DeadLine ? data.DeadLine.toDate() : null,
        group: data.Group || selectedGroup
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

const getUsers = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'Faltan parámetros requeridos' });
    }

    const usersRef = db.collection('USERS');
    const snapshot = await usersRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }

    const users = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filtra manualmente los usuarios en lugar de usar 'not-in'
      if (doc.id !== userId) {
        users.push({
          id: doc.id,
          username: data.username,
        });
      }
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

const getGroupsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = [];

    // Consulta los grupos donde el usuario es el owner
    const ownerSnapshot = await db.collection('GROUPS').where('ownerId', '==', userId).get();
    ownerSnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        name: doc.data().name,
        ownerId: doc.data().ownerId,
      });
    });

    // Consulta los grupos donde el usuario es un miembro
    const memberSnapshot = await db.collection('GROUPS').where('members', 'array-contains', userId).get();
    memberSnapshot.forEach((doc) => {
      // Evitar duplicados si el usuario es dueño y miembro
      if (!groups.some(group => group.id === doc.id)) {
        groups.push({
          id: doc.id,
          name: doc.data().name,
          ownerId: doc.data().ownerId,
        });
      }
    });

    if (groups.length === 0) {
      return res.status(404).json({ message: 'No se encontraron grupos' });
    }

    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};


const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    // Eliminar la tarea de Firestore
    await db.collection('TASK').doc(taskId).delete();
    res.status(200).json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { nameTask, description, category, deadline, status } = req.body;

  if (!taskId) {
    return res.status(400).json({ message: "El ID de la tarea es obligatorio." });
  }

  try {
    const taskRef = db.collection("TASK").doc(taskId);
    const taskSnapshot = await taskRef.get();

    if (!taskSnapshot.exists) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const updatedData = {
      NameTask: nameTask || taskSnapshot.data().NameTask,
      Description: description || taskSnapshot.data().Description,
      Category: category || taskSnapshot.data().Category,
      Status: status ?? taskSnapshot.data().Status,
    };

    if (deadline) {
      const parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({ message: "Formato de fecha inválido." });
      }
      updatedData.DeadLine = parsedDeadline;
    }

    await taskRef.update(updatedData);
    res.status(200).json({ message: "Tarea actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Crear un grupo
const createGroup = async (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { name, ownerId } = req.body;

  if (!name || !ownerId) {
    return handleResponse(res, 400, 'Nombre y creador son obligatorios');
  }

  try {
    const groupId = uuidv4();
    await db.collection('GROUPS').doc(groupId).set({
      name,
      ownerId,
      members: [ownerId],
      tasks: [],
    });

    handleResponse(res, 201, 'Grupo creado exitosamente', { groupId });
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, 'Error en el servidor');
  }
};


// Agregar un miembro al grupo
const addMemberToGroup = async (req, res) => {
  const { groupId, userId } = req.params; // Tomar ambos de los parámetros de la URL

  if (!groupId || !userId) {
    return handleResponse(res, 400, 'ID del grupo y del usuario son obligatorios');
  }

  try {
    const groupRef = db.collection('GROUPS').doc(groupId);
    const groupDoc = await groupRef.get();

    if (!groupDoc.exists) {
      return handleResponse(res, 404, 'Grupo no encontrado');
    }

    const currentMembers = groupDoc.data().members || [];

    if (currentMembers.includes(userId)) {
      return handleResponse(res, 400, 'El usuario ya es miembro del grupo');
    }

    await groupRef.update({
      members: [...currentMembers, userId],
    });

    handleResponse(res, 200, 'Miembro agregado exitosamente');
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, 'Error en el servidor');
  }
};

// Obtener tareas de un grupo
const getGroupTasks = async (req, res) => {
  const { groupId } = req.params;

  try {
    const tasksRef = db.collection('TASK').where('groupId', '==', groupId);
    const snapshot = await tasksRef.get();

    if (snapshot.empty) {
      return handleResponse(res, 404, 'No se encontraron tareas');
    }

    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline.toDate(), // Convertir a fecha legible
      });
    });

    handleResponse(res, 200, 'Tareas obtenidas exitosamente', tasks);
  } catch (error) {
    console.error(error);
    handleResponse(res, 500, 'Error en el servidor');
  }
};

module.exports = {
  registerUser,
  loginUser,
  createTask,
  getTasksByGroup,
  deleteTask,
  updateTask,
  createGroup,
  getTasksByUser,
  addMemberToGroup,
  getGroupsByUser,
  getUsers,
  getGroupTasks,
};