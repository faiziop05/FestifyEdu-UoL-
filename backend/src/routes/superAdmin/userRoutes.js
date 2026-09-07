const router = require("express").Router();
const {
  addUser,
  removeUser,
  getOrganizationUsers,
  updateUser,
  resetPassword,
} = require("../../controllers/superAdmin/manageUsers");
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRole } = require("../../middlewares/roleMiddleware");
const { login } = require("../../controllers/global/auth");

router.post("/login", login);
router.post("/addUser", requireAuth, requireRole("super_admin"), addUser);
router.post(
  "/removeUser/:id",
  requireAuth,
  requireRole("super_admin"),
  removeUser,
);

router.post(
  "/getOrganizationUsers",
  requireAuth,
  requireRole("super_admin"),
  getOrganizationUsers,
);
router.post("/updateUser/:id", requireAuth, requireRole("super_admin"), updateUser);
router.post(
  "/resetPassword",
  requireAuth,
  requireRole("super_admin"),
  resetPassword,
);

module.exports = router;
