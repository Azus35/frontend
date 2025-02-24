import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Form, Select, Button, message } from 'antd';

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [form] = Form.useForm();

  // Obtener detalles de la tarea
  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${taskId}`);
      const data = await response.json();
      if (response.ok) {
        setTask(data);
        form.setFieldsValue({ status: data.status }); // Establecer el estado actual en el formulario
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener los detalles de la tarea');
    }
  };

  // Actualizar el estado de la tarea
  const handleUpdateStatus = async (values) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: values.status }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Estado de la tarea actualizado');
        fetchTaskDetails(); // Refrescar los detalles de la tarea
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  if (!task) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1>Detalles de la Tarea</h1>
      <Card title={task.nameTask} style={{ width: '100%' }}>
        <p><strong>Descripción:</strong> {task.description}</p>
        <p><strong>Categoría:</strong> {task.category}</p>
        <p><strong>Fecha límite:</strong> {task.deadline.toDate().toLocaleDateString()}</p>
        <p><strong>Estado:</strong> {task.status}</p>
        <p><strong>Asignado a:</strong> {task.assignedTo}</p>

        <Form form={form} onFinish={handleUpdateStatus} layout="inline">
          <Form.Item
            label="Cambiar Estado"
            name="status"
            rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
          >
            <Select style={{ width: '200px' }}>
              <Select.Option value="Pendiente">Pendiente</Select.Option>
              <Select.Option value="En progreso">En progreso</Select.Option>
              <Select.Option value="Completada">Completada</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Actualizar Estado
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TaskDetailsPage;