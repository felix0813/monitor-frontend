import axios from 'axios';
import type {
    TodoProject,
    TodoItem,
    CreateTodoProjectRequest,
    CreateTodoItemRequest,
    UpdateTodoItemRequest,
} from '../types';

class TodoService {
    private getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async listTodoProjects(): Promise<TodoProject[]> {
        const response = await axios.get(`/api/todo-projects`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async createTodoProject(data: CreateTodoProjectRequest): Promise<TodoProject> {
        const response = await axios.post(`/api/todo-projects`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }


    async deleteTodoProject(id: string): Promise<void> {
        await axios.delete(`/api/todo-projects/${id}`, {
            headers: this.getAuthHeader(),
        });
    }

    async listTodoItems(projectId: string): Promise<TodoItem[]> {
        const response = await axios.get(`/api/todo-projects/${projectId}/items`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async createTodoItem(projectId: string, data: CreateTodoItemRequest): Promise<TodoItem> {
        const response = await axios.post(`/api/todo-projects/${projectId}/items`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updateTodoItem(projectId: string, itemId: string, data: UpdateTodoItemRequest): Promise<TodoItem> {
        const response = await axios.put(`/api/todo-projects/${projectId}/items/${itemId}`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async deleteTodoItem(projectId: string, itemId: string): Promise<void> {
        await axios.delete(`/api/todo-projects/${projectId}/items/${itemId}`, {
            headers: this.getAuthHeader(),
        });
    }
}

export default new TodoService();
