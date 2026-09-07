const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../src/middlewares/authMiddleware');
const { requireRole, requireRoles } = require('../../src/middlewares/roleMiddleware');

describe('RBAC Middlewares', () => {
  let app;
  
  beforeAll(() => {
    // Set a dummy secret for testing
    process.env.JWT_SECRET = 'test_secret';

    app = express();
    app.use(express.json());

    // Dummy routes protected by middleware
    app.get('/protected', authMiddleware, (req, res) => res.status(200).json({ success: true }));
    app.get('/admin-only', authMiddleware, requireRole('admin'), (req, res) => res.status(200).json({ success: true }));
    app.get('/teacher-or-admin', authMiddleware, requireRoles(['teacher', 'admin']), (req, res) => res.status(200).json({ success: true }));
  });

  const generateToken = (role) => {
    return jwt.sign({ _id: '123', role, email: 'test@test.com' }, process.env.JWT_SECRET);
  };

  describe('authMiddleware', () => {
    it('should deny access if no token provided', async () => {
      const res = await request(app).get('/protected');
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Unauthorized access');
    });

    it('should allow access with valid token', async () => {
      const token = generateToken('student');
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should handle malformed tokens gracefully', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer bad_token`);
      expect(res.statusCode).toBe(500); // Because jwt.verify throws and caught in catch block
    });
  });

  describe('requireRole', () => {
    it('should allow access if role matches', async () => {
      const token = generateToken('admin');
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should deny access if role does not match', async () => {
      const token = generateToken('teacher');
      const res = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(403);
    });
  });

  describe('requireRoles', () => {
    it('should allow access if role is in array (teacher)', async () => {
      const token = generateToken('teacher');
      const res = await request(app)
        .get('/teacher-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should allow access if role is in array (admin)', async () => {
      const token = generateToken('admin');
      const res = await request(app)
        .get('/teacher-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should deny access if role is not in array (student)', async () => {
      const token = generateToken('student');
      const res = await request(app)
        .get('/teacher-or-admin')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('Insufficient role');
    });
  });
});
