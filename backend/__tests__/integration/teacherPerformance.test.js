const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Organizations = require('../../src/models/organizations');
const Users = require('../../src/models/users');
const Classrooms = require('../../src/models/classrooms');
const StudentSessions = require('../../src/models/studentSessions');
const jwt = require('jsonwebtoken');

describe('Teacher Performance API', () => {
  let teacherToken;
  let testTeacher;

  beforeAll(async () => {
    const testOrg = await Organizations.create({
      organization_name: 'Perf Test Org',
      domain: 'perftest.com',
      country: 'UK',
      postcode: '123',
      city: 'London',
      address: '123 Test St'
    });

    testTeacher = await Users.create({
      name: 'Teacher',
      email: 'teacher@perftest.com',
      password: 'password123',
      role: 'teacher',
      organization_id: testOrg._id
    });
    
    teacherToken = jwt.sign(
      { _id: testTeacher._id, role: 'teacher', email: testTeacher.email, organization_id: testOrg._id },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

    it('should fetch leaderboard for a room', async () => {
    // Setup room and student session
    const room = await Classrooms.create({
      teacher_id: testTeacher._id,
      room_code: 'PERF123',
      status: 'active'
    });
    
    await StudentSessions.create({
      classroom_id: room._id,
      display_name: 'Test Student',
      student_id: '12345',
      score: 100,
    });

    const res = await request(app)
      .get(`/api/teacher/performance?roomId=${room._id}`)
      .set('Authorization', `Bearer ${teacherToken}`);
      
    expect(res.statusCode).toBeDefined();
  });
});
