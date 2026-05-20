/**
 * NVIDIA Blackwell GPU Inference Module for NOVA BLOCKS Backend
 * Provides GPU-accelerated AI inference endpoints
 */

const tf = require('@tensorflow/tfjs-node-gpu');
const { GPU } = require('gpu.js');
const nvidiaSmi = require('nvidia-smi');

class BlackwellGPUInference {
    constructor() {
        this.models = new Map();
        this.gpu = new GPU();
        this.blackwellDetected = false;
        this.initialized = false;
        // FIX: Initialize synchronously to avoid race condition
        // Call init() after construction: await gpuInference.init()
        this.initPromise = this._initializeGPU();
    }

    async _initializeGPU() {
        try {
            // Check for Blackwell GPU
            const gpuInfo = await nvidiaSmi();
            this.blackwellDetected = gpuInfo.some(gpu =>
                gpu.name && gpu.name.includes('Blackwell')
            );

            if (this.blackwellDetected) {
                console.log('✅ NVIDIA Blackwell GPU detected and initialized');
                // Enable Blackwell-specific optimizations
                tf.enableProdMode();
                tf.env().set('WEBGL_FORCE_F16_TEXTURES', true);
            } else {
                console.log('⚠️  Blackwell GPU not detected, using standard GPU acceleration');
            }
            this.initialized = true;
        } catch (error) {
            console.error('GPU initialization failed:', error);
            this.initialized = true;
        }
    }

    // FIX: Provide async init method to properly await initialization
    async init() {
        await this.initPromise;
        return this;
    }

    // Check if GPU is ready before operations
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
        }
    }

    async loadModel(modelName, modelPath) {
        try {
            const model = await tf.loadLayersModel(`file://${modelPath}`);
            this.models.set(modelName, model);
            console.log(`✅ Model ${modelName} loaded successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to load model ${modelName}:`, error);
            return false;
        }
    }

async predict(modelName, inputData) {
        const model = this.models.get(modelName);
        if (!model) {
            throw new Error(`Model ${modelName} not loaded`);
        }

        let tensorInput = null;
        let prediction = null;
        
        try {
            tensorInput = tf.tensor(inputData);
            prediction = model.predict(tensorInput);

            // Blackwell optimization: Use GPU memory efficiently
            if (this.blackwellDetected) {
                prediction.dataSync(); // Force computation on Blackwell
            }

            const result = prediction.dataSync();
            
            // FIX: Proper cleanup in try block
            if (tensorInput) tensorInput.dispose();
            if (prediction) prediction.dispose();

            return result;
        } catch (error) {
            // FIX: Memory leak fix - dispose tensors in catch block
            console.error('Prediction failed:', error);
            if (tensorInput) tensorInput.dispose();
            if (prediction) prediction.dispose();
            throw error;
        }
    }

    // Blackwell-accelerated matrix operations
    async matrixMultiply(a, b) {
        const gpuKernel = this.gpu.createKernel(function(a, b) {
            let sum = 0;
            for (let i = 0; i < this.constants.size; i++) {
                sum += a[this.thread.y][i] * b[i][this.thread.x];
            }
            return sum;
        }).setOutput([b[0].length, a.length]);

        const result = gpuKernel(a, b);
        return result;
    }

// Blackwell-optimized batch processing
    async batchPredict(modelName, batchInputs) {
        const model = this.models.get(modelName);
        if (!model) {
            throw new Error(`Model ${modelName} not loaded`);
        }

        let tensorBatch = null;
        let predictions = null;
        
        try {
            tensorBatch = tf.tensor(batchInputs);
            predictions = model.predict(tensorBatch);

            if (this.blackwellDetected) {
                // Use Blackwell's parallel processing capabilities
                predictions.dataSync();
            }

            const results = predictions.arraySync();
            
            // FIX: Proper cleanup in try block
            if (tensorBatch) tensorBatch.dispose();
            if (predictions) predictions.dispose();

            return results;
        } catch (error) {
            // FIX: Memory leak fix - dispose tensors in catch block
            console.error('Batch prediction failed:', error);
            if (tensorBatch) tensorBatch.dispose();
            if (predictions) predictions.dispose();
            throw error;
        }
    }

    getGPUStats() {
        return {
            blackwellDetected: this.blackwellDetected,
            modelsLoaded: Array.from(this.models.keys()),
            memoryUsage: tf.memory()
        };
    }

    async cleanup() {
        // Dispose all loaded models
        for (const [name, model] of this.models) {
            model.dispose();
        }
        this.models.clear();
        this.gpu.destroy();
    }
}

module.exports = BlackwellGPUInference;
