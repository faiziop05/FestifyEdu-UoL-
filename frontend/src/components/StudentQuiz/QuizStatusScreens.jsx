import React from "react";
import { StopCircle, AlertCircle, Loader2 } from "lucide-react";
import styles from "../../styles/components_css/StudentQuiz/QuizStatusScreens.module.css";

export const QuizStoppedScreen = ({ navigate, currentRoom }) => (
  <div className={styles.centerContainer}>
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        background: "var(--bg-surface)",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        maxWidth: "450px",
      }}
    >
      <StopCircle size={56} color="var(--error-color)" style={{ marginBottom: "1rem" }} />
      <h2>Quiz Stopped by Teacher</h2>
      <p style={{ color: "var(--text-secondary)", margin: "1rem 0" }}>
        The teacher has stopped or concluded this live quiz session.
      </p>
      <button
        onClick={() => navigate(currentRoom ? `/student/room/${currentRoom.room_code}` : "/student/join")}
        className={styles.btnPrimary}
      >
        Return to Classroom Lobby
      </button>
    </div>
  </div>
);

export const QuizLoadingScreen = () => (
  <div className={styles.centerContainer}>
    <Loader2 className={styles.spin} size={48} />
  </div>
);

export const QuizErrorScreen = ({ navigate, currentRoom }) => (
  <div className={styles.centerContainer}>
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem",
        background: "var(--bg-surface)",
        borderRadius: "20px",
        border: "1px solid var(--border-color)",
        maxWidth: "450px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <AlertCircle size={56} color="var(--error-color)" style={{ marginBottom: "1rem" }} />
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
        Unable to Load Quiz
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
        The requested quiz details could not be retrieved from the server.
      </p>
      <button
        onClick={() => navigate(currentRoom ? `/student/room/${currentRoom.room_code}` : "/student/join")}
        className={styles.btnPrimary}
        style={{ width: "100%", padding: "0.875rem", borderRadius: "12px" }}
      >
        Return to Classroom Lobby
      </button>
    </div>
  </div>
);

export const QuizEmptyScreen = ({ navigate, currentRoom }) => (
  <div className={styles.centerContainer}>
    <div
      style={{
        textAlign: "center",
        padding: "2.5rem",
        background: "var(--bg-surface)",
        borderRadius: "20px",
        border: "1px solid var(--border-color)",
        maxWidth: "450px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      <AlertCircle size={56} color="var(--orangeAccent)" style={{ marginBottom: "1rem" }} />
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
        No Questions Available
      </h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
        This quiz does not have any questions configured.
      </p>
      <button
        onClick={() => navigate(currentRoom ? `/student/room/${currentRoom.room_code}` : "/student/join")}
        className={styles.btnPrimary}
        style={{ width: "100%", padding: "0.875rem", borderRadius: "12px" }}
      >
        Return to Classroom Lobby
      </button>
    </div>
  </div>
);
