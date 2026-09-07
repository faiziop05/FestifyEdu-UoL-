const Dataset = require("../../models/datasets");

const createDataset = async (req, res) => {
  try {
    const { teacher_id, title, google_drive_file_id, headers, parsed_data } =
      req.body;

    if (!teacher_id || !title || !parsed_data) {
      return res
        .status(400)
        .json({ message: "teacher_id, title, and parsed_data are required." });
    }

    const newDataset = await Dataset.create({
      teacher_id,
      title,
      google_drive_file_id,
      status: "parsed",
      headers,
      parsed_data,
    });

    res.status(201).json({
      success: true,
      message: "Dataset created successfully",
      dataset: newDataset,
    });
  } catch (error) {
    console.error("Error creating dataset:", error);
    res
      .status(500)
      .json({ message: "Failed to create dataset", error: error.message });
  }
};

const getDatasets = async (req, res) => {
  try {
    const teacherId = req.query.teacherId;
    if (!teacherId || teacherId === "undefined") {
      return res.status(400).json({ message: "teacherId is required" });
    }

    const orgId = req.user?.organization_id || null;

    let query;
    if (req.user?.role === "super_admin") {
      query = { teacher_id: req.user._id };
    } else {
      const activeTeacherId = req.user?._id || teacherId;
      const roleConditions = [];
      if (req.user?.role === "admin" && orgId) {
        roleConditions.push({ allowed_organizations: orgId });
      }
      roleConditions.push({ allowed_teachers: activeTeacherId });

      query = {
        $or: [
          { teacher_id: activeTeacherId },
          { access_type: "all" },
          ...roleConditions
        ]
      };
    }

    const datasets = await Dataset.find(query).sort({
      createdAt: -1,
    });

    const formattedDatasets = datasets.map((d) => {
      const doc = d.toObject();
      const sheets = doc.parsed_data ? Object.keys(doc.parsed_data) : [];
      delete doc.parsed_data;
      doc.sheets = sheets;
      return doc;
    });

    res.status(200).json({ success: true, datasets: formattedDatasets });
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch datasets", error: error.message });
  }
};

const deleteDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDataset = await Dataset.findByIdAndDelete(id);

    if (!deletedDataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Dataset deleted successfully" });
  } catch (error) {
    console.error("Error deleting dataset:", error);
    res
      .status(500)
      .json({ message: "Failed to delete dataset", error: error.message });
  }
};

const getDatasetData = async (req, res) => {
  try {
    const { id } = req.params;
    const { sheet, page = 1, limit = 100, search = "" } = req.query;

    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    const sheetData = dataset.parsed_data?.[sheet] || [];

    let processedData = sheetData.map((row, idx) => ({
      ...row,
      _originalIndex: idx,
    }));

    if (search) {
      const lowerQuery = search.toLowerCase();
      processedData = processedData.filter((row) =>
        Object.keys(row).some((key) =>
          key !== "_originalIndex" &&
          String(row[key]).toLowerCase().includes(lowerQuery)
        )
      );
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const slicedData = processedData.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: slicedData,
      total: processedData.length,
      hasMore: endIndex < processedData.length,
    });
  } catch (error) {
    console.error("Error fetching dataset data:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch dataset data", error: error.message });
  }
};

const exportDataset = async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await Dataset.findById(id);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    res.status(200).json({
      success: true,
      parsed_data: dataset.parsed_data,
    });
  } catch (error) {
    console.error("Error exporting dataset:", error);
    res
      .status(500)
      .json({ message: "Failed to export dataset", error: error.message });
  }
};

module.exports = {
  createDataset,
  getDatasets,
  getDatasetData,
  deleteDataset,
  exportDataset,
};
