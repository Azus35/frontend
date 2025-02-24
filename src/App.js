import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MainLayout from './layouts/MainLayout';
import GroupsPage from './pages/GroupsPage/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage/GroupDetailsPage';
import CreateTaskPage from './pages/CreateTaskPage/CreateTaskPage';
import TaskDetailsPage from './pages/TaskDetailsPage/TaskDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          }
        />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="/groups/:groupId/create-task" element={<CreateTaskPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;