import axios, { AxiosInstance } from 'axios';
import { SavedRepair } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout for large attachments
        });

        // Request interceptor for logging
        this.api.interceptors.request.use(
            (config) => {
                console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Response Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    // Get all saved repairs
    async getAllRepairs(): Promise<SavedRepair[]> {
        try {
            const response = await this.api.get('/api/repairs');
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch repairs');
        }
    }

    // Get a specific repair by ID
    async getRepairById(id: string): Promise<SavedRepair> {
        try {
            const response = await this.api.get(`/api/repairs/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to fetch repair');
        }
    }

    // Create a new repair
    async createRepair(repair: Omit<SavedRepair, 'id'>): Promise<SavedRepair> {
        try {
            const response = await this.api.post('/api/repairs', repair);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to create repair');
        }
    }

    // Update a repair
    async updateRepair(id: string, updates: Partial<SavedRepair>): Promise<SavedRepair> {
        try {
            const response = await this.api.put(`/api/repairs/${id}`, updates);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to update repair');
        }
    }

    // Delete a repair
    async deleteRepair(id: string): Promise<void> {
        try {
            await this.api.delete(`/api/repairs/${id}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Failed to delete repair');
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.api.get('/health');
            return response.data.status === 'ok';
        } catch (error) {
            return false;
        }
    }

    // Analytics & Data Export methods
    async getStats(): Promise<any> {
        const response = await this.api.get('/analytics/stats');
        return response.data;
    }

    async searchRepairs(params: any): Promise<any> {
        const response = await this.api.get('/analytics/search', { params });
        return response.data;
    }

    async getModels(): Promise<any> {
        const response = await this.api.get('/analytics/models');
        return response.data;
    }

    exportData(format: 'json' | 'csv', params?: any): void {
        const queryString = new URLSearchParams({ format, ...params }).toString();
        window.open(`${API_BASE_URL}/analytics/export?${queryString}`, '_blank');
    }

    // Custom Query (Dev only)
    async runCustomQuery(query: string): Promise<any> {
        const response = await this.api.post('/analytics/query', { query });
        return response.data;
    }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;
