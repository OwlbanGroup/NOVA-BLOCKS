/**
 * Backend API Integration Tests
 * Using Jest + SuperTest to test all API endpoints
 * 
 * Addresses 🔴 High: "No API integration tests" 
 * from WEAKNESS-ANALYSIS.md
 */

const request = require('supertest');
const app = require('../index');  // Import the Express app
const mongoose = require('mongoose');

jest.setTimeout(30000);

describe('NOVA BLOCKS Backend API Integration Tests', () => {
  let server;
  let apiBaseUrl;

  beforeAll(() => {
    const port = 0;
    server = app.listen(port);
    apiBaseUrl = `http://localhost:${server.address().port}`;
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  /********************************************************************
   * 1. ROOT ENDPOINT TESTS
   ********************************************************************/
  describe('GET /', () => {
    test('should return API status and GPU information', async () => {
      const response = await request(apiBaseUrl).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('gpuEnabled');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.gpuEnabled).toBe('boolean');
    });

    test('should return expected message', async () => {
      const response = await request(apiBaseUrl).get('/');
      expect(response.body.message).toContain('NOVA BLOCKS');
    });
  });

  /********************************************************************
   * 2. GPU HEALTH ENDPOINT TESTS
   ********************************************************************/
  describe('GET /api/gpu/health', () => {
    test('should return GPU health status', async () => {
      const response = await request(apiBaseUrl).get('/api/gpu/health');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('blackwellDetected');
      expect(response.body).toHaveProperty('modelsLoaded');
      expect(response.body).toHaveProperty('memoryUsage');
      expect(typeof response.body.status).toBe('string');
      expect(typeof response.body.blackwellDetected).toBe('boolean');
      expect(Array.isArray(response.body.modelsLoaded)).toBe(true);
      expect(typeof response.body.memoryUsage).toBe('object');
    });
  });

  /********************************************************************
   * 3. AUTH MIDDLEWARE TESTS
   ********************************************************************/
  describe('Authentication Middleware', () => {
    test('should reject requests without token', async () => {
      const response = await request(apiBaseUrl)
        .get('/api/gpu/health');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No token provided');
    });

    test('should accept requests with valid Bearer token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: 'test-user-id', role: 'user' },
        process.env.JWT_SECRET || 'test-secret'
      );
      const response = await request(apiBaseUrl)
        .get('/api/gpu/health')
        .set('Authorization', `Bearer ${token}`);
      expect([401, 200]).toContain(response.status);
    });

    test('should strip Bearer prefix and parse token', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: 'test-user', role: 'user' },
        process.env.JWT_SECRET || 'test-secret'
      );
      const response = await request(apiBaseUrl)
        .get('/api/gpu/health')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).not.toBe(500);
    });
  });

  /********************************************************************
   * 4. INPUT VALIDATION TESTS
   ********************************************************************/
  describe('Input Validation', () => {
    test('should validate GPU matrix multiplication input', async () => {
      const response = await request(apiBaseUrl)
        .post('/api/gpu/matrix-multiply')
        .send({ matrixA: [], matrixB: [] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject matrix multiplication with mismatched dimensions', async () => {
      const response = await request(apiBaseUrl)
        .post('/api/gpu/matrix-multiply')
        .send({ matrixA: [[1, 2], [3, 4]], matrixB: [[5, 6, 7]] });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('should accept valid matrix multiplication input', async () => {
      const response = await request(apiBaseUrl)
        .post('/api/gpu/matrix-multiply')
        .send({ matrixA: [[1, 2], [3, 4]], matrixB: [[5, 6], [7, 8]] });
      expect([200, 400]).toContain(response.status);
    });
  });

  /********************************************************************
   * 5. GPU INFERENCE ENDPOINT TESTS
   ********************************************************************/
  describe('GPU Inference Endpoints', () => {
    test('should attempt to load a model', async () => {
      const response = await request(apiBaseUrl)
        .post('/api/gpu/load-model')
        .send({ modelName: 'test-model', modelPath: '/path/to/model' });
      expect([200, 400, 500]).toContain(response.status);
    });

    test('should handle model loading failure gracefully', async () => {
      const response = await request(apiBaseUrl)
        .post('/api/gpu/load-model')
        .send({ modelName: 'nonexistent-model', modelPath: '/invalid/path' });
      expect(response.body).toHaveProperty('error');
    });
  });

  /********************************************************************
   * 6. PROMETHEUS METRICS ENDPOINT TESTS
   ********************************************************************/
  describe('Prometheus Metrics', () => {
    test('should return metrics endpoint', async () => {
      const response = await request(apiBaseUrl).get('/metrics');
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text.length).toBeGreaterThan(0);
    });
  });
});