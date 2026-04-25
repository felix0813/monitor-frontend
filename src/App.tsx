import {useEffect} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import {UNAUTHORIZED_EVENT} from './constants/auth';
import LoginPage from './pages/LoginPage';
import MonitorDashboard from './pages/MonitorDashboard';
import NavigationPage from './pages/NavigationPage';
import TodoPage from './pages/TodoPage';
import WorkspacePage from './pages/WorkspacePage';
import authService from './services/AuthService';
import './App.css';

const routeTitleMap: Record<string, string> = {
  '/': '导航页',
  '/monitor': '监控页',
  '/workspace': '工作台',
  '/todo': '项目 Todo',
  '/login': '登录',
};

function RouteTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = routeTitleMap[location.pathname] || '运维数据总览台';
    document.title = `${pageTitle} | 运维数据总览台`;
  }, [location.pathname]);

  return null;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate('/login', {replace: true, state: {from: location}});
    };

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [location, navigate]);

  return (
    <>
      <RouteTitleManager />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<NavigationPage />} />
            <Route path="/monitor" element={<MonitorDashboard />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/todo" element={<TodoPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
