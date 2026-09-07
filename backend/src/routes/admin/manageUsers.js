const express = require('express');
const router = express.Router();
const {
  addUsers,
  removeUser,
  updateUser,
  getOrganizationUsers,
  resetPassword,
} = require('../../controllers/admins/manageUsers');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRoles } = require("../../middlewares/roleMiddleware");

const requireAdminOrSuperAdmin = [requireAuth, requireRoles(["admin", "super_admin"])];

router.post('/add', requireAdminOrSuperAdmin, addUsers);
router.delete('/:id', requireAdminOrSuperAdmin, removeUser);
router.put('/:id', requireAdminOrSuperAdmin, updateUser);
router.get('/organization/:organization_id', requireAdminOrSuperAdmin, getOrganizationUsers);
router.post('/reset-password/:id', requireAdminOrSuperAdmin, resetPassword);

module.exports = router;
