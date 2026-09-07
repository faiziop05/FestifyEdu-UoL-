import React from "react";
import { Plus, BookOpen, Play, Square, Eye, EyeOff, List } from "lucide-react";
import styles from "../../styles/pages_css/ActiveRoomLobby.module.css";

const RoomLobbyQuizzes = ({
  room,
  allQuizzes,
  openQuizModal,
  quizTimers,
  handleTimerChange,
  handleSetQuizStatus,
  handleToggleRevealAnswers,
  openResponsesModal,
  isCodeVisible,
}) => {
  return (
    <div className={`${styles.quizzesArea} ${isCodeVisible ? styles.blurred : ''}`}>
      <div className={styles.quizzesHeader}>
        <h3>Active Quizzes</h3>
        <button className={styles.manageQuizzesBtn} onClick={openQuizModal}>
          <Plus size={16} /> Add / Remove Quizzes
        </button>
      </div>
      
      <div className={styles.quizListGrid}>
        {room.quizzes?.length > 0 ? (
          room.quizzes.map((q, idx) => {
            const quizId = q.quiz_id._id || q.quiz_id;
            const quizData = allQuizzes?.find((aq) => aq._id === quizId);
            return (
              <div key={idx} className={`${styles.quizCard} ${styles[q.status]}`}>
                <div className={styles.quizCardInfo}>
                  <BookOpen size={24} />
                  <div>
                    <h4>{quizData ? quizData.name : "Unknown Quiz"}</h4>
                    <div className={styles.quizMetaText}>
                      <span className={styles.quizStatusText}>{q.status.toUpperCase()}</span>
                      {q.time_limit && (
                        <span className={styles.timerText}>
                          • {q.time_limit} min timer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.quizCardActions}>
                  {q.status !== "active" ? (
                    <div className={styles.startGroup}>
                      <input 
                        type="number"
                        className={styles.timerInput}
                        min="0"
                        max="120"
                        placeholder="0"
                        value={quizTimers[quizId] || ""}
                        onChange={(e) => handleTimerChange(quizId, e.target.value)}
                        title="Set timer in minutes (0 for no timer)"
                      />
                      <span className={styles.timerInputLabel}>mins</span>
                      <button 
                        className={styles.startQuizBtn}
                        onClick={() => handleSetQuizStatus(quizId, "active")}
                      >
                        <Play size={14} fill="currentColor" /> Start
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={styles.endQuizBtn}
                      onClick={() => handleSetQuizStatus(quizId, "ended")}
                    >
                      <Square size={14} fill="currentColor" /> End
                    </button>
                  )}
                  {q.status === "ended" && (
                    <button 
                      className={styles.resetQuizBtn}
                      onClick={() => handleSetQuizStatus(quizId, "waiting")}
                    >
                      Reset
                    </button>
                  )}
                  <button
                    className={`${styles.resetQuizBtn} ${q.reveal_answers ? styles.activeCode : ''}`}
                    style={{
                      background: q.reveal_answers ? "rgba(16, 185, 129, 0.15)" : "transparent",
                      color: q.reveal_answers ? "var(--success-color)" : "var(--text-secondary)",
                      borderColor: q.reveal_answers ? "var(--success-color)" : "var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onClick={() => handleToggleRevealAnswers && handleToggleRevealAnswers(quizId)}
                    title={q.reveal_answers ? "Hide answers from students" : "Reveal correct answers to students"}
                  >
                    {q.reveal_answers ? <EyeOff size={14} /> : <Eye size={14} />}
                    {q.reveal_answers ? "Hide Answers" : "Reveal Answers"}
                  </button>

                  <button
                    className={styles.resetQuizBtn}
                    style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "var(--blueAccent)",
                      borderColor: "rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onClick={() => openResponsesModal && openResponsesModal(quizId)}
                    title="View student responses for this quiz"
                  >
                    <List size={14} />
                    View Responses
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noQuizzesBox}>
            <p>No quizzes selected for this session yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomLobbyQuizzes;
