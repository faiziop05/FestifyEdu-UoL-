const express = require("express");
const router = express.Router();
const datasetController = require("../../controllers/teachers/datasetController");
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRoles } = require("../../middlewares/roleMiddleware");

const requireDataRoles = [requireAuth, requireRoles(["teacher", "admin", "super_admin"])];

// POST /api/teacher/datasets - Create a new dataset from selected data
router.post("/", requireDataRoles, datasetController.createDataset);

// GET /api/teacher/datasets - Get all datasets for a teacher
router.get("/", requireDataRoles, datasetController.getDatasets);

// GET /api/teacher/datasets/:id/data - Get paginated data for a dataset sheet
router.get("/:id/data", requireDataRoles, datasetController.getDatasetData);

// DELETE /api/teacher/datasets/:id - Delete a dataset
router.delete("/:id", requireDataRoles, datasetController.deleteDataset);

// GET /api/teacher/datasets/:id/export - Get full dataset for export
router.get("/:id/export", requireDataRoles, datasetController.exportDataset);

module.exports = router;
