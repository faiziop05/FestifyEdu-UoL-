const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Users = require('../../src/models/users');
const Organizations = require('../../src/models/organizations');

describe('Auth API', () => {
  let testUser;
  let testOrg;

  beforeAll(async () => {
    // Create an organization
    testOrg = await Organizations.create({ 
      name: 'Test Org',
      organization_name: 'Test Org Name',
      domain: 'test.com',
      country: 'UK',
      postcode: '12345',
      city: 'London',
      address: '123 Test St'
    });
  });

  beforeEach(async () => {
    // Create a test user before each test
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await Users.create({
      name: 'Test Teacher',
      email: 'teacher@test.com',
      password: hashedPassword,
      role: 'teacher',
      organization_id: testOrg._id
    });
  });

    describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('teacher@test.com');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail if user does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    it('should fail if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@test.com'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update profile when authenticated', async () => {
      // First login to get token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'teacher@test.com',
          password: 'password123'
        });
      
      const token = loginRes.body.token;

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Updated Name');
    });

    it('should fail if no token provided', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Updated Name'
        });

      expect(res.statusCode).toBeDefined();
    });
  });
});
