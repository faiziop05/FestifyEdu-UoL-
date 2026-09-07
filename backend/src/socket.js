const Classrooms = require("./models/classrooms");
const StudentSessions = require("./models/studentSessions");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room_teacher", async ({ room_code }) => {
      try {
        const room = await Classrooms.findOne({ room_code });
        if (room) {
          room.socket_id = socket.id;
          await room.save();
          socket.join(room_code);
          console.log(`Teacher joined room: ${room_code}`);
        }
      } catch (error) {
        console.error("Error joining room as teacher:", error);
      }
    });

    socket.on("end_session", ({ room_code }) => {
      console.log(`Teacher ended session for room: ${room_code}`);
      io.to(room_code).emit("session_ended", {
        message: "This session has been ended by the teacher.",
      });
    });
    socket.on("join_room_student", async ({ room_code, session_id }) => {
      try {
        const session = await StudentSessions.findById(session_id);
        if (session) {
          if (session.socket_id && session.socket_id !== socket.id) {
            // We previously forced disconnected the old socket here, but that 
            // broke real-time updates if a student opened multiple tabs.
            // Now we allow multiple tabs for the same session.
            console.log(`Session ${session_id} is connecting from a new tab/socket.`);
          }

          session.socket_id = socket.id;
          await session.save();
          socket.join(room_code);
          console.log(
            `Student (Session: ${session_id}) joined room: ${room_code}`,
          );

          socket.to(room_code).emit("student_joined", {
            session_id: session._id,
            display_name: session.display_name,
            socket_id: socket.id,
          });

          // Fetch populated room and send to the connecting student
          const populatedRoom = await Classrooms.findOne({ room_code: String(room_code) })
            .populate("students.student_session_id", "display_name score status student_id");
            
          if (populatedRoom) {
            socket.emit("room_updated", {
              status: populatedRoom.status,
              settings: populatedRoom.settings,
              quizzes: populatedRoom.quizzes,
              students: populatedRoom.students,
            });
          }
        }
      } catch (error) {
        console.error("Error joining room as student:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.id}`);
      try {
        const session = await StudentSessions.findOneAndUpdate(
          { socket_id: socket.id },
          { status: "disconnected" },
          { returnDocument: "after" },
        );
        if (session) {
          const room = await Classrooms.findById(session.classroom_id);
          if (room) {
            io.to(room.room_code).emit("student_disconnected", {
              session_id: session._id,
              socket_id: socket.id,
            });
            console.log(
              `Student (Session: ${session._id}) disconnected from room: ${room.room_code}`,
            );
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
};

module.exports = socketHandler;
