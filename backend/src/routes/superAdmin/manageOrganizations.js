const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  updateOrganization,
  removeOrganization,
} = require('../../controllers/superAdmin/manageOrganizations');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRole } = require("../../middlewares/roleMiddleware");

const requireSuperAdmin = [requireAuth, requireRole("super_admin")];

router.post('/', requireSuperAdmin, createOrganization);
router.get('/', requireSuperAdmin, getAllOrganizations);
router.put('/:id', requireSuperAdmin, updateOrganization);
router.delete('/:id', requireSuperAdmin, removeOrganization);

module.exports = router;
