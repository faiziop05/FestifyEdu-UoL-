const { generateAuthUrl, handleCallback, listFiles, importData } = require('../../../../src/controllers/teachers/googleDriveController');
const User = require('../../../../src/models/users');
const googleAuth = require('../../../../src/utils/googleAuth');
const { google } = require('googleapis');
const xlsx = require('xlsx');

jest.mock('../../../../src/models/users');
jest.mock('../../../../src/utils/googleAuth');
jest.mock('googleapis');
jest.mock('xlsx');

describe('Teachers - googleDriveController', () => {
  let mockReq;
  let mockRes;
  let mockOAuth2Client;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { _id: 'teacher1' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    
    mockOAuth2Client = {
      generateAuthUrl: jest.fn().mockReturnValue('http://auth.url'),
      getToken: jest.fn().mockResolvedValue({ tokens: { refresh_token: 'refresh' } }),
      setCredentials: jest.fn()
    };
    googleAuth.getOAuth2Client.mockReturnValue(mockOAuth2Client);
    
    jest.clearAllMocks();
  });

  describe('generateAuthUrl', () => {
    it('should return auth url', async () => {
      await generateAuthUrl(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ url: 'http://auth.url' });
    });
  });

  describe('handleCallback', () => {
    it('should return 400 if userId is missing', async () => {
      mockReq.query = { code: 'code123' };
      await handleCallback(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle callback and update user', async () => {
      mockReq.query = { code: 'code123', state: 'teacher1' };
      
      const mockUserInfo = { data: { email: 'test@drive.com', id: 'driveid' } };
      const mockOAuth2 = { userinfo: { get: jest.fn().mockResolvedValue(mockUserInfo) } };
      google.oauth2.mockReturnValue(mockOAuth2);
      
      User.findByIdAndUpdate.mockResolvedValue({});

      await handleCallback(mockReq, mockRes);
      expect(User.findByIdAndUpdate).toHaveBeenCalled();
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('listFiles', () => {
    it('should return 401 if google drive is not connected', async () => {
      User.findById.mockResolvedValue({ _id: 'teacher1' }); // no refresh token
      await listFiles(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should list files successfully', async () => {
      User.findById.mockResolvedValue({ _id: 'teacher1', google_drive_refresh_token: 'token' });
      
      const mockDrive = {
        files: {
          list: jest.fn().mockResolvedValue({ data: { files: [{ id: 'file1', name: 'File 1' }] } })
        }
      };
      google.drive.mockReturnValue(mockDrive);

      await listFiles(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([{ id: 'file1', name: 'File 1' }]);
    });
  });

  describe('importData', () => {
    it('should return 401 if google drive is not connected', async () => {
      mockReq.body = { fileId: 'file1' };
      User.findById.mockResolvedValue({ _id: 'teacher1' }); // no refresh token
      await importData(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should import data successfully for spreadsheet', async () => {
      mockReq.body = { fileId: 'file1' };
      User.findById.mockResolvedValue({ _id: 'teacher1', google_drive_refresh_token: 'token' });
      
      const mockDrive = {
        files: {
          get: jest.fn().mockResolvedValue({ data: { mimeType: 'application/vnd.google-apps.spreadsheet', name: 'Sheet' } }),
          export: jest.fn().mockResolvedValue({ data: 'bufferdata' })
        }
      };
      google.drive.mockReturnValue(mockDrive);
      
      xlsx.read.mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } });
      xlsx.utils.sheet_to_json.mockReturnValue([{ col1: 'val1' }]);

      await importData(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
      expect(mockRes.json.mock.calls[0][0].data.Sheet1.length).toBe(1);
    });
  });
});
