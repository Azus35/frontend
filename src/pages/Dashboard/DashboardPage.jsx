import React, { useState, useEffect } from 'react';
import { FloatButton, Modal, Button, Select, message, Form } from 'antd';
import { PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import moment from 'moment';
import AuthService from '../../services/authService'; // Importar AuthService
import TaskForm from '../../components/TaskFormGroup';
import GroupForm from '../../components/GroupForm';
import UserListModal from '../../components/UserListModal';
import KanbanBoard from '../../components/KanbanBoard';
import './DashboardPage.css';

const DashboardPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  const fetchTasks = async () => {
    if (!selectedGroup) return;
    try {
      const data = await AuthService.getTasksByGroup(selectedGroup);
      setTasks(data);
    } catch (err) {
      message.error('Error al obtener las tareas del grupo');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const data = await AuthService.getGroupsByUser(userId);
      setGroups(data);
    } catch (err) {
      message.error('Error al obtener los grupos');
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (values) => {
    try {
      await AuthService.createGroup({ ...values, ownerId: userId });
      message.success('Grupo creado exitosamente');
      setIsGroupModalVisible(false);
      groupForm.resetFields();
      fetchGroups();
    } catch (err) {
      message.error('Error al crear el grupo');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await AuthService.getUsers(userId);
      setUsers(data);
    } catch (err) {
      message.error('Error al obtener la lista de usuarios');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddUsers = async () => {
    if (!selectedGroup) {
      message.error('No se ha seleccionado un grupo');
      return;
    }

    try {
      await Promise.all(
        selectedUsers.map(async (userId) => {
          await AuthService.addMemberToGroup(selectedGroup, userId);
        })
      );
      message.success('Usuarios agregados al grupo');
      setIsUserModalVisible(false);
    } catch (err) {
      message.error('Error al agregar usuarios al grupo');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await AuthService.deleteTask(taskId);
      message.success('Tarea eliminada exitosamente');
      fetchTasks();
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  const handleClick = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const onFinish = async (values) => {
    try {
      if (editingTask) {
        await AuthService.updateTask(editingTask.id, { ...values, userId });
        message.success('Tarea actualizada exitosamente');
      } else {
        await AuthService.createTask({ ...values, userId });
        message.success('Tarea creada exitosamente');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchTasks();
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
    form.resetFields();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      nameTask: task.nameTask,
      description: task.description,
      category: task.category,
      deadline: task.deadline ? moment(task.deadline) : null,
      status: task.status,
    });
    setIsModalVisible(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await AuthService.updateTask(taskId, { status: newStatus });
      message.success('Estado de la tarea actualizado');
      fetchTasks();
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  const tasksByStatus = {
    Pendiente: tasks.filter((task) => task.status === 'Pendiente'),
    'En progreso': tasks.filter((task) => task.status === 'En progreso'),
    Completada: tasks.filter((task) => task.status === 'Completada'),
  };

  return (
    <div>
      <h1>Bienvenido, {username}</h1>
      <p>Gestiona tus tareas de manera eficiente.</p>
      <Select
        placeholder="Selecciona un grupo"
        style={{ width: '100%', marginBottom: '16px' }}
        onChange={setSelectedGroup}
      >
        {groups.map(group => (
          <Select.Option key={group.id} value={group.id}>
            {group.name}
          </Select.Option>
        ))}
      </Select>
      <Button type="primary" onClick={() => setIsGroupModalVisible(true)}>
        Crear Grupo
      </Button>
      {groups.map((group) => (
        group.ownerId === userId && (
          <Button
            key={group.id}
            className='add-user-button'
            type="default"
            icon={<UserAddOutlined />}
            onClick={() => {
              setIsUserModalVisible(true);
              fetchUsers();
            }}
          >
            Agregar Miembros
          </Button>
        )
      ))}

      <KanbanBoard
        tasksByStatus={tasksByStatus}
        isOwner={groups.some(group => group.ownerId === userId)}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleStatusChange={handleStatusChange}
      />

      {groups.some(group => group.ownerId === userId) && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleClick}
          style={{ right: 24, bottom: 24 }}
        />
      )}

      <Modal
        title={editingTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <TaskForm form={form} onFinish={onFinish} editingTask={editingTask} groups={groups} />
      </Modal>

      <Modal
        title="Crear Grupo"
        visible={isGroupModalVisible}
        onCancel={() => setIsGroupModalVisible(false)}
        footer={null}
      >
        <GroupForm form={groupForm} onFinish={handleCreateGroup} />
      </Modal>

      <UserListModal
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        users={users}
        selectedUsers={selectedUsers}
        handleUserSelect={handleUserSelect}
        handleAddUsers={handleAddUsers}
      />
    </div>
  );
};

export default DashboardPage;