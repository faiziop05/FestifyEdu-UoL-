const { authMiddleware } = require('../../../src/middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header is present', () => {
    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized access',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', () => {
    mockReq.headers.authorization = 'Basic token123';
    
    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized access',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next and set req.user if token is valid', () => {
    mockReq.headers.authorization = 'Bearer validtoken';
    const decodedUser = { id: 1, role: 'teacher' };
    jwt.verify.mockReturnValue(decodedUser);
    process.env.JWT_SECRET = 'secret';

    authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'secret');
    expect(mockReq.user).toEqual(decodedUser);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 500 if token verification throws an error', () => {
    mockReq.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal server error',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
