import { vi } from 'vitest';

// Create mock axios instance first
export const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    request: vi.fn(),
    interceptors: {
        request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
    },
};

// Mock axios module
vi.mock('axios', () => ({
    default: {
        create: vi.fn(() => mockAxiosInstance),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));
