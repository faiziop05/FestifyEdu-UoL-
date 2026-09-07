const Dataset = require("../../models/datasets");
const User = require("../../models/users");

const getDatasets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = { teacher_id: req.user._id };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const totalDatasets = await Dataset.countDocuments(query);
    const totalPages = Math.ceil(totalDatasets / limitNum);

    const datasets = await Dataset.find(query)
      .populate("allowed_organizations", "organization_name")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    // We only send back basic info to not overload the payload
    const formattedDatasets = datasets.map((d) => {
      const doc = d.toObject();
      const sheets = doc.parsed_data ? Object.keys(doc.parsed_data) : [];
      delete doc.parsed_data;
      doc.sheets = sheets;
      return doc;
    });

    return res.status(200).json({ 
      success: true, 
      datasets: formattedDatasets,
      totalPages,
      currentPage: pageNum,
      totalDatasets
    });
  } catch (error) {
    console.error("Error fetching datasets for super admin:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateDatasetAccess = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { access_type, allowed_organizations } = req.body;
    
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) return res.status(404).json({ success: false, message: "Dataset not found" });

    let teachersToKeep = dataset.allowed_teachers || [];
    if (allowed_organizations && allowed_organizations.length > 0) {
      const validTeachers = await User.find({
        _id: { $in: dataset.allowed_teachers },
        organization_id: { $in: allowed_organizations }
      }).select('_id');
      teachersToKeep = validTeachers.map(t => t._id);
    } else if (allowed_organizations && allowed_organizations.length === 0) {
      teachersToKeep = [];
    }

    const updatedDataset = await Dataset.findByIdAndUpdate(
      datasetId, 
      { access_type, allowed_organizations, allowed_teachers: teachersToKeep }, 
      { returnDocument: 'after' }
    ).populate("allowed_organizations", "organization_name");
    
    const doc = updatedDataset.toObject();
    delete doc.parsed_data;
    
    return res.status(200).json({ success: true, dataset: doc, message: "Dataset access updated successfully" });
  } catch (error) {
    console.error("Error updating dataset access:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { getDatasets, updateDatasetAccess };
