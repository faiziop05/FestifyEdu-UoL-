const { login, updateProfile } = require('../../../../src/controllers/global/auth');
const users = require('../../../../src/models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../../../src/models/users');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Global Auth Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('login', () => {
    it('should return 400 if email or password are not provided', async () => {
      mockReq.body = { email: 'test@test.com' }; // missing password
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
    });

    it('should return 404 if user is not found', async () => {
      mockReq.body = { email: 'notfound@test.com', password: 'password123' };
      users.findOne.mockResolvedValue(null);
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 401 if passwords do not match', async () => {
      mockReq.body = { email: 'found@test.com', password: 'wrongpassword' };
      users.findOne.mockResolvedValue({ email: 'found@test.com', password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);
      
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('should return 200 and a token on successful login', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'found@test.com',
        password: 'hashedpassword',
        role: 'student',
        organization_id: 'org123'
      };
      mockReq.body = { email: 'found@test.com', password: 'correctpassword' };
      users.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid_token');

      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        token: 'valid_token',
        expiresIn: '7d',
        user: mockUser
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { _id: mockUser._id, role: mockUser.role, email: mockUser.email, organization_id: mockUser.organization_id },
        'test_secret',
        { expiresIn: '7d' }
      );
    });

    it('should return 500 on server error', async () => {
      mockReq.body = { email: 'error@test.com', password: 'password123' };
      users.findOne.mockRejectedValue(new Error('Database error'));
      await login(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateProfile', () => {
    it('should return 400 if name is not provided', async () => {
      mockReq.body = {};
      mockReq.user = { _id: 'user123' };
      await updateProfile(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Name is required' });
    });

    it('should return 404 if user not found for update', async () => {
      mockReq.body = { name: 'New Name' };
      mockReq.user = { _id: 'user123' };
      
      const mockSelect = jest.fn().mockResolvedValue(null);
      users.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await updateProfile(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 200 and updated user on success without password change', async () => {
      mockReq.body = { name: 'New Name' };
      mockReq.user = { _id: 'user123' };
      
      const updatedUser = { _id: 'user123', name: 'New Name' };
      const mockSelect = jest.fn().mockResolvedValue(updatedUser);
      users.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await updateProfile(mockReq, mockRes);
      expect(users.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { name: 'New Name' } },
        { new: true, runValidators: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    });

    it('should hash password and update on success with password change', async () => {
      mockReq.body = { name: 'New Name', password: 'newpassword' };
      mockReq.user = { _id: 'user123' };
      
      bcrypt.hash.mockResolvedValue('hashednewpassword');
      const updatedUser = { _id: 'user123', name: 'New Name' };
      const mockSelect = jest.fn().mockResolvedValue(updatedUser);
      users.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await updateProfile(mockReq, mockRes);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(users.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { name: 'New Name', password: 'hashednewpassword' } },
        { new: true, runValidators: true }
      );
    });

    it('should return 500 on server error', async () => {
      mockReq.body = { name: 'New Name' };
      mockReq.user = { _id: 'user123' };
      users.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('Database error');
      });

      await updateProfile(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
