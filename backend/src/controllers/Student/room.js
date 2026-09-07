const Classrooms = require("../../models/classrooms");

const quizzes = require("../../models/quizzes");
const studentSessions = require("../../models/studentSessions");
const { generateDisplayName } = require("../../data/constant");

const enterRoom = async (req, res) => {
  try {
    const { room_code, student_id } = req.body;
    const room = await Classrooms.findOne({ room_code })
      .populate("students.student_session_id", "display_name score status student_id");
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (room.status === "waiting" || room.status === "scheduled") {
      return res.status(400).json({ error: "The teacher hasn't started this session yet. Please wait." });
    }
    if (room.status === "ended") {
      return res.status(400).json({ error: "This room session has ended." });
    }

    let existingSession = await studentSessions.findOne({
      classroom_id: room._id,
      student_id: student_id,
    });

    if (existingSession) {
      existingSession.status = "connected";
      await existingSession.save();
      
      const populatedRoom = await Classrooms.findById(room._id)
        .populate("students.student_session_id", "display_name score status student_id");
        
      return res.status(200).json({ room: populatedRoom, session: existingSession });
    }

    let displayName = generateDisplayName();
    let existingName = await studentSessions.findOne({
      classroom_id: room._id,
      display_name: displayName,
    });

    while (existingName) {
      displayName = generateDisplayName();
      existingName = await studentSessions.findOne({
        classroom_id: room._id,
        display_name: displayName,
      });
    }
    const newStudentSession = new studentSessions({
      classroom_id: room._id,
      display_name: displayName,
      student_id: student_id,
    });
    await newStudentSession.save();

    await room.updateOne({
      $push: {
        students: {
          student_session_id: newStudentSession._id,
        },
      },
    });
    
    const updatedRoom = await Classrooms.findById(room._id)
      .populate("students.student_session_id", "display_name score status student_id");
      
    res.status(200).json({ room: updatedRoom, session: newStudentSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const exitRoom = async (req, res) => {
  try {
    const { session_id } = req.body;
    const session = await studentSessions.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    session.status = "disconnected";
    await session.save();
    res.status(200).json({ message: "Room exited successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  enterRoom,
  exitRoom,
};
