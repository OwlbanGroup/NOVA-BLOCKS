const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const pqcrypto = require('pqcrypto');
const BlackwellGPUInference = require('./gpu_inference');

const app = express();
app.disable('x-powered-by');
const PORT = process.env.PORT || 5000;

// Initialize Blackwell GPU Inference
const gpuInference = new BlackwellGPUInference();

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
app.post('/api/gpu/predict/:modelName', async (req, res) => {
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
app.get('/', (req, res) => {
  res.json({
    message: 'NOVA BLOCKS Backend API with NVIDIA Blackwell GPU Acceleration',
    gpuEnabled: gpuInference.getGPUStats().blackwellDetected
  });
});

// Database connection - FIX: removed deprecated Mongoose 7+ options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nova-blocks')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await gpuInference.cleanup();
  process.exit(0);
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 NOVA BLOCKS Backend running on port ${PORT}`);
  console.log(`🎯 Blackwell GPU Status: ${gpuInference.getGPUStats().blackwellDetected ? 'ENABLED' : 'DISABLED'}`);
});
