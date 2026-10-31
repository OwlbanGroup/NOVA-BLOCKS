/**
 * Prometheus Metrics for NOVA BLOCKS Backend
 * Provides metrics endpoint at /metrics for Prometheus scraping
 * 
 * Metrics exposed:
 * - GET /api/metrics - raw Prometheus format
 * - Integration with Express middleware for automatic request tracking
 * 
 * Required dependency: prom-client
 * npm install prom-client --save
 */

const metrics = require('prom-client');

// Set default metrics collection (Node.js built-in)
metrics.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  registerInterval: 60
});

// Create custom counters and gauges

// 1. HTTP Request Counter
const requestCounter = new metrics.Counter({
  name: 'nova_blocks_requests_total',
  help: 'Total number of HTTP requests to NOVA BLOCKS API',
  labelNames: ['method', 'route', 'status'],
});

// 2. HTTP Request Duration Histogram
const requestDuration = new metrics.Histogram({
  name: 'nova_blocks_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
});

// 3. GPU Requests Counter
const gpuRequestCounter = new metrics.Counter({
  name: 'nova_blocks_gpu_requests_total',
  help: 'Total number of GPU inference requests',
  labelNames: ['model', 'status'],
});

// 4. GPU Memory Usage Gauge
const gpuMemoryGauge = new metrics.Gauge({
  name: 'nova_blocks_gpu_memory_usage_bytes',
  help: 'GPU memory usage in bytes',
  labelNames: ['model'],
});

// 5. Loaded Models Gauge
const modelsLoadedGauge = new metrics.Gauge({
  name: 'nova_blocks_models_loaded',
  help: 'Number of loaded GPU models',
  labelNames: [],
});

// 6. Active Connections Gauge
const activeConnectionsGauge = new metrics.Gauge({
  name: 'nova_blocks_active_connections',
  help: 'Number of active connections',
  labelNames: [],
});

// Track route paths for metrics
function trackRoute(path, method) {
  // Normalize route path for metrics (replace dynamic segments with placeholder)
  const normalizedPath = path.replace(/\/[^\/]+/g, '/:param');
  return normalizedPath;
}

// Express middleware to record metrics
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Capture original finish event
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // in seconds
    const route = trackRoute(req.route ? req.route.path : req.path, req.method);
    const status = res.statusCode;
    
    // Increment request counter
    requestCounter.inc({
      method: req.method,
      route: route,
      status: status,
    });
    
    // Observe request duration histogram
    requestDuration.observe({
      method: req.method,
      route: route,
    }, duration);
    
    // Increment GPU request counter if GPU-related route
    if (req.path.startsWith('/api/gpu/')) {
      const modelName = req.params.modelName || 'unknown';
      gpuRequestCounter.inc({
        model: modelName,
        status: status >= 400 ? 'error' : 'success',
      });
    }
    
    // Update active connections gauge
    activeConnectionsGauge.set(activeConnectionsGauge.inc(1));
  });
  
  next();
}

// Export metrics collection and middleware functions
module.exports = {
  metricsCollection: metrics,
  requestCounter,
  requestDuration,
  gpuRequestCounter,
  gpuMemoryGauge,
  modelsLoadedGauge,
  activeConnectionsGauge,
  metricsMiddleware,
  // Function to setup metrics endpoint on Express app
  setupMetricsEndpoint: (app) => {
    // Define metrics endpoint
    app.get('/api/metrics', async (req, res) => {
      try {
        res.set('Content-Type', metrics.register.contentType);
        res.end(metrics.register.metrics());
      } catch (ex) {
        console.error('Error collecting metrics:', ex);
        res.status(500).json({ error: 'Unable to collect metrics' });
      }
    });
    
    // Apply metrics middleware to all routes
    app.use(metricsMiddleware);
    
    // Initialize gauges with current backend state
    try {
      const gpuInference = require('./gpu_inference');
      modelsLoadedGauge.set(gpuInference ? gpuInference.models.size : 0);
    } catch (err) {
      modelsLoadedGauge.set(0);
    }
    
    console.log('✅ Prometheus metrics endpoint configured at /api/metrics');
  }
};
/**
 * Prometheus Metrics for NOVA BLOCKS Backend
 * Provides metrics endpoint at /metrics for Prometheus scraping
 * 
 * Metrics exposed:
 * - GET /api/metrics - raw Prometheus format
 * - Integration with Express middleware for automatic request tracking
 * 
 * Required dependency: prom-client
 * npm install prom-client --save
 */

const metrics = require('prom-client');

// Set default metrics collection (Node.js built-in)
metrics.collectDefaultMetrics({
  timeout: 5000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  registerInterval: 60
});

// Create custom counters and gauges

// 1. HTTP Request Counter
const requestCounter = new metrics.Counter({
  name: 'nova_blocks_requests_total',
  help: 'Total number of HTTP requests to NOVA BLOCKS API',
  labelNames: ['method', 'route', 'status'],
});

// 2. HTTP Request Duration Histogram
const requestDuration = new metrics.Histogram({
  name: 'nova_blocks_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5, 5, 10],
});

// 3. GPU Requests Counter
const gpuRequestCounter = new metrics.Counter({
  name: 'nova_blocks_gpu_requests_total',
  help: 'Total number of GPU inference requests',
  labelNames: ['model', 'status'],
});

// 4. GPU Memory Usage Gauge
const gpuMemoryGauge = new metrics.Gauge({
  name: 'nova_blocks_gpu_memory_usage_bytes',
  help: 'GPU memory usage in bytes',
  labelNames: ['model'],
});

// 5. Loaded Models Gauge
const modelsLoadedGauge = new metrics.Gauge({
  name: 'nova_blocks_models_loaded',
  help: 'Number of loaded GPU models',
  labelNames: [],
});

// 6. Active Connections Gauge
const activeConnectionsGauge = new metrics.Gauge({
  name: 'nova_blocks_active_connections',
  help: 'Number of active connections',
  labelNames: [],
});

// Track route paths for metrics
function trackRoute(path, method) {
  // Normalize route path for metrics (replace dynamic segments with placeholder)
  const normalizedPath = path.replace(/\/[^\/]+/g, '/:param');
  return normalizedPath;
}

// Express middleware to record metrics
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Capture original finish event
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // in seconds
    const route = trackRoute(req.route ? req.route.path : req.path, req.method);
    const status = res.statusCode;
    
    // Increment request counter
    requestCounter.inc({
      method: req.method,
      route: route,
      status: status,
    });
    
    // Observe request duration histogram
    requestDuration.observe({
      method: req.method,
      route: route,
    }, duration);
    
    // Increment GPU request counter if GPU-related route
    if (req.path.startsWith('/api/gpu/')) {
      const modelName = req.params.modelName || 'unknown';
      gpuRequestCounter.inc({
        model: modelName,
        status: status >= 400 ? 'error' : 'success',
      });
    }
    
    // Update active connections gauge
    activeConnectionsGauge.set(activeConnectionsGauge.inc(1));
  });
  
  next();
}

// Export metrics collection and middleware functions
module.exports = {
  metricsCollection: metrics,
  requestCounter,
  requestDuration,
  gpuRequestCounter,
  gpuMemoryGauge,
  modelsLoadedGauge,
  activeConnectionsGauge,
  metricsMiddleware,
  // Function to setup metrics endpoint on Express app
  setupMetricsEndpoint: (app) => {
    // Define metrics endpoint
    app.get('/api/metrics', async (req, res) => {
      try {
        res.set('Content-Type', metrics.register.contentType);
        res.end(metrics.register.metrics());
      } catch (ex) {
        console.error('Error collecting metrics:', ex);
        res.status(500).json({ error: 'Unable to collect metrics' });
      }
    });
    
    // Apply metrics middleware to all routes
    app.use(metricsMiddleware);
    
    // Initialize gauges with current backend state
    try {
      const gpuInference = require('./gpu_inference');
      modelsLoadedGauge.set(gpuInference ? gpuInference.models.size : 0);
    } catch (err) {
      modelsLoadedGauge.set(0);
    }
    
    console.log('✅ Prometheus metrics endpoint configured at /api/metrics');
  }
};