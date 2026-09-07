const express = require('express');
const router = express.Router();
const { getQuiz, submitAnswer, getSessionStatus, saveProgress } = require('../../controllers/Student/Quizzes');

router.get('/:quiz_id', getQuiz);
router.post('/submit', submitAnswer);
router.get('/session/:session_id', getSessionStatus);
router.post('/progress', saveProgress);

module.exports = router;
