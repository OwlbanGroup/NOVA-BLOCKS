const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming index.js exports the app

describe('Roadblock Reporting API', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/novablocks_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should report a new roadblock successfully', async () => {
    const response = await request(app)
      .post('/api/arena/join')
      .send({ description: 'Test roadblock' });
    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('Roadblock reported successfully!');
  });

  it('should return 400 if description is missing', async () => {
    const response = await request(app)
      .post('/api/arena/join')
      .send({});
    expect(response.statusCode).toBe(400);
  });
});
