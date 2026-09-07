import React, { useState } from "react";
import { Users, Play, Square } from "lucide-react";
import styles from "../../styles/pages_css/ActiveRoomLobby.module.css";

const RoomLobbyParticipants = ({ room, isCodeVisible, handleStatusChange }) => {
  const [revealedRolls, setRevealedRolls] = useState({});

  const toggleRollNumber = (studentId) => {
    setRevealedRolls((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };
  return (
    <div
      className={`${styles.rightSidebar} ${isCodeVisible ? styles.blurred : ""}`}
    >
      <div className={styles.rightSidebarTop}>
        <div className={styles.statHeader}>
          <Users size={20} />
          <h3>Participants</h3>
        </div>
        <div className={styles.statValueCompact}>
          {room.students?.length || 0}
        </div>
      </div>
      <div className={styles.leaderboardHeader}>
        <h3>Leaderboard</h3>
        <span className={styles.liveIndicator}>Live</span>
      </div>
      <div className={styles.leaderboardList}>
        {room.students?.length > 0 ? (
          [...room.students]
            .sort((a, b) => (b.student_session_id?.score || 0) - (a.student_session_id?.score || 0))
            .map((student, idx) => (
              <div key={idx} className={styles.leaderboardRow}>
              <span className={styles.rank}>#{idx + 1}</span>
              <span
                className={styles.studentName}
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() =>
                  toggleRollNumber(student.student_session_id?._id)
                }
                title="Click to reveal roll number"
              >
                {revealedRolls[student.student_session_id?._id] &&
                student.student_session_id?.student_id
                  ? student.student_session_id?.student_id
                  : student.student_session_id?.display_name ||
                    `Student ${idx + 1}`}
              </span>
              <span className={styles.score}>
                {student.student_session_id?.score || 0} pts
              </span>
            </div>
          ))
        ) : (
          <p className={styles.noStudentsText}>
            Waiting for students to join...
          </p>
        )}
      </div>
    </div>
  );
};

export default RoomLobbyParticipants;
