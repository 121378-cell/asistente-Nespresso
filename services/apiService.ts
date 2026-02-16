import axios, { AxiosInstance } from 'axios';
import { SavedRepair } from '../types';

const API_BASE_URL =
  (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL ||
  'http://localhost:3001';

export interface AnalyticsModelCount {
  model: string;
  count: number;
}

export interface AnalyticsMonthCount {
  month: string;
  count: number;
}

export interface AnalyticsStats {
  totalRepairs: number;
  totalMessages: number;
  recentRepairs: number;
  repairsByModel: AnalyticsModelCount[];
  repairsByMonth: AnalyticsMonthCount[];
}

export interface SearchRepairsParams {
  query?: string;
  model?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SearchRepairsResponse {
  repairs: SavedRepair[];
  total: number;
  limit: number;
  offset: number;
}

export interface PredefinedQueryResponse<T = unknown> {
  result: T;
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface ApiErrorPayload {
  error?: string;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object';

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

  private handleError(error: unknown): never {
    if (axios.isAxiosError<ApiErrorPayload>(error)) {
      const message =
        error.response?.data?.error || error.message || 'An error occurred while calling the API';
      throw new Error(message);
    }

    if (isObject(error)) {
      const response = error.response;
      if (
        isObject(response) &&
        isObject(response.data) &&
        typeof response.data.error === 'string'
      ) {
        throw new Error(response.data.error);
      }
      if (typeof error.message === 'string') {
        throw new Error(error.message);
      }
    }

    const message = error instanceof Error ? error.message : 'An unknown error occurred';
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
  async getStats(): Promise<AnalyticsStats> {
    try {
      const response = await this.axiosInstance.get<AnalyticsStats>('/analytics/stats');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async searchRepairs(params: SearchRepairsParams): Promise<SearchRepairsResponse> {
    try {
      const response = await this.axiosInstance.get<SearchRepairsResponse>('/analytics/search', {
        params,
      });
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

  exportData(format: 'json' | 'csv', params?: QueryParams): void {
    const queryParams = new URLSearchParams();
    queryParams.set('format', format);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.set(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    window.open(`${API_BASE_URL}/api/analytics/export?${queryString}`, '_blank');
  }

  /**
   * Run a predefined safe query
   */
  async runPredefinedQuery<T = unknown>(
    queryType: string,
    params?: QueryParams
  ): Promise<PredefinedQueryResponse<T>> {
    try {
      const response = await this.axiosInstance.post<PredefinedQueryResponse<T>>(
        '/analytics/query',
        {
          queryType,
          params,
        }
      );
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
