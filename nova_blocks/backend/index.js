const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const pqcrypto = require('pqcrypto');
const BlackwellGPUInference = require('./gpu_inference');
const { logger, createRequestContext } = require('./logger');  // NEW: Winston logger

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// Environment variable validation on startup
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'ALLOWED_ORIGINS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set the required environment variables and restart the application.');
  process.exit(1);
}

// Initialize Blackwell GPU Inference
const gpuInference = new BlackwellGPUInference();

// Rate limiting - prevent brute force attacks
const limiter = require('./middleware/rateLimitMiddleware');
app.use('/api/', limiter);

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
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());

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
app.get('/api/gpu/health', async (req, res) => {
  try {
    const gpuStats = gpuInference.getGPUStats();
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
app.post('/api/gpu/predict/:modelName', async (req, res) => {
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
    res.status(500).json({ error: 'Prediction failed', details: error.message });
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
app.post('/api/gpu/batch-predict/:modelName', async (req, res) => {
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

// Database connection - FIX: removed deprecated Mongoose 7+ options and added retry
let mongooseConnected = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-blocks')
  .then(() => {
    mongooseConnected = true;
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Retry connection after 5 seconds if not connected
const retryInterval = setInterval(() => {
  if (!mongooseConnected) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-blocks')
      .then(() => {
        mongooseConnected = true;
        console.log('Reconnected to MongoDB');
      })
      .catch(err2 => {
        console.error('MongoDB reconnection failed:', err2);
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
