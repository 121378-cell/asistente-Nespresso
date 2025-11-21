import axios, { AxiosInstance } from 'axios';
import { SavedRepair } from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: `${API_BASE_URL}/api`,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });
    }

    private handleError(error: any): never {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        throw new Error(message);
    }

    // Repairs
    async getAllRepairs(): Promise<SavedRepair[]> {
        try {
            const response = await this.axiosInstance.get('/repairs');
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getRepairById(id: string): Promise<SavedRepair> {
        try {
            const response = await this.axiosInstance.get(`/repairs/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async createRepair(repair: Omit<SavedRepair, 'id'>): Promise<SavedRepair> {
        try {
            const response = await this.axiosInstance.post('/repairs', repair);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async updateRepair(id: string, updates: Partial<SavedRepair>): Promise<SavedRepair> {
        try {
            const response = await this.axiosInstance.put(`/repairs/${id}`, updates);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async deleteRepair(id: string): Promise<void> {
        try {
            await this.axiosInstance.delete(`/repairs/${id}`);
        } catch (error) {
            this.handleError(error);
        }
    }

    // Analytics
    async getStats(): Promise<any> {
        try {
            const response = await this.axiosInstance.get('/analytics/stats');
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async searchRepairs(params: any): Promise<any> {
        try {
            const response = await this.axiosInstance.get('/analytics/search', { params });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async getModels(): Promise<string[]> {
        try {
            const response = await this.axiosInstance.get('/analytics/models');
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    exportData(format: 'json' | 'csv', params?: any): void {
        const queryString = new URLSearchParams({ format, ...params }).toString();
        window.open(`${API_BASE_URL}/api/analytics/export?${queryString}`, '_blank');
    }

    /**
     * Run a predefined safe query
     */
    async runPredefinedQuery(queryType: string, params?: any): Promise<any> {
        try {
            const response = await this.axiosInstance.post('/analytics/query', {
                queryType,
                params
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const response = await axios.get(`${API_BASE_URL}/health`);
            return response.data.status === 'ok';
        } catch (error) {
            return false;
        }
    }
}

export const apiService = new ApiService();
export default apiService;
