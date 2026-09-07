const { addUsers, removeUser, updateUser, getOrganizationUsers, resetPassword } = require('../../../../src/controllers/admins/manageUsers');
const users = require('../../../../src/models/users');
const Organizations = require('../../../../src/models/organizations');
const bcrypt = require('bcryptjs');

jest.mock('../../../../src/models/users');
jest.mock('../../../../src/models/organizations');
jest.mock('bcryptjs');

describe('Admin - manageUsers Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('addUsers', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { name: 'Teacher' };
      await addUsers(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 403 if role is not teacher', async () => {
      mockReq.body = { name: 'Teacher', email: 'test@org.com', password: 'pass', role: 'student', organization_id: 'org1' };
      await addUsers(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if organization not found', async () => {
      mockReq.body = { name: 'Teacher', email: 'test@org.com', password: 'pass', role: 'teacher', organization_id: 'org1' };
      Organizations.findById.mockResolvedValue(null);
      await addUsers(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if email domain does not match organization domain', async () => {
      mockReq.body = { name: 'Teacher', email: 'test@wrong.com', password: 'pass', role: 'teacher', organization_id: 'org1' };
      Organizations.findById.mockResolvedValue({ domain: 'org.com' });
      await addUsers(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should create user successfully', async () => {
      mockReq.body = { name: 'Teacher', email: 'test@org.com', password: 'pass', role: 'teacher', organization_id: 'org1' };
      Organizations.findById.mockResolvedValue({ domain: 'org.com' });
      users.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedpass');
      
      const saveMock = jest.fn().mockResolvedValue(true);
      users.mockImplementation(() => ({ save: saveMock }));

      await addUsers(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('removeUser', () => {
    it('should remove user successfully', async () => {
      mockReq.params = { id: 'user1' };
      users.findByIdAndDelete.mockResolvedValue({ _id: 'user1' });

      await removeUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { name: 'Updated' };
      users.findByIdAndUpdate.mockResolvedValue({ _id: 'user1' });

      await updateUser(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrganizationUsers', () => {
    it('should fetch organization users', async () => {
      mockReq.params = { organization_id: 'org1' };
      mockReq.query = { page: 1, limit: 10 };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ name: 'Teacher1' }]);
      
      users.find.mockImplementation(() => ({ skip: mockSkip, limit: mockLimit }));
      users.countDocuments.mockResolvedValue(1);

      await getOrganizationUsers(mockReq, mockRes);
      expect(users.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockReq.params = { id: 'user1' };
      mockReq.body = { password: 'newpass' };
      bcrypt.hash.mockResolvedValue('newhashedpass');
      users.findByIdAndUpdate.mockResolvedValue({ _id: 'user1' });

      await resetPassword(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
