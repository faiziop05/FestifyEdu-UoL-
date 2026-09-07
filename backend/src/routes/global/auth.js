const express = require('express');
const router = express.Router();
const { login, updateProfile } = require('../../controllers/global/auth');
const { authMiddleware } = require('../../middlewares/authMiddleware');

router.post('/login', login);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
