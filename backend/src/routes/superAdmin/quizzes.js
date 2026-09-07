const express = require('express');
const router = express.Router();
const { assignQuizToOrganization, getQuizzes, updateQuizAccess } = require('../../controllers/superAdmin/manageQuizzes');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRole } = require("../../middlewares/roleMiddleware");

const requireSuperAdmin = [requireAuth, requireRole("super_admin")];

router.get('/', requireSuperAdmin, getQuizzes);
router.post('/assign/:quizId', requireSuperAdmin, assignQuizToOrganization);
router.put('/access/:quizId', requireSuperAdmin, updateQuizAccess);

module.exports = router;
