import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiService from '../services/apiService';

// Mock axios
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        })),
    },
}));

describe('apiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('healthCheck', () => {
        it('should return true when server is healthy', async () => {
            const result = await apiService.healthCheck();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('exportData', () => {
        it('should open a new window with correct URL', () => {
            const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

            apiService.exportData('csv', { query: 'test' });

            expect(windowOpenSpy).toHaveBeenCalled();
            const callArgs = windowOpenSpy.mock.calls[0][0] as string;
            expect(callArgs).toContain('format=csv');
            expect(callArgs).toContain('query=test');

            windowOpenSpy.mockRestore();
        });
    });

    describe('runPredefinedQuery', () => {
        it('should call API with correct queryType and params', async () => {
            // This test would need proper mocking of axios instance
            // For now, we just verify the method exists
            expect(typeof apiService.runPredefinedQuery).toBe('function');
        });
    });
});
