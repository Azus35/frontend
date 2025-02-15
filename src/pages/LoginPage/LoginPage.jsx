import React, { useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
const LoginPage = () => {
  const [credenciales] = useState({ username: 'administrador', password: '123' });
  const navigate = useNavigate();

  const formLogin = (values) => {
    if (
      values.username === credenciales.username &&
      values.password === credenciales.password
    ) {
      navigate('/dashboard');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container">
      <h1>Iniciar Sesión</h1>
      <Form onFinish={formLogin}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Ingresa tu usuario' }]}
        >
          <Input placeholder="Usuario" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>
        <Form.Item className='button-login'>
          <Button type="primary" size='large' htmlType="submit">
            Ingresar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;