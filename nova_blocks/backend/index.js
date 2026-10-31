const joi = require('joi');  // NEW: For input validation

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const pqcrypto = require('pqcrypto');
const BlackwellGPUInference = require('./gpu_inference');
const { logger, createRequestContext } = require('./logger');  // NEW: Winston logger
const { validateRequest, matrixMultiplySchema, healthCheckSchema } = require('./middleware/validationMiddleware');  // NEW: Input validation middleware
const { errorMiddleware, wrapAsync } = require('./middleware/errorMiddleware');  // NEW: Error handling middleware

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// Environment variable validation on startup
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'ALLOWED_ORIGINS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  logger.error('Please set the required environment variables and restart the application.');
  process.exit(1);
}

// Initialize Blackwell GPU Inference
const gpuInference = new BlackwellGPUInference();

// Rate limiting - prevent brute force attacks
const { generalLimiter, authLimiter, gpuLimiter } = require('./middleware/rateLimitMiddleware');

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Apply auth rate limiter to auth routes only
const authRoutes = ['/api/auth/login', '/api/auth/register'];
authRoutes.forEach(route => {
  app.use(route, authLimiter);
});

// Apply GPU operation rate limiter to GPU routes
const gpuRoutes = ['/api/gpu/*'];
gpuRoutes.forEach(route => {
  app.use(route, gpuLimiter);
});

// Prometheus metrics setup
const { 
  metricsCollection, 
  requestCounter, 
  requestDuration, 
  gpuRequestCounter, 
  gpuMemoryGauge, 
  modelsLoadedGauge, 
  activeConnectionsGauge, 
  metricsMiddleware, 
  setupMetricsEndpoint 
} = require('./prometheus-metrics');  // Prometheus metrics

// Initialize Prometheus metrics endpoint
setupMetricsEndpoint(app);

// Create request correlation context
const requestContext = createRequestContext();

// Set up request ID and logging middleware
app.use((req, res, next) => {
  req.correlationId = Math.random().toString(36).substring(2, 15) || undefined;
  next();
});

// Log incoming requests
app.use((req, res, next) => {
  logger.info({
    message: 'Incoming request',
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  next();
});

// Log response completion
app.use((req, res, next) => {
  res.on('finish', () => {
    logger.info({
      message: 'Request completed',
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode
    });
  });
  next();
});
// Middleware
// CORS configuration - allow specific origins from environment variable for security
// Default to restricted origin list in production, allow specific origins in development
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin)
  : process.env.NODE_ENV !== 'production' 
    ? ['http://localhost:3000', 'http://localhost:3001'] 
    : undefined; // undefined means no origins allowed in production without config

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  // Explicitly disable methods that are rarely needed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-Correlation-Id'],
  // Cache preflight response for 24 hours
  maxAge: 86400,
  // Enable CORS preflight handler
  optionsSuccessStatus: 204
};
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());

// NEW: Global error handling middleware - must be placed after all other middleware
app.use(errorMiddleware);

// Blackwell GPU Health Check
/**
 * @swagger
 * /api/gpu/health:
 *   get:
 *     summary: Check GPU health status
 *     tags: [GPU]
 *     responses:
 *       200:
 *         description: GPU health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 blackwellDetected:
 *                   type: boolean
 *                 modelsLoaded:
 *                   type: array
 *                 memoryUsage:
 *                   type: object
 */
app.get('/api/gpu/health', validateQuery(healthCheckSchema), wrapAsync(async (req, res) => {
  try {
    const includeStats = req.query.includeStats;
    const gpuStats = gpuInference.getGPUStats(includeStats);
    res.json({
      status: 'healthy',
      blackwellDetected: gpuStats.blackwellDetected,
      modelsLoaded: gpuStats.modelsLoaded.length,
      memoryUsage: gpuStats.memoryUsage
    });
  } catch (error) {
    res.status(500).json({ error: 'GPU health check failed', details: error.message });
  }
});

// Blackwell GPU Inference Endpoint
/**
 * @swagger
 * /api/gpu/predict/{modelName}:
 *   post:
 *     summary: Run GPU inference prediction
 *     tags: [GPU]
 *     parameters:
 *       - name: modelName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Prediction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prediction:
 *                   type: array
 *                   items:
 *                     type: number
 *       400:
 *         description: Bad request - validation error
 *       404:
 *         description: Model not found
 */
app.post('/api/gpu/predict/:modelName', validateParams(joi.object({ modelName: joi.string().alphanum().min(1).max(50) })), wrapAsync(async (req, res) => {
  try {
    const { modelName } = req.params;
    
    // FIX: Input validation and path traversal prevention
    if (!modelName || typeof modelName !== 'string') {
      return res.status(400).json({ error: 'Model name is required' });
    }
    if (modelName.length === 0) {
      return res.status(400).json({ error: 'Model name cannot be empty' });
    }
    if (modelName.includes('..') || modelName.includes('/') || modelName.includes('\\\\')) {
      return res.status(400).json({ error: 'Invalid model name - path traversal detected' });
    }
    
    // Check if model exists
    const model = gpuInference.models.get(modelName);
    if (!model) {
      return res.status(404).json({ error: `Model ${modelName} not loaded` });
    }
    
    const { input } = req.body;
    if (!input || !Array.isArray(input)) {
      return res.status(400).json({ error: 'Input array is required' });
    }
  try {
    const { modelName } = req.params;
    const { input } = req.body;

    // FIX: Input validation
    if (!input) {
      return res.status(400).json({ error: 'Input data required' });
    }
    if (!Array.isArray(input) || input.length === 0) {
      return res.status(400).json({ error: 'Input must be a non-empty array' });
    }
// Validate input is numeric
    if (!input.every(val => typeof val === 'number' && !Number.isNaN(val))) {
      return res.status(400).json({ error: 'Input must contain only numeric values' });
    }

    const prediction = await gpuInference.predict(modelName, input);
    res.json({ prediction });
  } catch (error) {
    res.status(500).json({ error: 'Model validation failed', details: error.message });
  }
  } catch (error) {
    res.status(500).json({ error: 'Outer error', details: error.message });
  }
});

// Blackwell Batch Prediction Endpoint
/**
 * @swagger
 * /api/gpu/batch-predict/{modelName}:
 *   post:
 *     summary: Run GPU batch inference prediction
 *     tags: [GPU]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inputs:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       200:
 *         description: Batch prediction results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 predictions:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: number
 *       400:
 *         description: Bad request - validation error
 */
app.post('/api/gpu/batch-predict/:modelName', validateParams(joi.object({ modelName: joi.string().alphanum().min(1).max(50) }), wrapAsync(async (req, res) => {
  try {
    const { modelName } = req.params;
    const { inputs } = req.body;

    // FIX: Input validation
    if (!inputs || !Array.isArray(inputs)) {
      return res.status(400).json({ error: 'Batch inputs array required' });
    }
    if (inputs.length === 0) {
      return res.status(400).json({ error: 'Batch inputs array cannot be empty' });
    }
// Validate all inputs are arrays of numbers
    if (!inputs.every(item => Array.isArray(item) && item.every(val => typeof val === 'number' && !Number.isNaN(val)))) {
      return res.status(400).json({ error: 'Each input must be an array of numeric values' });
    }
    // Limit batch size for security
    if (inputs.length > 100) {
      return res.status(400).json({ error: 'Batch size cannot exceed 100 inputs' });
    }

    const predictions = await gpuInference.batchPredict(modelName, inputs);
    res.json({ predictions });
  } catch (error) {
    res.status(500).json({ error: 'Batch prediction failed', details: error.message });
  }
});

// Load Blackwell Model Endpoint
/**
 * @swagger
 * /api/gpu/load-model:
 *   post:
 *     summary: Load a Blackwell model for inference
 *     tags: [GPU]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *               modelPath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Model load status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 modelName:
 *                   type: string
 *       400:
 *         description: Bad request - validation error
 */
app.post('/api/gpu/load-model', async (req, res) => {
  try {
    const { modelName, modelPath } = req.body;

    // FIX: Input validation
    if (!modelName || !modelPath) {
      return res.status(400).json({ error: 'Model name and path required' });
    }
    if (typeof modelName !== 'string' || modelName.length === 0) {
      return res.status(400).json({ error: 'Model name must be a non-empty string' });
    }
    if (typeof modelPath !== 'string' || modelPath.length === 0) {
      return res.status(400).json({ error: 'Model path must be a non-empty string' });
    }
    // Sanitize model name to prevent path traversal
    if (modelName.includes('..') || modelName.includes('/') || modelName.includes('\\')) {
      return res.status(400).json({ error: 'Invalid model name' });
    }

    const success = await gpuInference.loadModel(modelName, modelPath);
    res.json({ success, modelName });
  } catch (error) {
    res.status(500).json({ error: 'Model loading failed', details: error.message });
  }
});

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API status and GPU info
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: API status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 gpuEnabled:
 *                   type: boolean
 */
app.get('/', (req, res) => {
  res.json({
    message: 'NOVA BLOCKS Backend API with NVIDIA Blackwell GPU Acceleration',
    gpuEnabled: gpuInference.getGPUStats().blackwellDetected
  });
});

// Matrix multiply route with input validation
app.post('/api/gpu/matrix-multiply', validateRequest(matrixMultiplySchema), wrapAsync(async (req, res) => {
  try {
    const { matrixA, matrixB } = req.body;

    // Additional dimension validation
    if (matrixA[0].length !== matrixB.length) {
      return res.status(400).json({
        error: 'Dimension mismatch: matrixA columns must equal matrixB rows'
      });
    }

    const result = await gpuInference.matrixMultiply(matrixA, matrixB);
    res.json({ result });
  } catch (error) {
    console.error('Matrix multiply error:', error.message);
    res.status(500).json({ error: 'Matrix multiplication failed', details: error.message });
  }
});

// Database connection - FIX: Mongoose 7+ defaults, no deprecated options
let mongooseConnected = false;

// Mongoose 7+ removed need for explicit useNewUrlParser/useUnifiedTopology
// These options are now defaults and causing deprecation warnings
const mongooseConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip IPv6
};

// Initial connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-blocks', mongooseConnectOptions)
  .then(() => {
    mongooseConnected = true;
    logger.info('✅ Connected to MongoDB');
  })
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err.message);
  });

// Retry connection after 5 seconds if not connected
const retryInterval = setInterval(() => {
  if (!mongooseConnected) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-blocks', mongooseConnectOptions)
      .then(() => {
        mongooseConnected = true;
        logger.info('✅ Reconnected to MongoDB');
      })
      .catch(err2 => {
        logger.error('❌ MongoDB reconnection failed:', err2.message);
      });
  }
}, 5000);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await gpuInference.cleanup();
  // Clear the mongoose retry interval
  clearInterval(retryInterval);
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 NOVA BLOCKS Backend running on port ${PORT}`);
  console.log(`🎯 Blackwell GPU Status: ${gpuInference.getGPUStats().blackwellDetected ? 'ENABLED' : 'DISABLED'}`);
});

/**
 * @swagger
 * /api/gpu/matrix-multiply:
 *   post:
 *     summary: Perform matrix multiplication using Blackwell GPU
 *     tags: [GPU]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matrixA:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *               matrixB:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       200:
 *         description: Matrix multiplication result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: array
 *                   items:
 *                     type: array
 *                     items:
 *                       type: number
 *       400:
 *         description: Bad request - dimension mismatch or validation error
 */
