import React, { useState, useEffect } from 'react';
import { FloatButton, Modal, Form, Input, Button, Select, DatePicker, message, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './DashboardPage.css';

const DashboardPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]); // Estado para almacenar las tareas
  const [form] = Form.useForm();
  const userId = localStorage.getItem('userId'); // Obtener el userId del localStorage
  const username = localStorage.getItem('username');
  
  // Función para obtener las tareas del usuario
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data); // Guardar las tareas en el estado
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener las tareas');
    }
  };

  // Ejecutar fetchTasks cuando el componente se monta
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleClick = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Tarea creada exitosamente');
        setIsModalVisible(false);
        form.resetFields();
        fetchTasks(); // Actualizar la lista de tareas después de crear una nueva
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  return (
    <div>
      <h1>Bienvenido, {username}</h1>
      <p>Tus Tareas</p>

      {/* Listado de tareas */}
      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <span>Nombre de la tarea: {task.nameTask}</span>
              <span>Estatus: {task.status}</span>
            </div>
          </List.Item>
        )}
      />

      {/* Botón flotante para agregar tareas */}
      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        onClick={handleClick}
        style={{ right: 24, bottom: 24 }}
      />

      {/* Modal para agregar tareas */}
      <Modal
        title="Agregar Nueva Tarea"
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
              <Select.Option value="Escuela">Escuela</Select.Option>
              <Select.Option value="Personal">Personal</Select.Option>
              <Select.Option value="Trabajo">Trabajo</Select.Option>
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

          <Form.Item style={{ alignItems: 'center' , textAlign: 'center' }}>
            <Button type="primary" htmlType="submit">
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardPage;