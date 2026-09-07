const { addUser, removeUser, getOrganizationUsers, updateUser, resetPassword } = require('../../../../src/controllers/superAdmin/manageUsers');
const Users = require('../../../../src/models/users');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

jest.mock('../../../../src/models/users');
jest.mock('bcryptjs');

describe('SuperAdmin - manageUsers Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('addUser', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { name: 'Admin' };
      await addUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
    });

    it('should return 400 if user already exists', async () => {
      mockReq.body = { name: 'Admin', email: 'admin@test.com', password: 'pass', organization_id: 'org1' };
      Users.findOne.mockResolvedValue({ email: 'admin@test.com' });
      
      await addUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User already exists with this email' });
    });

    it('should return 201 on successful user creation', async () => {
      mockReq.body = { name: 'Admin', email: 'admin@test.com', password: 'pass', organization_id: 'org1' };
      Users.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpass');
      
      const saveMock = jest.fn().mockResolvedValue(true);
      Users.mockImplementation(() => ({
        save: saveMock
      }));

      await addUser(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('removeUser', () => {
    it('should return 404 if user not found', async () => {
      mockReq.params = { id: 'user1' };
      Users.findByIdAndDelete.mockResolvedValue(null);

      await removeUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 200 on successful deletion', async () => {
      mockReq.params = { id: 'user1' };
      Users.findByIdAndDelete.mockResolvedValue({ _id: 'user1' });

      await removeUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('getOrganizationUsers', () => {
    it('should fetch organization users successfully', async () => {
      mockReq.body = { organization_id: new mongoose.Types.ObjectId().toString(), page: 1, limit: 10 };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ name: 'Admin1' }]);
      
      Users.find.mockImplementation(() => ({ populate: mockPopulate, skip: mockSkip, limit: mockLimit }));
      Users.countDocuments.mockResolvedValue(1);

      await getOrganizationUsers(mockReq, mockRes);
      expect(Users.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
      expect(mockRes.json.mock.calls[0][0].users.length).toBe(1);
    });
  });

  describe('updateUser', () => {
    it('should return 404 if user not found for update', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { name: 'Admin2' };
      Users.findByIdAndUpdate.mockResolvedValue(null);

      await updateUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 200 on successful update', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { name: 'Admin2' };
      Users.findByIdAndUpdate.mockResolvedValue({ _id: 'user1', name: 'Admin2' });

      await updateUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should return 404 if user not found for reset', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { password: 'newpass' };
      Users.findByIdAndUpdate.mockResolvedValue(null);

      await resetPassword(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 200 on successful reset', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { password: 'newpass' };
      bcrypt.hash.mockResolvedValue('newhashedpass');
      Users.findByIdAndUpdate.mockResolvedValue({ _id: 'user1' });

      await resetPassword(mockReq, mockRes);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });
});
