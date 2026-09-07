const { requireRole, requireRoles } = require('../../../src/middlewares/roleMiddleware');

describe('roleMiddleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should return 403 if user role does not match required role', () => {
      mockReq.user.role = 'student';
      const middleware = requireRole('teacher');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized access',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if user role matches required role', () => {
      mockReq.user.role = 'teacher';
      const middleware = requireRole('teacher');
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('requireRoles', () => {
    it('should return 403 if user role is not in required roles array', () => {
      mockReq.user.role = 'student';
      const middleware = requireRoles(['admin', 'teacher']);
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized access: Insufficient role',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next if user role is in required roles array', () => {
      mockReq.user.role = 'admin';
      const middleware = requireRoles(['admin', 'teacher']);
      
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
