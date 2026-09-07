const { assignQuizToOrganization, getQuizzes, updateQuizAccess } = require('../../../../src/controllers/superAdmin/manageQuizzes');
const Quizzes = require('../../../../src/models/quizzes');
const Users = require('../../../../src/models/users');
const mongoose = require('mongoose');

jest.mock('../../../../src/models/quizzes');
jest.mock('../../../../src/models/users');

describe('SuperAdmin - manageQuizzes Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { _id: 'superadmin123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('assignQuizToOrganization', () => {
    it('should return 400 if organization_id is missing', async () => {
      mockReq.params = { quizId: 'quiz1' };
      await assignQuizToOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'organization_id is required' });
    });

    it('should return 404 if original quiz not found', async () => {
      mockReq.params = { quizId: 'quiz1' };
      mockReq.body = { organization_id: 'org1' };
      Quizzes.findById.mockResolvedValue(null);

      await assignQuizToOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Quiz not found' });
    });

    it('should return 404 if target admin not found', async () => {
      mockReq.params = { quizId: 'quiz1' };
      mockReq.body = { organization_id: 'org1' };
      Quizzes.findById.mockResolvedValue({ _id: 'quiz1' });
      Users.findOne.mockResolvedValue(null);

      await assignQuizToOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Target organization has no admin to assign the quiz to.' });
    });

    it('should assign quiz successfully by cloning', async () => {
      mockReq.params = { quizId: 'quiz1' };
      mockReq.body = { organization_id: 'org1' };
      
      const mockQuestion = { toObject: () => ({ _id: 'q1', text: 'question 1' }) };
      Quizzes.findById.mockResolvedValue({ _id: 'quiz1', name: 'Original Quiz', questions: [mockQuestion], status: 'published' });
      Users.findOne.mockResolvedValue({ _id: 'admin1', role: 'admin' });

      const saveMock = jest.fn().mockResolvedValue(true);
      Quizzes.mockImplementation(() => ({
        save: saveMock
      }));

      await assignQuizToOrganization(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('getQuizzes', () => {
    it('should fetch published quizzes correctly', async () => {
      mockReq.query = { page: 1, limit: 10 };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ name: 'Quiz1' }]);
      
      Quizzes.find.mockImplementation(() => ({ populate: mockPopulate, skip: mockSkip, limit: mockLimit }));
      Quizzes.countDocuments.mockResolvedValue(1);

      await getQuizzes(mockReq, mockRes);
      expect(Quizzes.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
      expect(mockRes.json.mock.calls[0][0].quizzes.length).toBe(1);
    });
  });

  describe('updateQuizAccess', () => {
    it('should return 404 if quiz not found', async () => {
      mockReq.params = { quizId: 'quiz1' };
      Quizzes.findById.mockResolvedValue(null);

      await updateQuizAccess(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Quiz not found' });
    });

    it('should update quiz access and filter allowed teachers', async () => {
      mockReq.params = { quizId: 'quiz1' };
      mockReq.body = { access_type: 'private', allowed_organizations: ['org1'] };
      
      Quizzes.findById.mockResolvedValue({
        _id: 'quiz1',
        allowed_teachers: ['teacher1', 'teacher2']
      });

      Users.find.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue([{ _id: 'teacher1' }])
      }));

      const mockPopulate = jest.fn().mockResolvedValue({
        _id: 'quiz1'
      });

      Quizzes.findByIdAndUpdate.mockImplementation(() => ({
        populate: mockPopulate
      }));

      await updateQuizAccess(mockReq, mockRes);

      expect(Quizzes.findByIdAndUpdate).toHaveBeenCalledWith(
        'quiz1',
        { access_type: 'private', allowed_organizations: ['org1'], allowed_teachers: ['teacher1'] },
        { returnDocument: 'after' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });
});
