import { Request, Response, NextFunction } from 'express';

type StatusClass = '2xx' | '3xx' | '4xx' | '5xx';

type HistogramBucket = {
  le: number;
  count: number;
};

type LatencyHistogram = {
  buckets: HistogramBucket[];
  count: number;
  sumMs: number;
  maxMs: number;
};

type RouteMetrics = {
  requests: number;
  errors: number;
  latency: LatencyHistogram;
};

const LATENCY_BUCKETS_MS = [50, 100, 250, 500, 1000, 2000, 5000, Number.POSITIVE_INFINITY];

const createHistogram = (): LatencyHistogram => ({
  buckets: LATENCY_BUCKETS_MS.map((le) => ({ le, count: 0 })),
  count: 0,
  sumMs: 0,
  maxMs: 0,
});

const metricsState = {
  startedAt: Date.now(),
  totalRequests: 0,
  inFlightRequests: 0,
  byMethod: new Map<string, number>(),
  byStatusClass: new Map<StatusClass, number>([
    ['2xx', 0],
    ['3xx', 0],
    ['4xx', 0],
    ['5xx', 0],
  ]),
  byRoute: new Map<string, RouteMetrics>(),
};

const toStatusClass = (statusCode: number): StatusClass => {
  if (statusCode >= 500) return '5xx';
  if (statusCode >= 400) return '4xx';
  if (statusCode >= 300) return '3xx';
  return '2xx';
};

const normalizePath = (path: string): string =>
  path
    .replace(/\/\d+/g, '/:id')
    .replace(/\/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, '/:uuid')
    .replace(/\/[A-Za-z0-9_-]{20,}/g, '/:token');

const observeLatency = (histogram: LatencyHistogram, durationMs: number) => {
  histogram.count += 1;
  histogram.sumMs += durationMs;
  histogram.maxMs = Math.max(histogram.maxMs, durationMs);

  for (const bucket of histogram.buckets) {
    if (durationMs <= bucket.le) {
      bucket.count += 1;
      break;
    }
  }
};

const toPercentile = (histogram: LatencyHistogram, percentile: number): number => {
  if (histogram.count === 0) return 0;
  const target = histogram.count * percentile;
  let cumulative = 0;

  for (const bucket of histogram.buckets) {
    cumulative += bucket.count;
    if (cumulative >= target) {
      return Number.isFinite(bucket.le) ? bucket.le : histogram.maxMs;
    }
  }

  return histogram.maxMs;
};

export const httpMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  metricsState.totalRequests += 1;
  metricsState.inFlightRequests += 1;

  const methodCount = metricsState.byMethod.get(req.method) ?? 0;
  metricsState.byMethod.set(req.method, methodCount + 1);

  res.on('finish', () => {
    metricsState.inFlightRequests = Math.max(0, metricsState.inFlightRequests - 1);

    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    const statusClass = toStatusClass(res.statusCode);
    const statusClassCount = metricsState.byStatusClass.get(statusClass) ?? 0;
    metricsState.byStatusClass.set(statusClass, statusClassCount + 1);

    const path = normalizePath(req.baseUrl ? `${req.baseUrl}${req.path}` : req.path);
    const routeKey = `${req.method} ${path}`;
    const routeMetrics = metricsState.byRoute.get(routeKey) ?? {
      requests: 0,
      errors: 0,
      latency: createHistogram(),
    };

    routeMetrics.requests += 1;
    if (res.statusCode >= 400) {
      routeMetrics.errors += 1;
    }
    observeLatency(routeMetrics.latency, durationMs);

    metricsState.byRoute.set(routeKey, routeMetrics);
  });

  next();
};

export const getHttpMetricsSnapshot = () => {
  const routes = Array.from(metricsState.byRoute.entries())
    .map(([route, data]) => {
      const avgMs = data.latency.count > 0 ? data.latency.sumMs / data.latency.count : 0;
      return {
        route,
        requests: data.requests,
        errors: data.errors,
        latencyMs: {
          avg: Number(avgMs.toFixed(2)),
          p50: toPercentile(data.latency, 0.5),
          p95: toPercentile(data.latency, 0.95),
          p99: toPercentile(data.latency, 0.99),
          max: Number(data.latency.maxMs.toFixed(2)),
        },
      };
    })
    .sort((a, b) => b.requests - a.requests);

  return {
    generatedAt: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - metricsState.startedAt) / 1000),
    http: {
      totalRequests: metricsState.totalRequests,
      inFlightRequests: metricsState.inFlightRequests,
      byMethod: Object.fromEntries(metricsState.byMethod),
      byStatusClass: Object.fromEntries(metricsState.byStatusClass),
      routes,
    },
  };
};
