const Classrooms = require('../models/classrooms');

// Function to end stale sessions (older than 3 hours)
const endStaleSessions = async (io) => {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    
    // Find rooms that have been active for more than 3 hours
    const staleRooms = await Classrooms.find({
      status: 'active',
      started_at: { $lt: threeHoursAgo }
    });

    for (const room of staleRooms) {
      room.status = 'ended';
      room.ended_at = new Date();
      await room.save();
      
      const updatedRoom = await Classrooms.findById(room._id)
        .populate("teacher_id", "name email")
        .populate("dataset_id", "name")
        .populate("quizzes.quiz_id", "name description questions")
        .populate("students.student_session_id", "display_name score status student_id submitted_quizzes");

      if (io) {
        const roomCodeStr = String(room.room_code);
        io.to(roomCodeStr).emit("room_updated", {
          status: updatedRoom.status,
          settings: updatedRoom.settings,
          quizzes: updatedRoom.quizzes,
          students: updatedRoom.students,
        });
      }
      
      console.log(`Automatically ended stale session: ${room.name} (Code: ${room.room_code})`);
    }
  } catch (error) {
    console.error("Error in session cleanup cron job:", error);
  }
};

const initSessionCleanupCron = (io) => {
  // Run every 15 minutes
  const intervalMinutes = 15;
  setInterval(() => endStaleSessions(io), intervalMinutes * 60 * 1000);
  
  // Also run once on startup
  endStaleSessions(io);
};

module.exports = initSessionCleanupCron;
