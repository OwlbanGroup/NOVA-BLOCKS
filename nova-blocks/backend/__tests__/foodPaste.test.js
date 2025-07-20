const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming index.js exports the app

describe('AI Food Paste API', () => {
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

  it('should create food paste successfully', async () => {
    const response = await request(app)
      .post('/api/create-food-paste')
      .send({ ingredients: 'ingredient1, ingredient2' });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return 400 if ingredients are missing or invalid', async () => {
    const response = await request(app)
      .post('/api/create-food-paste')
      .send({ ingredients: '' });
    expect(response.statusCode).toBe(400);
  });
});
