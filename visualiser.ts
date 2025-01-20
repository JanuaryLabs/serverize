import { readFile } from 'node:fs/promises';

interface TraefikLogEntry {
  Duration: number;
  DownstreamStatus: number;
  RequestPath: string;
  RequestMethod: string;
  time: string;
  ServiceName?: string;
  RouterName: string;
  RequestAddr: string;
  RequestContentSize: number;
  RequestCount: number;
  RequestHost: string;
  RequestPort: string;
  RequestProtocol: string;
  RequestScheme: string;
  RetryAttempts: number;
  OriginDuration: number;
  OriginStatus: number;
  entryPointName: string;
  RequestReferer: string; // Add this field
}

interface ChartMetrics {
  duration: number;
  statusCode: number;
  path: string;
  method: string;
  timestamp: Date;
  service: string;
  router: string;
}

interface EnhancedChartMetrics extends ChartMetrics {
  requestSize: number;
  requestCount: number;
  host: string;
  protocol: string;
  retries: number;
  originDuration: number;
  originStatus: number;
  entryPoint: string;
  timeOfDay: number;
  dayOfWeek: number;
  referrer: string; // Add this field
}

function parseTraefikLogs(logLines: string[]): EnhancedChartMetrics[] {
  return logLines
    .map((line) => {
      try {
        const entry: TraefikLogEntry = JSON.parse(line);
        const timestamp = new Date(entry.time);

        return {
          duration: entry.Duration / 1000000, // Convert to milliseconds
          statusCode: entry.DownstreamStatus,
          path: entry.RequestPath,
          method: entry.RequestMethod,
          timestamp: new Date(entry.time),
          service: entry.ServiceName || 'unknown',
          router: entry.RouterName,
          requestSize: entry.RequestContentSize,
          requestCount: entry.RequestCount,
          host: entry.RequestHost,
          protocol: `${entry.RequestProtocol}/${entry.RequestScheme}`,
          retries: entry.RetryAttempts,
          originDuration: entry.OriginDuration / 1000000, // ms
          originStatus: entry.OriginStatus,
          entryPoint: entry.entryPointName,
          timeOfDay: timestamp.getHours(),
          dayOfWeek: timestamp.getDay(),
          referrer: entry.RequestReferer || '-', // Add this field
        };
      } catch (error) {
        console.error('Failed to parse log line:', error);
        return null;
      }
    })
    .filter((entry): entry is EnhancedChartMetrics => entry !== null);
}

interface HostStatistics {
  requests: {
    total: number;
    perHour: Record<number, number>;
    perPath: Record<string, number>;
    perMethod: Record<string, number>;
    referrers: Record<string, number>; // Add this field
  };
  performance: {
    averageDuration: number;
    maxDuration: number;
    totalDuration: number;
  };
  status: {
    codes: Record<number, number>;
    successRate: number;
  };
  topPaths: Array<{ path: string; count: number }>;
  topReferrers: Array<{ referrer: string; count: number }>; // Add this field
}

function analyzeMetrics(
  metrics: EnhancedChartMetrics[],
): Record<string, HostStatistics> {
  const hostStats: Record<string, HostStatistics> = {};

  // Group metrics by host
  metrics.forEach((metric) => {
    if (!hostStats[metric.host]) {
      hostStats[metric.host] = {
        requests: {
          total: 0,
          perHour: {},
          perPath: {},
          perMethod: {},
          referrers: {}, // Add this field
        },
        performance: {
          averageDuration: 0,
          maxDuration: 0,
          totalDuration: 0,
        },
        status: {
          codes: {},
          successRate: 0,
        },
        topPaths: [],
        topReferrers: [], // Add this field
      };
    }

    const stats = hostStats[metric.host];

    // Update request counts
    stats.requests.total++;
    stats.requests.perHour[metric.timeOfDay] =
      (stats.requests.perHour[metric.timeOfDay] || 0) + 1;
    stats.requests.perPath[metric.path] =
      (stats.requests.perPath[metric.path] || 0) + 1;
    stats.requests.perMethod[metric.method] =
      (stats.requests.perMethod[metric.method] || 0) + 1;

    // Update performance metrics
    stats.performance.totalDuration += metric.duration;
    stats.performance.maxDuration = Math.max(
      stats.performance.maxDuration,
      metric.duration,
    );

    // Update status codes
    stats.status.codes[metric.statusCode] =
      (stats.status.codes[metric.statusCode] || 0) + 1;

    // Update referrers
    stats.requests.referrers[metric.referrer] =
      (stats.requests.referrers[metric.referrer] || 0) + 1;
  });

  // Calculate derived statistics for each host
  Object.values(hostStats).forEach((stats) => {
    // Calculate average duration
    stats.performance.averageDuration =
      stats.performance.totalDuration / stats.requests.total;

    // Calculate success rate
    const successfulRequests = Object.entries(stats.status.codes)
      .filter(([code]) => Number(code) >= 200 && Number(code) < 300)
      .reduce((sum, [, count]) => sum + count, 0);
    stats.status.successRate =
      (successfulRequests / stats.requests.total) * 100;

    // Calculate top paths
    stats.topPaths = Object.entries(stats.requests.perPath)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top referrers
    stats.topReferrers = Object.entries(stats.requests.referrers)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  return hostStats;
}

interface WidgetMetrics {
  requestVolume: {
    total: number;
    timeline: Record<string, number>; // timestamp -> count
  };
  topClients: Array<{
    ip: string;
    requests: number;
  }>;
  statusDistribution: Record<number, number>;
  topEndpoints: Array<{
    path: string;
    hits: number;
  }>;
  responseTime: {
    average: number;
    timeline: Array<{ time: string; duration: number }>;
  };
  dataTransfer: {
    total: number;
    timeline: Record<string, number>; // timestamp -> bytes
  };
  methodDistribution: Record<string, number>;
  routerUsage: Array<{
    router: string;
    requests: number;
  }>;
  failedRequests: Array<{
    path: string;
    status: number;
    timestamp: string;
  }>;
  entryPointTraffic: Record<string, number>;
}

function generateWidgetMetrics(metrics: EnhancedChartMetrics[]): WidgetMetrics {
  const widgets: WidgetMetrics = {
    requestVolume: { total: 0, timeline: {} },
    topClients: [],
    statusDistribution: {},
    topEndpoints: [],
    responseTime: { average: 0, timeline: [] },
    dataTransfer: { total: 0, timeline: {} },
    methodDistribution: {},
    routerUsage: [],
    failedRequests: [],
    entryPointTraffic: {},
  };

  // Temporary data collectors
  const clientRequests = new Map<string, number>();
  const endpointHits = new Map<string, number>();
  const routerHits = new Map<string, number>();
  let totalDuration = 0;

  metrics.forEach((metric) => {
    // Request Volume
    const timeKey = metric.timestamp.toISOString();
    widgets.requestVolume.timeline[timeKey] =
      (widgets.requestVolume.timeline[timeKey] || 0) + 1;
    widgets.requestVolume.total++;

    // Top Clients
    clientRequests.set(metric.host, (clientRequests.get(metric.host) || 0) + 1);

    // Status Distribution
    widgets.statusDistribution[metric.statusCode] =
      (widgets.statusDistribution[metric.statusCode] || 0) + 1;

    // Endpoint Hits
    endpointHits.set(metric.path, (endpointHits.get(metric.path) || 0) + 1);

    // Response Time
    totalDuration += metric.duration;
    widgets.responseTime.timeline.push({
      time: timeKey,
      duration: metric.duration,
    });

    // Data Transfer
    widgets.dataTransfer.total += metric.requestSize;
    widgets.dataTransfer.timeline[timeKey] =
      (widgets.dataTransfer.timeline[timeKey] || 0) + metric.requestSize;

    // Method Distribution
    widgets.methodDistribution[metric.method] =
      (widgets.methodDistribution[metric.method] || 0) + 1;

    // Router Usage
    routerHits.set(metric.router, (routerHits.get(metric.router) || 0) + 1);

    // Failed Requests (4xx and 5xx)
    if (metric.statusCode >= 400) {
      widgets.failedRequests.push({
        path: metric.path,
        status: metric.statusCode,
        timestamp: timeKey,
      });
    }

    // Entry Point Traffic
    widgets.entryPointTraffic[metric.entryPoint] =
      (widgets.entryPointTraffic[metric.entryPoint] || 0) + 1;
  });

  // Process collected data
  widgets.responseTime.average = totalDuration / metrics.length;

  widgets.topClients = Array.from(clientRequests.entries())
    .map(([ip, requests]) => ({ ip, requests }))
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 10);

  widgets.topEndpoints = Array.from(endpointHits.entries())
    .map(([path, hits]) => ({ path, hits }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  widgets.routerUsage = Array.from(routerHits.entries())
    .map(([router, requests]) => ({ router, requests }))
    .sort((a, b) => b.requests - a.requests);

  return widgets;
}

// Example usage:
const logLines = (await readFile('docker/tmp/log/traefik/access.log', 'utf-8'))
  .split('\n')
  .filter(Boolean);
const metrics = parseTraefikLogs(logLines);
const hostStatistics = analyzeMetrics(metrics);
console.dir(hostStatistics, { depth: null });

const widgetMetrics = generateWidgetMetrics(metrics);
console.log(JSON.stringify(widgetMetrics, null, 2));
