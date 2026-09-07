const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getQuizzesByTeacher, 
  getAllPublishedQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} = require('../../controllers/teachers/quizzesController');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRoles } = require("../../middlewares/roleMiddleware");

const requireQuizRoles = [requireAuth, requireRoles(["teacher", "admin", "super_admin"])];

// POST /api/teacher/quizzes
router.post('/', requireQuizRoles, createQuiz);

// GET /api/teacher/quizzes/teacher/:teacher_id
// GET /api/teacher/quizzes/teacher/:teacher_id
router.get('/teacher/:teacher_id', requireQuizRoles, getQuizzesByTeacher);

// GET /api/teacher/quizzes/published
router.get('/published', requireQuizRoles, getAllPublishedQuizzes);

// GET /api/teacher/quizzes/quiz/:id
router.get('/quiz/:id', requireQuizRoles, getQuizById);

// PUT /api/teacher/quizzes/:id
router.put('/:id', requireQuizRoles, updateQuiz);

// DELETE /api/teacher/quizzes/:id
router.delete('/:id', requireQuizRoles, deleteQuiz);

module.exports = router;
