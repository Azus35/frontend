import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd';
import AuthService from '../../services/authService'; // Ajusta la ruta según tu estructura
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    try {
      const data = await AuthService.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);
      localStorage.setItem('rol', data.rol);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error en el servidor');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          style={{ marginBottom: '16px' }}
        />
        <br></br>
        <Input.Password
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          style={{ marginBottom: '16px' }}
        />
        <br></br>
        <Button type="primary" htmlType="submit" className="login-button" block>
          Ingresar
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
