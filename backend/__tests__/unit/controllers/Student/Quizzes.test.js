const { getQuiz, submitAnswer, getSessionStatus } = require('../../../../src/controllers/Student/Quizzes');
const Quizzes = require('../../../../src/models/quizzes');
const studentSessions = require('../../../../src/models/studentSessions');
const Classrooms = require('../../../../src/models/classrooms');

jest.mock('../../../../src/models/quizzes');
jest.mock('../../../../src/models/studentSessions');
jest.mock('../../../../src/models/classrooms');

describe('Student - Quizzes Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      app: { get: jest.fn() }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getQuiz', () => {
    it('should return 404 if quiz not found', async () => {
      mockReq.params = { quiz_id: 'quiz1' };
      const mockPopulate = jest.fn().mockResolvedValue(null);
      Quizzes.findById.mockImplementation(() => ({ populate: mockPopulate }));

      await getQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should fetch quiz successfully', async () => {
      mockReq.params = { quiz_id: 'quiz1' };
      const mockPopulate = jest.fn().mockResolvedValue({ _id: 'quiz1' });
      Quizzes.findById.mockImplementation(() => ({ populate: mockPopulate }));

      await getQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('submitAnswer', () => {
    it('should return 404 if quiz not found', async () => {
      mockReq.body = { quiz_id: 'quiz1', session_id: 'session1', answers: [] };
      Quizzes.findById.mockResolvedValue(null);

      await submitAnswer(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 404 if session not found', async () => {
      mockReq.body = { quiz_id: 'quiz1', session_id: 'session1', answers: [] };
      Quizzes.findById.mockResolvedValue({ _id: 'quiz1' });
      studentSessions.findById.mockResolvedValue(null);

      await submitAnswer(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if quiz already submitted', async () => {
      mockReq.body = { quiz_id: 'quiz1', session_id: 'session1', answers: [] };
      Quizzes.findById.mockResolvedValue({ _id: 'quiz1' });
      studentSessions.findById.mockResolvedValue({ submitted_quizzes: [{ quiz_id: 'quiz1' }] });

      await submitAnswer(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should evaluate answers and submit successfully', async () => {
      mockReq.body = { quiz_id: 'quiz1', session_id: 'session1', answers: [{ question_id: 'q1', answer: 'A' }] };
      
      const mockQuestion = { correct_answers: ['A'] };
      const mockQuiz = { 
        _id: 'quiz1', 
        questions: { id: jest.fn().mockReturnValue(mockQuestion) } 
      };
      Quizzes.findById.mockResolvedValue(mockQuiz);

      const saveMock = jest.fn().mockResolvedValue(true);
      const mockSession = { 
        _id: 'session1', 
        submitted_quizzes: [], 
        score: 0, 
        answers: [], 
        save: saveMock 
      };
      studentSessions.findById.mockResolvedValue(mockSession);
      Classrooms.findById.mockResolvedValue(null);

      await submitAnswer(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].score).toBe(10);
    });
  });

  describe('getSessionStatus', () => {
    it('should return 404 if session not found', async () => {
      mockReq.params = { session_id: 'session1' };
      studentSessions.findById.mockResolvedValue(null);

      await getSessionStatus(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return session status', async () => {
      mockReq.params = { session_id: 'session1' };
      studentSessions.findById.mockResolvedValue({ _id: 'session1' });

      await getSessionStatus(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
