const {
  createRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} = require("../../../../src/controllers/teachers/room");
const Classrooms = require("../../../../src/models/classrooms");
const Users = require("../../../../src/models/users");

jest.mock("../../../../src/models/classrooms");
jest.mock("../../../../src/models/users");

describe("Teachers - room Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { _id: "teacher1", role: "teacher" },
      app: { get: jest.fn() },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("createRoom", () => {
    it("should create room successfully", async () => {
      mockReq.body = { name: "Room 1", teacher_id: "teacher1" };
      Classrooms.findOne.mockResolvedValue(null);
      Classrooms.create.mockResolvedValue({
        _id: "room1",
        room_code: "123456",
      });

      await createRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(Classrooms.create).toHaveBeenCalled();
    });
  });

  describe("getAllRooms", () => {
    it("should fetch all rooms", async () => {
      const mockPopulate4 = jest.fn().mockResolvedValue([{ _id: "room1" }]);
      const mockPopulate3 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate4 }));
      const mockPopulate2 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate3 }));
      const mockPopulate1 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate2 }));
      Classrooms.find.mockImplementation(() => ({ populate: mockPopulate1 }));

      await getAllRooms(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getRoom", () => {
    it("should return 404 if room not found", async () => {
      mockReq.params = { id: "room1" };
      const mockPopulate4 = jest.fn().mockResolvedValue(null);
      const mockPopulate3 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate4 }));
      const mockPopulate2 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate3 }));
      const mockPopulate1 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate2 }));
      Classrooms.findById.mockImplementation(() => ({
        populate: mockPopulate1,
      }));

      await getRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should fetch room if found", async () => {
      mockReq.params = { id: "room1" };
      const mockPopulate4 = jest.fn().mockResolvedValue({ _id: "room1" });
      const mockPopulate3 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate4 }));
      const mockPopulate2 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate3 }));
      const mockPopulate1 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate2 }));
      Classrooms.findById.mockImplementation(() => ({
        populate: mockPopulate1,
      }));

      await getRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("updateRoom", () => {
    it("should return 404 if room not found for update", async () => {
      mockReq.params = { id: "room1" };
      Classrooms.findById.mockResolvedValue(null);

      await updateRoom(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should update room successfully and emit socket event", async () => {
      mockReq.params = { id: "room1" };
      mockReq.body = { status: "active", name: "Updated" };

      const saveMock = jest.fn().mockResolvedValue(true);
      const mockRoom = {
        _id: "room1",
        status: "waiting",
        room_code: "123456",
        quizzes: [],
        save: saveMock,
      };
      Classrooms.findById.mockResolvedValue(mockRoom);

      const mockPopulate4 = jest.fn().mockResolvedValue(mockRoom);
      const mockPopulate3 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate4 }));
      const mockPopulate2 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate3 }));
      const mockPopulate1 = jest
        .fn()
        .mockImplementation(() => ({ populate: mockPopulate2 }));

      // The controller does findById again after save
      Classrooms.findById
        .mockImplementationOnce(() => mockRoom)
        .mockImplementationOnce(() => ({ populate: mockPopulate1 }));

      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockImplementation(() => ({ emit: mockEmit }));
      const mockIo = { to: mockTo };
      mockReq.app.get.mockReturnValue(mockIo);

      await updateRoom(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockEmit).toHaveBeenCalled();
    });
  });

  // describe('deleteRoom', () => {
  //   it('should return 404 if room not found for deletion', async () => {
  //     mockReq.params = { id: 'room1' };
  //     Classrooms.findByIdAndDelete.mockResolvedValue(null);

  //     await deleteRoom(mockReq, mockRes);
  //     expect(mockRes.status).toHaveBeenCalledWith(404);
  //   });

  //   it('should delete room successfully', async () => {
  //     mockReq.params = { id: 'room1' };
  //     Classrooms.findByIdAndDelete.mockResolvedValue({ _id: 'room1' });

  //     await deleteRoom(mockReq, mockRes);
  //     expect(mockRes.status).toHaveBeenCalledWith(200);
  //   });
  // });
});
