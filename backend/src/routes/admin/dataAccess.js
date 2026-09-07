const express = require('express');
const router = express.Router();
const { authMiddleware: auth } = require("../../middlewares/authMiddleware");
const dataAccessController = require('../../controllers/admin/dataAccess');

// Middleware to ensure user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

router.use(auth);
router.use(isAdmin);

router.get('/datasets', dataAccessController.getAdminDatasets);
router.put('/datasets/:id/access', dataAccessController.updateAdminDatasetAccess);

router.get('/quizzes', dataAccessController.getAdminQuizzes);
router.put('/quizzes/:id/access', dataAccessController.updateAdminQuizAccess);

router.get('/teachers', dataAccessController.getOrganizationTeachers);

module.exports = router;
