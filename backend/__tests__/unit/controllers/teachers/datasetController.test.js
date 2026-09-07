const { createDataset, getDatasets, deleteDataset, getDatasetData, exportDataset } = require('../../../../src/controllers/teachers/datasetController');
const Dataset = require('../../../../src/models/datasets');

jest.mock('../../../../src/models/datasets');

describe('Teachers - datasetController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: { _id: 'teacher1', role: 'teacher' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('createDataset', () => {
    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { title: 'Test' };
      await createDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should create dataset successfully', async () => {
      mockReq.body = { teacher_id: 'teacher1', title: 'Test', parsed_data: {} };
      Dataset.create.mockResolvedValue({ _id: 'dataset1' });

      await createDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(Dataset.create).toHaveBeenCalled();
    });
  });

  describe('getDatasets', () => {
    it('should return 400 if teacherId is missing', async () => {
      await getDatasets(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should fetch datasets successfully', async () => {
      mockReq.query = { teacherId: 'teacher1' };
      
      const mockSort = jest.fn().mockResolvedValue([{ toObject: () => ({ parsed_data: { sheet1: [] } }) }]);
      Dataset.find.mockImplementation(() => ({ sort: mockSort }));

      await getDatasets(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].datasets[0].sheets).toEqual(['sheet1']);
    });
  });

  describe('deleteDataset', () => {
    it('should return 404 if dataset not found', async () => {
      mockReq.params = { id: 'dataset1' };
      Dataset.findByIdAndDelete.mockResolvedValue(null);

      await deleteDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should delete dataset successfully', async () => {
      mockReq.params = { id: 'dataset1' };
      Dataset.findByIdAndDelete.mockResolvedValue({ _id: 'dataset1' });

      await deleteDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getDatasetData', () => {
    it('should return 404 if dataset not found', async () => {
      mockReq.params = { id: 'dataset1' };
      Dataset.findById.mockResolvedValue(null);

      await getDatasetData(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return dataset data successfully', async () => {
      mockReq.params = { id: 'dataset1' };
      mockReq.query = { sheet: 'sheet1', page: 1, limit: 10 };
      
      Dataset.findById.mockResolvedValue({
        parsed_data: { sheet1: [{ col1: 'val1' }] }
      });

      await getDatasetData(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json.mock.calls[0][0].data.length).toBe(1);
    });
  });

  describe('exportDataset', () => {
    it('should return 404 if dataset not found', async () => {
      mockReq.params = { id: 'dataset1' };
      Dataset.findById.mockResolvedValue(null);

      await exportDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should export dataset successfully', async () => {
      mockReq.params = { id: 'dataset1' };
      Dataset.findById.mockResolvedValue({ parsed_data: {} });

      await exportDataset(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
