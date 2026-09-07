const { createOrganization, getAllOrganizations, updateOrganization, removeOrganization } = require('../../../../src/controllers/superAdmin/manageOrganizations');
const Organizations = require('../../../../src/models/organizations');

jest.mock('../../../../src/models/organizations');

describe('SuperAdmin - manageOrganizations Controller', () => {
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

  describe('createOrganization', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { organization_name: 'Test' };
      await createOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'All fields are required' });
    });

    it('should return 400 if domain format is invalid', async () => {
      mockReq.body = {
        organization_name: 'Test', address: '1', city: 'C', postcode: '1', country: 'UK', domain: 'invalid-domain'
      };
      await createOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json.mock.calls[0][0].message).toContain('Invalid domain format');
    });

    it('should return 400 if domain already exists', async () => {
      mockReq.body = {
        organization_name: 'Test', address: '1', city: 'C', postcode: '1', country: 'UK', domain: 'test.com'
      };
      Organizations.findOne.mockResolvedValue({ domain: 'test.com' });
      await createOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Organization domain already exists' });
    });

    it('should return 201 on successful creation', async () => {
      mockReq.body = {
        organization_name: 'Test', address: '1', city: 'C', postcode: '1', country: 'UK', domain: 'test.com'
      };
      Organizations.findOne.mockResolvedValue(null);
      
      const saveMock = jest.fn().mockResolvedValue(true);
      Organizations.mockImplementation(() => ({
        save: saveMock
      }));

      await createOrganization(mockReq, mockRes);
      expect(saveMock).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('getAllOrganizations', () => {
    it('should fetch paginated organizations without search', async () => {
      mockReq.query = { page: '1', limit: '10' };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ organization_name: 'Org1' }]);
      
      Organizations.find.mockImplementation(() => ({ skip: mockSkip, limit: mockLimit }));
      Organizations.countDocuments.mockResolvedValue(1);

      await getAllOrganizations(mockReq, mockRes);
      expect(Organizations.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].organizations.length).toBe(1);
    });

    it('should fetch paginated organizations with search', async () => {
      mockReq.query = { search: 'Org1' };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue([{ organization_name: 'Org1' }]);
      
      Organizations.find.mockImplementation(() => ({ skip: mockSkip, limit: mockLimit }));
      Organizations.countDocuments.mockResolvedValue(1);

      await getAllOrganizations(mockReq, mockRes);
      expect(Organizations.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].organizations.length).toBe(1);
    });
  });

  describe('updateOrganization', () => {
    it('should return 404 if organization not found', async () => {
      mockReq.params = { id: 'org123' };
      mockReq.body = { organization_name: 'Updated Org' };
      Organizations.findByIdAndUpdate.mockResolvedValue(null);

      await updateOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Organization not found' });
    });

    it('should return 200 on successful update', async () => {
      mockReq.params = { id: 'org123' };
      mockReq.body = { organization_name: 'Updated Org' };
      Organizations.findByIdAndUpdate.mockResolvedValue({ _id: 'org123', organization_name: 'Updated Org' });

      await updateOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });

  describe('removeOrganization', () => {
    it('should return 404 if organization not found', async () => {
      mockReq.params = { id: 'org123' };
      Organizations.findByIdAndDelete.mockResolvedValue(null);

      await removeOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Organization not found' });
    });

    it('should return 200 on successful deletion', async () => {
      mockReq.params = { id: 'org123' };
      Organizations.findByIdAndDelete.mockResolvedValue({ _id: 'org123' });

      await removeOrganization(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });
  });
});
