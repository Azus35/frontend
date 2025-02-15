import React from 'react';
import './LandingPage.css';
import { Button } from 'antd';
const LandingPage = () => {
  return (
    <div className="container">
      <div className="landing-container">
        <h1>Welcome to Task Manager</h1>
        <p>La herramienta perfecta para tu productividad.</p>
        <Button type="primary" size="large" href="/login">
        Conocer más
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
