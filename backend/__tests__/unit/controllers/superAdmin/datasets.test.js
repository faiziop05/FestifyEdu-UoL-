const { getDatasets, updateDatasetAccess } = require('../../../../src/controllers/superAdmin/datasets');
const Dataset = require('../../../../src/models/datasets');
const User = require('../../../../src/models/users');

jest.mock('../../../../src/models/datasets');
jest.mock('../../../../src/models/users');

describe('SuperAdmin - datasets Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {},
      user: { _id: 'superadmin123' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getDatasets', () => {
    it('should fetch datasets and format them correctly', async () => {
      mockReq.query = { page: 1, limit: 10 };
      
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockDatasetDoc = {
        toObject: () => ({
          _id: 'dataset1',
          parsed_data: { sheet1: [] }
        })
      };
      const mockLimit = jest.fn().mockResolvedValue([mockDatasetDoc]);
      
      Dataset.find.mockImplementation(() => ({ populate: mockPopulate, skip: mockSkip, limit: mockLimit }));
      Dataset.countDocuments.mockResolvedValue(1);

      await getDatasets(mockReq, mockRes);
      expect(Dataset.find).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
      expect(mockRes.json.mock.calls[0][0].datasets[0].sheets).toEqual(['sheet1']);
      expect(mockRes.json.mock.calls[0][0].datasets[0].parsed_data).toBeUndefined();
    });
  });

  describe('updateDatasetAccess', () => {
    it('should return 404 if dataset not found', async () => {
      mockReq.params = { datasetId: 'dataset1' };
      Dataset.findById.mockResolvedValue(null);

      await updateDatasetAccess(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Dataset not found' });
    });

    it('should update dataset access and filter allowed teachers based on organizations', async () => {
      mockReq.params = { datasetId: 'dataset1' };
      mockReq.body = { access_type: 'private', allowed_organizations: ['org1'] };
      
      Dataset.findById.mockResolvedValue({
        _id: 'dataset1',
        allowed_teachers: ['teacher1', 'teacher2']
      });

      User.find.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue([{ _id: 'teacher1' }])
      }));

      const mockPopulate = jest.fn().mockResolvedValue({
        toObject: () => ({ _id: 'dataset1', parsed_data: {} })
      });

      Dataset.findByIdAndUpdate.mockImplementation(() => ({
        populate: mockPopulate
      }));

      await updateDatasetAccess(mockReq, mockRes);

      expect(Dataset.findByIdAndUpdate).toHaveBeenCalledWith(
        'dataset1',
        { access_type: 'private', allowed_organizations: ['org1'], allowed_teachers: ['teacher1'] },
        { returnDocument: 'after' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].success).toBe(true);
    });

    it('should empty allowed teachers if allowed_organizations is empty array', async () => {
      mockReq.params = { datasetId: 'dataset1' };
      mockReq.body = { access_type: 'private', allowed_organizations: [] };
      
      Dataset.findById.mockResolvedValue({
        _id: 'dataset1',
        allowed_teachers: ['teacher1', 'teacher2']
      });

      const mockPopulate = jest.fn().mockResolvedValue({
        toObject: () => ({ _id: 'dataset1' })
      });

      Dataset.findByIdAndUpdate.mockImplementation(() => ({
        populate: mockPopulate
      }));

      await updateDatasetAccess(mockReq, mockRes);

      expect(Dataset.findByIdAndUpdate).toHaveBeenCalledWith(
        'dataset1',
        { access_type: 'private', allowed_organizations: [], allowed_teachers: [] },
        { returnDocument: 'after' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
