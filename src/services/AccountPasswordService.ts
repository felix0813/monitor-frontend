import axios from 'axios';
import type {
  AccountPassword,
  CreateAccountPasswordRequest,
  UpdateAccountPasswordRequest,
} from '../types';

class AccountPasswordService {
  private getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  async listAccountPasswords(): Promise<AccountPassword[]> {
    const response = await axios.get('/api/account-passwords', {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async createAccountPassword(payload: CreateAccountPasswordRequest): Promise<AccountPassword> {
    const response = await axios.post('/api/account-passwords', payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateAccountPassword(
    id: string,
    payload: UpdateAccountPasswordRequest,
  ): Promise<AccountPassword> {
    const response = await axios.put(`/api/account-passwords/${id}`, payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async deleteAccountPassword(id: string): Promise<void> {
    await axios.delete(`/api/account-passwords/${id}`, {
      headers: this.getAuthHeader(),
    });
  }
}

export default new AccountPasswordService();
