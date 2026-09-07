import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./QuizTakerArea.module.css";
import { LogIn, Key, User } from "lucide-react";
import { useSelector } from "react-redux";
import TeacherRoomManager from "../teacher/TeacherRoomManager";
import { useEnterRoomMutation } from "../../redux/api/roomApiSlice";

function QuizTakerArea() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [roomCode, setRoomCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [enterRoom, { isLoading }] = useEnterRoomMutation();

  if (user?.role === "teacher") {
    return <TeacherRoomManager user={user} />;
  }

  const handleJoin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!roomCode.trim() || !studentId.trim()) {
      setErrorMsg("Please enter both a Room Code and a Student Number.");
      return;
    }

    try {
      // The backend returns { room, session }
      const res = await enterRoom({ 
        room_code: roomCode.trim().toUpperCase(), 
        student_id: studentId.trim() 
      }).unwrap();
      
      // Store the session details locally so the next screen knows who the student is
      localStorage.setItem("studentSession", JSON.stringify(res.session));
      localStorage.setItem("currentRoom", JSON.stringify(res.room));
      
      // Navigate to the live room using the room_code (or room._id)
      navigate(`/student/room/${res.room.room_code}`);
    } catch (err) {
      setErrorMsg(err?.data?.error || "Failed to join room. Please check your code.");
    }
  };

  return (
    <div className={styles.joinContainer}>
      <div className={styles.joinCard}>
        <div className={styles.joinHeader}>
          <div className={styles.iconWrapper}>
            <LogIn size={32} className={styles.headerIcon} />
          </div>
          <h1>Join a Classroom</h1>
          <p>Enter your room code and student number to connect.</p>
        </div>

        <form onSubmit={handleJoin} className={styles.joinForm}>
          {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

          <div className={styles.inputGroup}>
            <label>Room Code</label>
            <div className={styles.inputWrapper}>
              <Key size={20} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. 1A2B3C"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>Student Number</label>
            <div className={styles.inputWrapper}>
              <User size={20} className={styles.inputIcon} />
              <input
                type="text"
                placeholder="e.g. S123456"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.joinBtn}
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Enter Room"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuizTakerArea;
