const Classrooms = require("../../models/classrooms");

const createRoom = async (req, res) => {
  try {
    const { name, teacher_id, dataset_id, quizzes, settings, scheduled_for, status } =
      req.body;

    let roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    let existingRoom = await Classrooms.findOne({ room_code: roomCode });

    while (existingRoom) {
      roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      existingRoom = await Classrooms.findOne({ room_code: roomCode });
    }
    const room = await Classrooms.create({
      name: name || "Untitled Session",
      teacher_id,
      dataset_id,
      quizzes: quizzes || [],
      settings: settings || {},
      scheduled_for: scheduled_for || null,
      status: status || "waiting",
      room_code: roomCode,
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const orgId = req.user?.organization_id;
    let query = { teacher_id: req.user._id };
    
    if (req.user?.role === "super_admin") {
      query = {}; // Super admins see all rooms
    } else if (req.user?.role === "admin" && orgId) {
      // Find all users in the same organization
      const Users = require("../../models/users");
      const usersInOrg = await Users.find({ organization_id: orgId }).select('_id');
      const superAdmins = await Users.find({ role: "super_admin" }).select('_id');
      
      const userIds = [
        ...usersInOrg.map(u => u._id),
        ...superAdmins.map(u => u._id)
      ];
      
      query = { teacher_id: { $in: userIds } };
    }
    
    const rooms = await Classrooms.find(query)
      .populate("teacher_id", "name email")
      .populate("dataset_id", "name")
      .populate("quizzes.quiz_id", "name description questions")
      .populate("students.student_session_id", "display_name score status student_id submitted_quizzes");
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Classrooms.findById(req.params.id)
      .populate("teacher_id", "name email")
      .populate("dataset_id", "name")
      .populate("quizzes.quiz_id", "name description questions")
      .populate("students.student_session_id", "display_name score status student_id submitted_quizzes");
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { name, status, settings, quiz_id, quizzes } = req.body;
    const id = req.params.id || req.body.id;
    const room = await Classrooms.findById(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (name) {
      room.name = name;
    }
    if (status) {
      if (status === "active" && room.status !== "active") {
        room.started_at = new Date();
      } else if (status === "ended" && room.status !== "ended") {
        room.ended_at = new Date();
      }
      room.status = status;
    }
    if (settings) {
      room.settings = settings;
    }
    if (quiz_id) {
      room.quizzes.push({ quiz_id, status: "waiting" });
    }
    if (quizzes) {
      room.quizzes = quizzes;
    }
    await room.save();

    const updatedRoom = await Classrooms.findById(room._id)
      .populate("teacher_id", "name email")
      .populate("dataset_id", "name")
      .populate("quizzes.quiz_id", "name description questions")
      .populate("students.student_session_id", "display_name score status student_id submitted_quizzes");

    const io = req.app.get("io");
    if (io) {
      const roomCodeStr = String(room.room_code);
      io.to(roomCodeStr).emit("room_updated", {
        status: updatedRoom.status,
        settings: updatedRoom.settings,
        quizzes: updatedRoom.quizzes,
        students: updatedRoom.students,
      });

      // Find active or ended quizzes to emit specific events
      if (updatedRoom.quizzes && updatedRoom.quizzes.length > 0) {
        updatedRoom.quizzes.forEach((q) => {
          if (q.status === "active") {
            io.to(roomCodeStr).emit("quiz_started", {
              quiz_id: q.quiz_id?._id || q.quiz_id,
              quiz: q,
            });
          } else if (q.status === "ended") {
            io.to(roomCodeStr).emit("quiz_ended", {
              quiz_id: q.quiz_id?._id || q.quiz_id,
            });
          }
        });
      }
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const room = await Classrooms.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const io = req.app.get("io");
    if (io) {
      io.to(String(room.room_code)).emit("force_disconnect", {
        message: "The teacher has ended and deleted this session.",
      });
    }

    await Classrooms.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoom,
  updateRoom,
  deleteRoom,
};
