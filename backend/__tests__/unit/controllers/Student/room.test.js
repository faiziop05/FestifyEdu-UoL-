const { enterRoom, exitRoom } = require('../../../../src/controllers/Student/room');
const Classrooms = require('../../../../src/models/classrooms');
const studentSessions = require('../../../../src/models/studentSessions');
const { generateDisplayName } = require('../../../../src/data/constant');

jest.mock('../../../../src/models/classrooms');
jest.mock('../../../../src/models/studentSessions');
jest.mock('../../../../src/data/constant');

describe('Student - room Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('enterRoom', () => {
    it('should return 404 if room not found', async () => {
      mockReq.body = { room_code: '123' };
      Classrooms.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await enterRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if room status is waiting', async () => {
      mockReq.body = { room_code: '123' };
      Classrooms.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ status: 'waiting' })
      });

      await enterRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should reconnect if existing session found', async () => {
      mockReq.body = { room_code: '123', student_id: 'student1' };
      Classrooms.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'room1', status: 'active' })
      });
      Classrooms.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'room1', status: 'active' })
      });
      
      const saveMock = jest.fn().mockResolvedValue(true);
      studentSessions.findOne.mockResolvedValue({ _id: 'session1', save: saveMock });

      await enterRoom(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should create new session if not found', async () => {
      mockReq.body = { room_code: '123', student_id: 'student1' };
      
      const mockUpdateOne = jest.fn().mockResolvedValue(true);
      Classrooms.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'room1', status: 'active', updateOne: mockUpdateOne })
      });
      Classrooms.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'room1', status: 'active' })
      });
      
      studentSessions.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      generateDisplayName.mockReturnValue('GeneratedName');

      const saveMock = jest.fn().mockResolvedValue(true);
      studentSessions.mockImplementation(() => ({
        _id: 'session1',
        save: saveMock
      }));

      await enterRoom(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockUpdateOne).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('exitRoom', () => {
    it('should return 404 if session not found', async () => {
      mockReq.body = { session_id: 'session1' };
      studentSessions.findById.mockResolvedValue(null);

      await exitRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should exit room and update session status', async () => {
      mockReq.body = { session_id: 'session1' };
      const saveMock = jest.fn().mockResolvedValue(true);
      studentSessions.findById.mockResolvedValue({ save: saveMock });

      await exitRoom(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
