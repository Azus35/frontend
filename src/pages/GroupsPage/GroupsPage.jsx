import React, { useState, useEffect } from 'react';
import { Button, List, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import GroupCard from '../../components/GroupCard';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const userId = localStorage.getItem('userId');

  // Obtener grupos del usuario
  const fetchGroups = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/groups?userId=${userId}`);
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

  // Crear un grupo
  const handleCreateGroup = async (values) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, createdBy: userId }),
      });

      const data = await response.json();
      if (response.ok) {
        message.success('Grupo creado exitosamente');
        setIsModalVisible(false);
        form.resetFields();
        fetchGroups();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error en el servidor');
    }
  };

  return (
    <div>
      <h1>Grupos</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
        Crear Grupo
      </Button>

      <List
        dataSource={groups}
        renderItem={(group) => (
          <List.Item>
            <GroupCard group={group} />
          </List.Item>
        )}
      />

      <Modal
        title="Crear Grupo"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateGroup} layout="vertical">
          <Form.Item
            label="Nombre del Grupo"
            name="name"
            rules={[{ required: true, message: 'Por favor ingresa un nombre' }]}
          >
            <Input placeholder="Nombre del grupo" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Crear
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupsPage;