import axios from 'axios';
import type {
  CodeProject,
  CreateCodeProjectRequest,
  UpdateCodeProjectRequest,
} from '../types';

class CodeProjectService {
  private getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}`} : {};
  }

  async listCodeProjects(): Promise<CodeProject[]> {
    const response = await axios.get('/api/code-projects', {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async createCodeProject(payload: CreateCodeProjectRequest): Promise<CodeProject> {
    const response = await axios.post('/api/code-projects', payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async updateCodeProject(id: string, payload: UpdateCodeProjectRequest): Promise<CodeProject> {
    const response = await axios.put(`/api/code-projects/${id}`, payload, {
      headers: this.getAuthHeader(),
    });
    return response.data;
  }

  async deleteCodeProject(id: string): Promise<void> {
    await axios.delete(`/api/code-projects/${id}`, {
      headers: this.getAuthHeader(),
    });
  }
}

export default new CodeProjectService();
