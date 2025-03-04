import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token'); // Eliminar el token del localStorage
    localStorage.removeItem('userId'); // Eliminar el userId del localStorage
    navigate('/login'); // Redirigir al usuario a la página de Login
  };
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <h2>Task Manager</h2>
        </div>
        <Menu mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1">
            <Link to="/dashboard">Grupos</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/dashboard/tasks">Tareas</Link>
          </Menu.Item>
          <Menu.Item key="3" onClick={handleLogout} style={{ color: 'red' }}> {/* Cerrar Sesión */}
            Cerrar Sesión
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;