import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from "axios";
import authService from "./services/AuthService.ts";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
// 请求拦截器 - 自动添加认证头
axios.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理认证错误
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if(error?.request?.url?.includes('/login')){
            return Promise.reject(error);
        }
        if (error.response?.status === 401) {
            // 认证失败，清除本地token并重定向到登录页
            authService.logout();
            alert('认证失败，请重新登录')
            window.location.href = '/login';

            console.log('认证失败，请重新登录');
        }
        return Promise.reject(error);
    }
);
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
