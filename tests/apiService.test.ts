import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiService from '../services/apiService';
import axios from 'axios';
import { Role, type SavedRepair } from '../types';

// Mock axios
vi.mock('axios');

const mockedAxios = vi.mocked(axios, true);

describe('API Service (Frontend)', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    mockedAxios.create = vi.fn(() => mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return true when server is healthy', async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({
        status: 200,
        data: { status: 'ok' },
      });

      const result = await apiService.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when server is unhealthy', async () => {
      mockedAxios.get = vi.fn().mockRejectedValue(new Error('Server error'));

      const result = await apiService.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('Repairs API', () => {
    describe('getAllRepairs', () => {
      it('should fetch all repairs', async () => {
        const mockRepairs = [
          {
            id: '1',
            name: 'Repair 1',
            machineModel: 'Gemini CS2',
            serialNumber: 'SN123',
            timestamp: Date.now(),
            messages: [],
          },
          {
            id: '2',
            name: 'Repair 2',
            machineModel: 'Momento 200',
            serialNumber: 'SN456',
            timestamp: Date.now(),
            messages: [],
          },
        ] as SavedRepair[];

        mockAxiosInstance.get.mockResolvedValue({ data: mockRepairs });

        const result = await apiService.getAllRepairs();

        expect(result).toEqual(mockRepairs);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/repairs');
      });

      it('should handle errors when fetching repairs', async () => {
        mockAxiosInstance.get.mockRejectedValue({
          response: { data: { error: 'Database error' } },
        });

        await expect(apiService.getAllRepairs()).rejects.toThrow('Database error');
      });
    });

    describe('getRepairById', () => {
      it('should fetch specific repair by ID', async () => {
        const mockRepair = {
          id: '1',
          name: 'Test Repair',
          machineModel: 'Gemini CS2',
          serialNumber: 'SN123',
          timestamp: Date.now(),
          messages: [{ role: Role.USER, text: 'Help' }],
        } as SavedRepair;

        mockAxiosInstance.get.mockResolvedValue({ data: mockRepair });

        const result = await apiService.getRepairById('1');

        expect(result).toEqual(mockRepair);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/repairs/1');
      });

      it('should handle not found errors', async () => {
        mockAxiosInstance.get.mockRejectedValue({
          response: { data: { error: 'Repair not found' } },
        });

        await expect(apiService.getRepairById('999')).rejects.toThrow('Repair not found');
      });
    });

    describe('createRepair', () => {
      it('should create new repair', async () => {
        const newRepair: Omit<SavedRepair, 'id'> = {
          name: 'New Repair',
          machineModel: 'Gemini CS2',
          serialNumber: 'SN789',
          messages: [{ role: Role.USER, text: 'Issue description' }],
          timestamp: Date.now(),
        };

        const mockResponse = { data: { id: 'new-id', ...newRepair } };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        const result = await apiService.createRepair(newRepair);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/repairs', newRepair);
      });

      it('should handle validation errors', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { data: { error: 'Name is required' } },
        });

        await expect(
          apiService.createRepair({
            name: '',
            machineModel: null,
            serialNumber: null,
            messages: [] as SavedRepair['messages'],
            timestamp: Date.now(),
          })
        ).rejects.toThrow('Name is required');
      });
    });

    describe('updateRepair', () => {
      it('should update existing repair', async () => {
        const updates = { name: 'Updated Name' };
        const mockResponse = {
          data: {
            id: '1',
            name: 'Updated Name',
            machineModel: 'Gemini CS2',
            serialNumber: 'SN123',
            timestamp: Date.now(),
            messages: [] as SavedRepair['messages'],
          },
        };

        mockAxiosInstance.put.mockResolvedValue(mockResponse);

        const result = await apiService.updateRepair('1', updates);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/repairs/1', updates);
      });

      it('should handle update errors', async () => {
        mockAxiosInstance.put.mockRejectedValue({
          response: { data: { error: 'Repair not found' } },
        });

        await expect(apiService.updateRepair('999', { name: 'New Name' })).rejects.toThrow(
          'Repair not found'
        );
      });
    });

    describe('deleteRepair', () => {
      it('should delete repair', async () => {
        mockAxiosInstance.delete.mockResolvedValue({ data: { message: 'Deleted' } });

        await apiService.deleteRepair('1');

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/repairs/1');
      });

      it('should handle deletion errors', async () => {
        mockAxiosInstance.delete.mockRejectedValue({
          response: { data: { error: 'Repair not found' } },
        });

        await expect(apiService.deleteRepair('999')).rejects.toThrow('Repair not found');
      });
    });
  });

  describe('Analytics API', () => {
    describe('getStats', () => {
      it('should fetch analytics stats', async () => {
        const mockStats = {
          totalRepairs: 100,
          repairsByModel: { 'Gemini CS2': 50, 'Momento 200': 30 },
        };

        mockAxiosInstance.get.mockResolvedValue({ data: mockStats });

        const result = await apiService.getStats();

        expect(result).toEqual(mockStats);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/stats');
      });
    });

    describe('searchRepairs', () => {
      it('should search repairs with params', async () => {
        const searchParams = { query: 'leak', model: 'Gemini CS2' };
        const mockResults = [{ id: '1', name: 'Leak repair' }];

        mockAxiosInstance.get.mockResolvedValue({ data: mockResults });

        const result = await apiService.searchRepairs(searchParams);

        expect(result).toEqual(mockResults);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/search', {
          params: searchParams,
        });
      });
    });

    describe('getModels', () => {
      it('should fetch available machine models', async () => {
        const mockModels = ['Gemini CS2', 'Momento 200', 'Zenius'];

        mockAxiosInstance.get.mockResolvedValue({ data: mockModels });

        const result = await apiService.getModels();

        expect(result).toEqual(mockModels);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/analytics/models');
      });
    });

    describe('runPredefinedQuery', () => {
      it('should run predefined query with params', async () => {
        const mockResult = { data: [{ count: 10 }] };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

        const result = await apiService.runPredefinedQuery('recent_repairs', { limit: 10 });

        expect(result).toEqual(mockResult);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/analytics/query', {
          queryType: 'recent_repairs',
          params: { limit: 10 },
        });
      });

      it('should run query without params', async () => {
        const mockResult: { data: unknown[] } = { data: [] };
        mockAxiosInstance.post.mockResolvedValue({ data: mockResult });

        await apiService.runPredefinedQuery('repairs_with_attachments');

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/analytics/query', {
          queryType: 'repairs_with_attachments',
          params: undefined,
        });
      });

      it('should handle invalid query types', async () => {
        mockAxiosInstance.post.mockRejectedValue({
          response: { data: { error: 'Invalid query type' } },
        });

        await expect(apiService.runPredefinedQuery('invalid_query')).rejects.toThrow(
          'Invalid query type'
        );
      });
    });

    describe('exportData', () => {
      it('should open export window with correct URL for CSV', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

        apiService.exportData('csv', { startDate: '2024-01-01', endDate: '2024-12-31' });

        expect(windowOpenSpy).toHaveBeenCalled();
        const callArgs = windowOpenSpy.mock.calls[0][0] as string;
        expect(callArgs).toContain('format=csv');
        expect(callArgs).toContain('startDate=2024-01-01');
        expect(callArgs).toContain('endDate=2024-12-31');

        windowOpenSpy.mockRestore();
      });

      it('should open export window with correct URL for JSON', () => {
        const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

        apiService.exportData('json', { query: 'test' });

        expect(windowOpenSpy).toHaveBeenCalled();
        const callArgs = windowOpenSpy.mock.calls[0][0] as string;
        expect(callArgs).toContain('format=json');
        expect(callArgs).toContain('query=test');

        windowOpenSpy.mockRestore();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(apiService.getAllRepairs()).rejects.toThrow('Network error');
    });

    it('should handle API errors with custom messages', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { data: { error: 'Custom error message' } },
      });

      await expect(apiService.getRepairById('1')).rejects.toThrow('Custom error message');
    });

    it('should handle errors without response data', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        message: 'Request timeout',
      });

      await expect(apiService.getAllRepairs()).rejects.toThrow('Request timeout');
    });
  });
});
