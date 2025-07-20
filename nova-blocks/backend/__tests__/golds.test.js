const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming index.js exports the app

describe('Golds Enhancement API', () => {
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

  it('should enhance gold capabilities successfully', async () => {
    const response = await request(app)
      .post('/api/golds/enhance')
      .send({ feature: 'New Feature' });
    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('Gold capabilities enhanced with feature: New Feature');
  });

  it('should return 400 if feature is missing', async () => {
    const response = await request(app)
      .post('/api/golds/enhance')
      .send({});
    expect(response.statusCode).toBe(400);
  });
});
