const express = require('express');
const router = express.Router();
const { enterRoom, exitRoom } = require('../../controllers/Student/room');

router.post('/enter', enterRoom);
router.post('/exit', exitRoom);

module.exports = router;
