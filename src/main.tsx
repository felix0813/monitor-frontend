import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import axios from 'axios';
import App from './App';
import authService from './services/AuthService';
import './index.css';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

axios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.request?.url?.includes('/login')) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            authService.logout();
            window.alert('认证失效，请重新登录');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    },
);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>,
);
