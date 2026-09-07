const express = require('express');
const router = express.Router();
const { getDatasets, updateDatasetAccess } = require('../../controllers/superAdmin/datasets');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRole } = require("../../middlewares/roleMiddleware");

const requireSuperAdmin = [requireAuth, requireRole("super_admin")];

router.get('/', requireSuperAdmin, getDatasets);
router.put('/access/:datasetId', requireSuperAdmin, updateDatasetAccess);

module.exports = router;
