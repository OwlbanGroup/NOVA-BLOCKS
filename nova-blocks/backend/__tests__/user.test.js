const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const app = require('../index'); // Assuming index.js exports the app

describe('User Registration API', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect('mongodb://localhost:27017/novablocks_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up database and close connection
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/arena/create')
      .send({ username: 'testuser', password: 'testpassword' });
    expect(response.statusCode).toBe(201);
    expect(response.text).toBe('User registered successfully!');
  });

  it('should return 400 if username or password is missing', async () => {
    const response = await request(app)
      .post('/api/arena/create')
      .send({ username: '', password: '' });
    expect(response.statusCode).toBe(400);
  });
});
