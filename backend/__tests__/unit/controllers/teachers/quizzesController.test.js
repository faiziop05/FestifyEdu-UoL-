const { createQuiz, getQuizzesByTeacher, getAllPublishedQuizzes, getQuizById, updateQuiz, deleteQuiz } = require('../../../../src/controllers/teachers/quizzesController');
const Quiz = require('../../../../src/models/quizzes');

jest.mock('../../../../src/models/quizzes');

describe('Teachers - quizzesController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { _id: 'teacher1', role: 'teacher' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { name: 'Test Quiz' };
      await createQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if questions is not an array', async () => {
      mockReq.body = { teacher_id: 'teacher1', name: 'Test Quiz', questions: 'not array' };
      await createQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should create quiz successfully', async () => {
      mockReq.body = { teacher_id: 'teacher1', name: 'Test Quiz', questions: [] };
      Quiz.create.mockResolvedValue({ _id: 'quiz1' });

      await createQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(Quiz.create).toHaveBeenCalled();
    });
  });

  describe('getQuizzesByTeacher', () => {
    it('should fetch quizzes by teacher', async () => {
      mockReq.params = { teacher_id: 'teacher1' };
      mockReq.query = { type: 'published' };
      
      const mockSort = jest.fn().mockResolvedValue([{ _id: 'quiz1' }]);
      const mockPopulate = jest.fn().mockImplementation(() => ({ sort: mockSort }));
      Quiz.find.mockImplementation(() => ({ populate: mockPopulate }));

      await getQuizzesByTeacher(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should fetch quizzes by teacher with pagination', async () => {
      mockReq.params = { teacher_id: 'teacher1' };
      mockReq.query = { page: 1, limit: 10, type: 'published' };
      
      const mockSort = jest.fn().mockResolvedValue([{ _id: 'quiz1' }]);
      const mockLimit = jest.fn().mockImplementation(() => ({ sort: mockSort }));
      const mockSkip = jest.fn().mockImplementation(() => ({ limit: mockLimit }));
      const mockPopulate = jest.fn().mockImplementation(() => ({ skip: mockSkip }));
      Quiz.find.mockImplementation(() => ({ populate: mockPopulate }));
      Quiz.countDocuments.mockResolvedValue(1);

      await getQuizzesByTeacher(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllPublishedQuizzes', () => {
    it('should fetch all published quizzes', async () => {
      const mockPopulate2 = jest.fn().mockResolvedValue([{ _id: 'quiz1' }]);
      const mockPopulate1 = jest.fn().mockImplementation(() => ({ populate: mockPopulate2 }));
      Quiz.find.mockImplementation(() => ({ populate: mockPopulate1 }));

      await getAllPublishedQuizzes(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getQuizById', () => {
    it('should return 404 if quiz not found', async () => {
      mockReq.params = { id: 'quiz1' };
      Quiz.findById.mockImplementation(() => ({ populate: jest.fn().mockResolvedValue(null) }));

      await getQuizById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return quiz if found', async () => {
      mockReq.params = { id: 'quiz1' };
      Quiz.findById.mockImplementation(() => ({ populate: jest.fn().mockResolvedValue({ _id: 'quiz1' }) }));

      await getQuizById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateQuiz', () => {
    it('should return 404 if quiz not found for update', async () => {
      mockReq.params = { id: 'quiz1' };
      Quiz.findByIdAndUpdate.mockResolvedValue(null);

      await updateQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should update quiz successfully', async () => {
      mockReq.params = { id: 'quiz1' };
      mockReq.body = { name: 'Updated Quiz' };
      Quiz.findByIdAndUpdate.mockResolvedValue({ _id: 'quiz1' });

      await updateQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteQuiz', () => {
    it('should return 404 if quiz not found for deletion', async () => {
      mockReq.params = { id: 'quiz1' };
      Quiz.findByIdAndDelete.mockResolvedValue(null);

      await deleteQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should delete quiz successfully', async () => {
      mockReq.params = { id: 'quiz1' };
      Quiz.findByIdAndDelete.mockResolvedValue({ _id: 'quiz1' });

      await deleteQuiz(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
