import {useLocation, useNavigate} from 'react-router-dom';
import React, {useState} from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';

interface LoginRequest {
  username: string;
  password: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData: LoginRequest = { username, password };
      const response = await axios.post('/login', loginData);
      localStorage.setItem('authToken', response.data.token);
      navigate(redirectTo, {replace: true});
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || '登录失败');
      } else {
        setError('发生未知错误');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-backdrop login-backdrop-left"/>
      <div className="login-backdrop login-backdrop-right"/>

      <section className="login-panel">
        <div className="login-copy">
          <p className="login-kicker">Secure Entry</p>
          <h1>运维数据总览台</h1>
          <p className="login-description">
            登录后进入服务统一导航首页，原有页面已迁移至独立模块。监控、探针和工作台共用同一套视觉体系。
          </p>

          <div className="login-highlights">
            <span>服务监控</span>
            <span>快速导航</span>
            <span>扩展页面</span>
          </div>
        </div>

        <div className="login-form-card">
          <div className="login-form-header">
            <p>Account Login</p>
            <h2>账号登录</h2>
          </div>


          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="login-submit-button">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="beian-link-container">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
              京ICP备2023011513号-2
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
