const express = require('express');
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  deleteRoom,
} = require('../../controllers/teachers/room');
const { authMiddleware: requireAuth } = require("../../middlewares/authMiddleware");
const { requireRole } = require("../../middlewares/roleMiddleware");

const requireTeacher = [requireAuth, requireRole("teacher")];

router.post('/', requireTeacher, createRoom);
router.get('/', requireTeacher, getAllRooms);
router.get('/:id', requireTeacher, getRoom);
router.put('/:id', requireTeacher, updateRoom);
router.delete('/:id', requireTeacher, deleteRoom);

module.exports = router;
