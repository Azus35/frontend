import React from 'react';
import { Card, Button } from 'antd';
import { Link } from 'react-router-dom';

const TaskCard = ({ task }) => {
  return (
    <Card title={task.nameTask} style={{ width: '100%' }}>
      <p>{task.description}</p>
      <p><strong>Estado:</strong> {task.status}</p>
      <p><strong>Asignado a:</strong> {task.assignedTo}</p>
      <Link to={`/tasks/${task.id}`}>
        <Button type="primary">Ver Detalles</Button>
      </Link>
    </Card>
  );
};

export default TaskCard;