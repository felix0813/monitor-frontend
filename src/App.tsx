import {Navigate, Route, Routes} from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MonitorDashboard from './pages/MonitorDashboard';
import NavigationPage from './pages/NavigationPage';
import ComingSoonPage from './pages/ComingSoonPage';
import authService from './services/AuthService';
import './App.css';

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
      <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace/> : <LoginPage/>}/>

          <Route element={<ProtectedRoute/>}>
              <Route element={<AppShell/>}>
                  <Route index element={<NavigationPage/>}/>
                  <Route path="/monitor" element={<MonitorDashboard/>}/>
                  <Route
                      path="/workspace"
                      element={
                          <ComingSoonPage
                              title="工作台"
                              description="功能预览即将开放，敬请期待。路由已经就位，后续开发时直接在此扩展即可。"
                          />
                      }
                  />
              </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
  );
}

export default App;
