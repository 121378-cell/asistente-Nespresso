import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import './mocks/axios';

afterEach(() => {
  cleanup();
});
