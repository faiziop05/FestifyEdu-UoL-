const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Dataset = require('../../src/models/datasets');
const Users = require('../../src/models/users');
const jwt = require('jsonwebtoken');

describe('Dataset Controller API', () => {
  let teacherToken;
  let testTeacherId;
  
  beforeAll(async () => {
    // Need a user to attach to token
    const teacher = await Users.create({
      name: 'Dataset Teacher',
      email: 'dataset_teacher@test.com',
      password: 'password123',
      role: 'teacher',
      organization_id: new mongoose.Types.ObjectId()
    });
    testTeacherId = teacher._id;
    teacherToken = jwt.sign(
      { _id: teacher._id, role: 'teacher', email: teacher.email, organization_id: teacher.organization_id },
      process.env.JWT_SECRET || 'test_secret' // Fallback for tests
    );
  });

    afterEach(async () => {
    await Dataset.deleteMany({});
  });

  describe('POST /api/teacher/datasets', () => {
    it('should create a dataset with valid parsed_data', async () => {
      const res = await request(app)
        .post('/api/teacher/datasets')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          teacher_id: testTeacherId,
          title: 'Test Dataset',
          google_drive_file_id: '12345',
          headers: ['Name', 'Score'],
          parsed_data: {
            Sheet1: [
              { Name: 'Player1', Score: 100 },
              { Name: 'Player2', Score: 200 }
            ]
          }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.dataset.title).toBe('Test Dataset');
      expect(res.body.dataset.parsed_data.Sheet1.length).toBe(2);
    });

    it('should prevent creation if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/teacher/datasets')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Test Dataset without teacher'
          // missing teacher_id and parsed_data
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('teacher_id, title, and parsed_data are required');
    });
  });

  describe('GET /api/teacher/datasets/:id/data', () => {
    it('should return processed data with pagination and search', async () => {
      // Setup dataset
      const dataset = await Dataset.create({
        teacher_id: testTeacherId,
        title: 'Searchable Dataset',
        headers: ['Hero', 'Damage'],
        parsed_data: {
          DataSheet: [
            { Hero: 'Tracer', Damage: 12000 },
            { Hero: 'Reinhardt', Damage: 8000 },
            { Hero: 'Mercy', Damage: 500 }
          ]
        }
      });

      // Test search
      const resSearch = await request(app)
        .get(`/api/teacher/datasets/${dataset._id}/data?sheet=DataSheet&search=tracer`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(resSearch.statusCode).toBe(200);
      expect(resSearch.body.data.length).toBe(1);
      expect(resSearch.body.data[0].Hero).toBe('Tracer');

      // Test pagination
      const resPage = await request(app)
        .get(`/api/teacher/datasets/${dataset._id}/data?sheet=DataSheet&page=1&limit=2`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(resPage.statusCode).toBe(200);
      expect(resPage.body.data.length).toBe(2);
      expect(resPage.body.hasMore).toBe(true);
      expect(resPage.body.total).toBe(3);
    });
  });
});
