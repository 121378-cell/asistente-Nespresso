const createRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const buildTraceHeaders = (): Record<string, string> => ({
  'x-request-id': createRequestId(),
});
