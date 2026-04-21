import axios from 'axios';
import type {
    NavigationSite,
    CreateNavigationSiteRequest,
    UpdateNavigationSiteRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9002';

class NavigationService {
    private getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async listNavigationSites(): Promise<NavigationSite[]> {
        const response = await axios.get(`${API_BASE_URL}/api/navigation-sites`, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async createNavigationSite(data: CreateNavigationSiteRequest): Promise<NavigationSite> {
        const response = await axios.post(`${API_BASE_URL}/api/navigation-sites`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async updateNavigationSite(id: string, data: UpdateNavigationSiteRequest): Promise<NavigationSite> {
        const response = await axios.put(`${API_BASE_URL}/api/navigation-sites/${id}`, data, {
            headers: this.getAuthHeader(),
        });
        return response.data;
    }

    async deleteNavigationSite(id: string): Promise<void> {
        await axios.delete(`${API_BASE_URL}/api/navigation-sites/${id}`, {
            headers: this.getAuthHeader(),
        });
    }

    async reorderNavigationSites(ids: string[]): Promise<void> {
        await axios.put(`${API_BASE_URL}/api/navigation-sites/order`, { ids }, {
            headers: this.getAuthHeader(),
        });
    }
}

export default new NavigationService();
