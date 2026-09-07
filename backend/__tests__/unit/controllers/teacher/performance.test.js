const { getStudentPerformance, getStudentPerformanceDetail } = require('../../../../src/controllers/teacher/performance');
const Classrooms = require('../../../../src/models/classrooms');
const StudentSessions = require('../../../../src/models/studentSessions');

jest.mock('../../../../src/models/classrooms');
jest.mock('../../../../src/models/studentSessions');

describe('Teacher - performance Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      params: {},
      user: { _id: 'teacher1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getStudentPerformance', () => {
    it('should return empty array if teacher has no classrooms', async () => {
      const mockSelect = jest.fn().mockResolvedValue([]);
      Classrooms.find.mockImplementation(() => ({ select: mockSelect }));

      await getStudentPerformance(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].data).toEqual([]);
    });

    it('should aggregate and return performance data', async () => {
      const mockSelect = jest.fn().mockResolvedValue([{ _id: 'room1' }]);
      Classrooms.find.mockImplementation(() => ({ select: mockSelect }));

      const mockData = [{ rollNumber: 's1', name: 'Student 1' }];
      StudentSessions.aggregate.mockResolvedValue(mockData);

      await getStudentPerformance(mockReq, mockRes);
      expect(StudentSessions.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].data).toEqual(mockData);
    });
  });

  describe('getStudentPerformanceDetail', () => {
    it('should return empty array if teacher has no classrooms', async () => {
      mockReq.params = { studentId: 'student1' };
      const mockSelect = jest.fn().mockResolvedValue([]);
      Classrooms.find.mockImplementation(() => ({ select: mockSelect }));

      await getStudentPerformanceDetail(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].data).toEqual([]);
    });

    it('should fetch and return student sessions details', async () => {
      mockReq.params = { studentId: 'student1' };
      const mockSelect = jest.fn().mockResolvedValue([{ _id: 'room1' }]);
      Classrooms.find.mockImplementation(() => ({ select: mockSelect }));

      const mockSessions = [{ _id: 'session1' }];
      
      const mockLean = jest.fn().mockResolvedValue(mockSessions);
      const mockSort = jest.fn().mockImplementation(() => ({ lean: mockLean }));
      const mockPopulate2 = jest.fn().mockImplementation(() => ({ sort: mockSort }));
      const mockPopulate1 = jest.fn().mockImplementation(() => ({ populate: mockPopulate2 }));
      
      StudentSessions.find.mockImplementation(() => ({ populate: mockPopulate1 }));

      await getStudentPerformanceDetail(mockReq, mockRes);
      expect(StudentSessions.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].data).toEqual(mockSessions);
    });
  });
});
