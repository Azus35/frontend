import React from 'react';
import './LandingPage.css';
import { Button } from 'antd';
const LandingPage = () => {
  return (
    <div className="container">
      <div className="landing-container">
        <h1>Welcome to Task Manager</h1>
        <p>La herramienta perfecta para tu productividad.</p>
        <Button type="primary" size="large" href="/login" style={{ margin: '16px' }}>
        Iniciar Sesión
        </Button>
        <Button type="primary" size="large" href="/register" style={{ margin: '16px' }}>
        Registrarse
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
