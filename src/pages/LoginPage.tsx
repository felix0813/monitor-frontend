// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/LoginPage.css';

interface LoginRequest {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData: LoginRequest = { username, password };
        console.log(import.meta.env.VITE_API_BASE_URL)
      // 发送登录请求到后端
      const response = await axios.post('/login', loginData);

      // 保存token到localStorage
      localStorage.setItem('authToken', response.data.token);

      // 登录成功后的处理（例如跳转到监控页面）
      window.location.href = '/'; // 或者使用React Router的navigate功能

    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Login failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
          <div className="beian-link-container">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
                  京ICP备2023011513号-2
              </a>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;
