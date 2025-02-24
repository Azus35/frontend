import React, { useState, useEffect } from 'react';
import { FloatButton, Modal, Form, Input, Button, Select, DatePicker, message, Card, List, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined} from '@ant-design/icons';
import moment from 'moment';
import './DashboardPage.css';

const DashboardPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [groupForm] = Form.useForm();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);

  // Función para obtener las tareas del usuario
  const fetchTasks = async () => {
    if (!selectedGroup) return;
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${selectedGroup}`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener las tareas del grupo');
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [selectedGroup]);
  
  const fetchGroups = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/groups/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setGroups(data);
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener los grupos');
    }
  };
  
  useEffect(() => {
    fetchGroups();
  }, []);
  

  useEffect(() => {
    console.log('Tareas actualizadas:', tasks); // Depuración
  }, [tasks]);

  const handleCreateGroup = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ownerId: userId }),
      });
  
      const data = await response.json();
      if (response.ok) {
        message.success('Grupo creado exitosamente');
        setIsGroupModalVisible(false);
        groupForm.resetFields();
        fetchGroups();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al crear el grupo');
    }
  };
  
  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`);
      const data = await response.json();
      if (response.ok) setUsers(data);
      else message.error(data.message);
    } catch (err) {
      message.error('Error al obtener la lista de usuarios');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const userGroup = groups.find(g => g.id === selectedGroup); // Encuentra el grupo actual

  const handleAddUsers = async () => {
    if (!selectedGroup) {
      message.error('No se ha seleccionado un grupo');
      return;
    }
    
    try {
      await Promise.all(
        selectedUsers.map(async (userId) => {
          const response = await fetch(`http://localhost:5000/api/auth/groups/${selectedGroup}/members/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await response.json();
          if (!response.ok) message.error(data.message);
        })
      );
      message.success('Usuarios agregados al grupo');
      setIsUserModalVisible(false);
    } catch (err) {
      message.error('Error al agregar usuarios al grupo');
    }
  };
  

  // Función para borrar una tarea
  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Tarea eliminada exitosamente');
        fetchTasks(); // Actualizar la lista de tareas
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  // Función para abrir el modal (agregar nueva tarea)
  const handleClick = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const onFinish = async (values) => {
    try {
      const url = editingTask
        ? `http://localhost:5000/api/auth/tasks/${editingTask.id}` // Ruta para editar
        : 'http://localhost:5000/api/auth/tasks'; // Ruta para crear
  
      const method = editingTask ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          userId,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        message.success(editingTask ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente');
        setIsModalVisible(false);
        form.resetFields();
        fetchTasks(); // Actualizar la lista de tareas
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false); // Cierra el modal
    setEditingTask(null); // Limpia la tarea en edición
    form.resetFields(); // Limpia el formulario
  };

  // Función para editar una tarea
  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      nameTask: task.nameTask,
      description: task.description,
      category: task.category,
      deadline: task.deadline ? moment(task.deadline) : null, // Formatear la fecha
      status: task.status,
    });
    setIsModalVisible(true);
  };

  // Función para cambiar el estado de una tarea
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Estado de la tarea actualizado');
        fetchTasks();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  // Separar tareas por estado
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
    {/* Tabla Kanban */}
        <div className="kanban-board">
          {groups.map((group) => {
            const isOwner = group.ownerId === userId;
            return (
              Object.entries(tasksByStatus).map(([status, tasks]) => (
                <Card key={status} title={status} className="kanban-column">
                  {tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="kanban-task"
                      actions={isOwner ? [
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(task)}
                        />,
                        <Button
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(task.id)}
                        />,
                      ] : []}
                    >
                      <div className="task-content">
                        <div className="task-title">{task.nameTask}</div>
                        <div className="task-description">{task.description}</div>
                        <div className="task-deadline">
                          <strong>Fecha límite:</strong>{' '}
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Sin fecha'}
                        </div>
                        {isOwner && (
                          <div className="task-status">
                            <Select
                              defaultValue={task.status}
                              style={{ width: '100%', marginTop: '8px' }}
                              onChange={(value) => handleStatusChange(task.id, value)}
                            >
                              <Select.Option value="Pendiente">Pendiente</Select.Option>
                              <Select.Option value="En progreso">En progreso</Select.Option>
                              <Select.Option value="Completada">Completada</Select.Option>
                            </Select>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </Card>
              ))
            );
          })}
        </div>

      {groups.some(group => group.ownerId === userId) && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          onClick={handleClick}
          style={{ right: 24, bottom: 24 }}
        />
      )}


      {/* Modal para agregar/editar tareas */}
      <Modal
        title={editingTask ? 'Editar Tarea' : 'Agregar Nueva Tarea'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Nombre de la Tarea"
            name="nameTask"
            rules={[{ required: true, message: 'Por favor ingresa un nombre' }]}
          >
            <Input placeholder="Nombre de la tarea" />
          </Form.Item>

          <Form.Item
            label="Descripción"
            name="description"
            rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
          >
            <Input.TextArea placeholder="Descripción de la tarea" rows={4} />
          </Form.Item>

          <Form.Item
            label="Categoría"
            name="category"
            rules={[{ required: true, message: 'Por favor selecciona una categoría' }]}
          >
            <Select placeholder="Selecciona una categoría">
              <Select.Option value="Personal">Personal</Select.Option>
              <Select.Option value="Trabajo">Trabajo</Select.Option>
              <Select.Option value="Escuela">Escuela</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha de Vencimiento"
            name="deadline"
            rules={[{ required: true, message: 'Por favor selecciona una fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="status"
            rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
          >
            <Select placeholder="Selecciona un estado">
              <Select.Option value="Pendiente">Pendiente</Select.Option>
              <Select.Option value="En progreso">En progreso</Select.Option>
              <Select.Option value="Completada">Completada</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
          label="Grupo"
          name="group"
          rules={[{ required: true, message: 'Por favor selecciona un grupo' }]}
          >
            <Select placeholder="Selecciona un grupo" loading={groups.length === 0}>
              {groups.map(group => (
                <Select.Option key={group.id} value={group.id}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingTask ? 'Actualizar' : 'Guardar'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Crear Grupo"
        visible={isGroupModalVisible}
        onCancel={() => setIsGroupModalVisible(false)}
        footer={null}
      >
        <Form form={groupForm} onFinish={handleCreateGroup} layout="vertical">
          <Form.Item
            label="Nombre del Grupo"
            name="name"
            rules={[{ required: true, message: 'Por favor ingresa un nombre para el grupo' }]}
          >
            <Input placeholder="Nombre del grupo" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Crear</Button>
          </Form.Item>
        </Form>
      </Modal>
    {/* Modal para agregar usuarios */}
    <Modal
      title="Agregar Miembros al Grupo"
      visible={isUserModalVisible}
      onCancel={() => setIsUserModalVisible(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsUserModalVisible(false)}>
          Cancelar
        </Button>,
        <Button key="add" type="primary" onClick={handleAddUsers}>
          Agregar
        </Button>,
      ]}
    >
      <List
        dataSource={users}
        renderItem={(user) => (
          <List.Item>
            <Checkbox
              checked={selectedUsers.includes(user.id)}
              onChange={() => handleUserSelect(user.id)}
            >
              {user.username}
            </Checkbox>
          </List.Item>
        )}
      />
    </Modal>

    </div>
  );
};

export default DashboardPage;