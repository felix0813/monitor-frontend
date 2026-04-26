import axios from 'axios';
import type {
  CommandTemplate,
  CommandTemplatePayload,
  ExecuteCommandResponse,
} from '../types';

class CommandService {
  private getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  async listCommandTemplates(): Promise<CommandTemplate[]> {
    const response = await axios.get('/api/command-templates', {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async createCommandTemplate(payload: CommandTemplatePayload): Promise<CommandTemplate> {
    const response = await axios.post('/api/command-templates', payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateCommandTemplate(id: string, payload: CommandTemplatePayload): Promise<CommandTemplate> {
    const response = await axios.put(`/api/command-templates/${id}`, payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async deleteCommandTemplate(id: string): Promise<void> {
    await axios.delete(`/api/command-templates/${id}`, {
      headers: this.getAuthHeader(),
    });
  }

  async executeCommand(command: string): Promise<ExecuteCommandResponse> {
    const response = await axios.post(
      '/api/command',
      {command},
      {headers: this.getAuthHeader()},
    );
    return response.data;
  }
}

export default new CommandService();
