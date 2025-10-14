const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const pqcrypto = require('pqcrypto');
const BlackwellGPUInference = require('./gpu_inference');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Blackwell GPU Inference
const gpuInference = new BlackwellGPUInference();

// Middleware
app.use(cors());
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

    if (!input) {
      return res.status(400).json({ error: 'Input data required' });
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

    if (!inputs || !Array.isArray(inputs)) {
      return res.status(400).json({ error: 'Batch inputs array required' });
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

    if (!modelName || !modelPath) {
      return res.status(400).json({ error: 'Model name and path required' });
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

// Database connection
mongoose.connect('mongodb://localhost:27017/nova-blocks', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
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
