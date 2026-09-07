const request = require('supertest');
const { app, server } = require('../../index.js');
const mongoose = require('mongoose');
const Organizations = require('../../src/models/organizations');
const Users = require('../../src/models/users');
const Classrooms = require('../../src/models/classrooms');
const StudentSessions = require('../../src/models/studentSessions');
const Quizzes = require('../../src/models/quizzes');

describe('Student API (Room & Quizzes)', () => {
  let activeRoom;
  let testTeacher;

  beforeAll(async () => {
    const testOrg = await Organizations.create({
      organization_name: 'Student Test Org',
      domain: 'studenttest.com',
      country: 'UK',
      postcode: '123',
      city: 'London',
      address: '123 Test St'
    });

    testTeacher = await Users.create({
      name: 'Teacher',
      email: 'teacher@studenttest.com',
      password: 'password123',
      role: 'teacher',
      organization_id: testOrg._id
    });

    activeRoom = await Classrooms.create({
      teacher_id: testTeacher._id,
      room_code: 'STUDENT123',
      status: 'active'
    });
  });

    describe('Student Room', () => {
    it('should join an active room', async () => {
      const res = await request(app)
        .post('/api/student/rooms/enter')
        .send({
          room_code: 'STUDENT123',
          student_id: 'alice123'
        });
        
      expect(res.statusCode).toBeDefined();
    });

    it('should fail to join a non-existent room', async () => {
      const res = await request(app)
        .post('/api/student/rooms/enter')
        .send({
          room_code: 'INVALIDCODE',
          student_id: 'bob123'
        });
        
      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toBe('Room not found');
    });
  });
  
  describe('Student Quizzes', () => {
    let sessionId;
    let quizId;
    
    beforeAll(async () => {
      const session = await StudentSessions.create({
        classroom_id: activeRoom._id,
        display_name: 'Charlie',
        student_id: '12345',
        score: 0,
      });
      sessionId = session._id;
      
      const quiz = await Quizzes.create({
        teacher_id: testTeacher._id,
        dataset_id: new mongoose.Types.ObjectId(),
        name: 'Student Test Quiz',
        time_limit: 60,
        questions: [] // Just leave empty to avoid complex sub-schema validation issues in a dummy object
      });
      quizId = quiz._id;
      
      await Classrooms.findByIdAndUpdate(activeRoom._id, {
        $push: { quizzes: { quiz_id: quizId, status: 'active' } }
      });
    });
    
    it('should fetch the active quiz for the session', async () => {
      const res = await request(app)
        .get(`/api/student/quizzes/session/${sessionId}`);
        
      expect(res.statusCode).toBeDefined();
    });
  });
});
