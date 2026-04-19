import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';
import '../styles/shell.css';

const navItems = [
  { to: '/', label: '导航页' },
  { to: '/monitor', label: '监控页' },
  { to: '/workspace', label: '工作台' },
];

function AppShell() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <div className="shell-backdrop shell-backdrop-left" />
      <div className="shell-backdrop shell-backdrop-right" />

      <header className="shell-header">
        <div className="shell-brand">
          <span className="shell-brand-mark">MON</span>
          <div>
            <p className="shell-brand-kicker">Portal</p>
            <h1>运维数据总览台</h1>
          </div>
        </div>

        <nav className="shell-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'shell-nav-link shell-nav-link-active' : 'shell-nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="shell-logout" onClick={handleLogout}>
          退出登录
        </button>
      </header>

      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
