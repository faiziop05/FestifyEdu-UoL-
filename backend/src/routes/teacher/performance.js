const express = require('express');
const router = express.Router();
const { getStudentPerformance, getStudentPerformanceDetail } = require('../../controllers/teacher/performance');
const { authMiddleware } = require('../../middlewares/authMiddleware');

router.get('/', authMiddleware, getStudentPerformance);
router.get('/:studentId', authMiddleware, getStudentPerformanceDetail);

module.exports = router;
