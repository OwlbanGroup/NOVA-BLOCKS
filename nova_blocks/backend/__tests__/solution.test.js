const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming index.js exports the app

describe('Solution Creation API', () => {
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

  it('should create a new solution successfully', async () => {
    const response = await request(app)
      .post('/api/pc/create')
      .send({ solution: 'Test solution' });
    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('Solution suggested successfully!');
  });

  it('should return 400 if solution is missing', async () => {
    const response = await request(app)
      .post('/api/pc/create')
      .send({});
    expect(response.statusCode).toBe(400);
  });
});
