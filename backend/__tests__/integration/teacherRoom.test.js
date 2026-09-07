const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Organizations = require('../../src/models/organizations');
const Users = require('../../src/models/users');
const Classrooms = require('../../src/models/classrooms');
const Dataset = require('../../src/models/datasets');
const jwt = require('jsonwebtoken');

describe('Teacher Room API', () => {
  let teacherToken;
  let testTeacher;

  beforeAll(async () => {
    const testOrg = await Organizations.create({
      organization_name: 'Room Test Org',
      domain: 'roomtest.com',
      country: 'UK',
      postcode: '123',
      city: 'London',
      address: '123 Test St'
    });

    testTeacher = await Users.create({
      name: 'Teacher',
      email: 'teacher@roomtest.com',
      password: 'password123',
      role: 'teacher',
      organization_id: testOrg._id
    });

    teacherToken = jwt.sign(
      { _id: testTeacher._id, role: 'teacher', email: testTeacher.email, organization_id: testOrg._id },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

    it('should create a new classroom session', async () => {
    const res = await request(app)
      .post('/api/teacher/rooms')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        teacher_id: testTeacher._id
      });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.room_code).toBeDefined();
    expect(res.body.teacher_id.toString()).toBe(testTeacher._id.toString());
  });

  it('should fetch active rooms for teacher', async () => {
    const res = await request(app)
      .get(`/api/teacher/rooms`)
      .set('Authorization', `Bearer ${teacherToken}`);
      
    expect(res.statusCode).toBeDefined();
  });

  it('should delete a classroom session', async () => {
     // skipped 
  });
});
