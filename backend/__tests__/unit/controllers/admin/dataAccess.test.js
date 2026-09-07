const { getAdminDatasets, getAdminQuizzes, updateAdminDatasetAccess, updateAdminQuizAccess, getOrganizationTeachers } = require('../../../../src/controllers/admin/dataAccess');
const Dataset = require('../../../../src/models/datasets');
const Quizzes = require('../../../../src/models/quizzes');
const User = require('../../../../src/models/users');

jest.mock('../../../../src/models/datasets');
jest.mock('../../../../src/models/quizzes');
jest.mock('../../../../src/models/users');

describe('Admin - dataAccess Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { _id: 'admin123', organization_id: 'org1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getAdminDatasets', () => {
    it('should fetch admin datasets correctly', async () => {
      mockReq.query = { page: 1, limit: 10 };
      
      User.findById.mockResolvedValue({ _id: 'admin123', organization_id: 'org1' });
      
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue([{ title: 'Dataset1' }]);
      
      Dataset.find.mockImplementation(() => ({ populate: mockPopulate, skip: mockSkip, limit: mockLimit, sort: mockSort }));
      Dataset.countDocuments.mockResolvedValue(1);

      await getAdminDatasets(mockReq, mockRes);
      expect(Dataset.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].datasets.length).toBe(1);
    });
  });

  describe('getAdminQuizzes', () => {
    it('should fetch admin quizzes correctly', async () => {
      mockReq.query = { page: 1, limit: 10 };
      
      User.findById.mockResolvedValue({ _id: 'admin123', organization_id: 'org1' });
      
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue([{ name: 'Quiz1' }]);
      
      Quizzes.find.mockImplementation(() => ({ populate: mockPopulate, skip: mockSkip, limit: mockLimit, sort: mockSort }));
      Quizzes.countDocuments.mockResolvedValue(1);

      await getAdminQuizzes(mockReq, mockRes);
      expect(Quizzes.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].quizzes.length).toBe(1);
    });
  });

  describe('updateAdminDatasetAccess', () => {
    it('should return 404 if dataset not found', async () => {
      mockReq.params = { id: 'dataset1' };
      User.findById.mockResolvedValue({ _id: 'admin123', organization_id: 'org1' });
      
      const mockPopulate = jest.fn().mockResolvedValue(null);
      Dataset.findOneAndUpdate.mockImplementation(() => ({ populate: mockPopulate }));

      await updateAdminDatasetAccess(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should update dataset access successfully', async () => {
      mockReq.params = { id: 'dataset1' };
      User.findById.mockResolvedValue({ _id: 'admin123', organization_id: 'org1' });
      
      const mockPopulate = jest.fn().mockResolvedValue({ _id: 'dataset1' });
      Dataset.findOneAndUpdate.mockImplementation(() => ({ populate: mockPopulate }));

      await updateAdminDatasetAccess(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateAdminQuizAccess', () => {
    it('should update quiz access successfully', async () => {
      mockReq.params = { id: 'quiz1' };
      User.findById.mockResolvedValue({ _id: 'admin123', organization_id: 'org1' });
      
      const mockPopulate = jest.fn().mockResolvedValue({ _id: 'quiz1' });
      Quizzes.findOneAndUpdate.mockImplementation(() => ({ populate: mockPopulate }));

      await updateAdminQuizAccess(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrganizationTeachers', () => {
    it('should fetch organization teachers', async () => {
      const mockSelect = jest.fn().mockResolvedValue([{ name: 'Teacher1' }]);
      User.find.mockImplementation(() => ({ select: mockSelect }));

      await getOrganizationTeachers(mockReq, mockRes);
      expect(User.find).toHaveBeenCalledWith({ organization_id: 'org1', role: 'teacher' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
