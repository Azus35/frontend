import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Select, DatePicker, Button, message } from 'antd';

const CreateTaskPage = () => {
  const { groupId } = useParams();
  const [form] = Form.useForm();

  const handleCreateTask = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, groupId }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Tarea creada exitosamente');
        form.resetFields();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  return (
    <div>
      <h1>Crear Tarea</h1>
      <Form form={form} onFinish={handleCreateTask} layout="vertical">
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
          label="Asignado a"
          name="assignedTo"
          rules={[{ required: true, message: 'Por favor selecciona un usuario' }]}
        >
          <Select placeholder="Selecciona un usuario">
            {/* Aquí puedes listar los usuarios del grupo */}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Crear Tarea
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateTaskPage;