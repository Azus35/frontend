import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, List, Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import TaskCard from '../../components/TaskCard';

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para el modal

  // Obtener detalles del grupo
  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/groups/${groupId}`);
      const data = await response.json();
      if (response.ok) {
        setGroup(data);
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener los detalles del grupo');
    }
  };

  // Obtener tareas del grupo
  const fetchGroupTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/groups/${groupId}/tasks`);
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error('Error al obtener las tareas');
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupTasks();
  }, [groupId]);

  return (
    <div>
      <h1>{group?.name}</h1>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
        Crear Tarea
      </Button>

      <List
        dataSource={tasks}
        renderItem={(task) => (
          <List.Item>
            <TaskCard task={task} />
          </List.Item>
        )}
      />

      {/* Modal para crear tarea */}
      <Modal
        title="Crear Tarea"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {/* Contenido del formulario para crear tarea */}
        <p>Aquí va el formulario para crear una nueva tarea.</p>
      </Modal>
    </div>
  );
};

export default GroupDetailsPage;
