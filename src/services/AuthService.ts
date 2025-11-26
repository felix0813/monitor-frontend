// src/services/authService.ts
import axios from 'axios';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
      const response = await axios.post<LoginResponse>(
        `/login`,
        credentials
      );
      return response.data;
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // 这里可以添加更复杂的token验证逻辑
  }
}

export default new AuthService();
