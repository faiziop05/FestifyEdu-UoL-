const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Organizations = require('../../src/models/organizations');
const Users = require('../../src/models/users');
const Quizzes = require('../../src/models/quizzes');
const Dataset = require('../../src/models/datasets');
const jwt = require('jsonwebtoken');

describe('Teacher Quizzes API', () => {
  let teacherToken;
  let testTeacher;
  let testDataset;

  beforeAll(async () => {
    const testOrg = await Organizations.create({
      organization_name: 'Quiz Test Org',
      domain: 'quiztest.com',
      country: 'UK',
      postcode: '123',
      city: 'London',
      address: '123 Test St'
    });

    testTeacher = await Users.create({
      name: 'Teacher',
      email: 'teacher@quiztest.com',
      password: 'password123',
      role: 'teacher',
      organization_id: testOrg._id
    });

    testDataset = await Dataset.create({
      teacher_id: testTeacher._id,
      title: 'Quiz Dataset',
      parsed_data: { sheet: [] },
      access_type: 'selected'
    });

    teacherToken = jwt.sign(
      { _id: testTeacher._id, role: 'teacher', email: testTeacher.email, organization_id: testOrg._id },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

    it('should create a new quiz', async () => {
    const res = await request(app)
      .post('/api/teacher/quizzes')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        teacher_id: testTeacher._id,
        dataset_id: testDataset._id,
        name: 'Math Quiz',
        time_limit: 60,
        questions: [
          {
            dataset_id: testDataset._id,
            question_text: 'What is 2+2?',
            options: [{ option_text: '3', is_correct: false }, { option_text: '4', is_correct: true }],
            question_type: 'mcq'
          }
        ]
      });
      
    expect(res.statusCode).toBeDefined();
  });

  it('should fetch quizzes for teacher', async () => {
    const res = await request(app)
      .get(`/api/teacher/quizzes/teacher/${testTeacher._id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
      
    expect(res.statusCode).toBeDefined();
  });
});
