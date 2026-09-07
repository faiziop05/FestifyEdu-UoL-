import React from "react";
import { History, CheckCircle2, Clock } from "lucide-react";
import styles from "../../styles/components_css/StudentRoomLobby/LobbyHistoryList.module.css";

const LobbyHistoryList = ({ quizzes, session, sessionStatus, handleTakeQuiz }) => {
  return (
    <div className={styles.historySection}>
      <div className={styles.historyHeader}>
        <History size={20} className={styles.historyIcon} />
        <h3>Your Session Activity</h3>
      </div>
      <div className={styles.historyList}>
        {quizzes.map((q, idx) => {
          const qId = q.quiz_id?._id || q.quiz_id;
          const quizName = q.quiz_id?.name || "Live Quiz";
          const localSub = localStorage.getItem(`submittedQuiz_${session?._id}_${qId}`);
          const dbSub = sessionStatus?.submitted_quizzes?.find(
            (sq) => String(sq.quiz_id?._id || sq.quiz_id) === String(qId)
          );
          const isSubmitted = Boolean(localSub || dbSub);
          const scoreEarned = dbSub?.score;

          return (
            <div key={idx} className={styles.historyItem}>
              <div className={styles.historyItemLeft}>
                {isSubmitted ? (
                  <CheckCircle2 size={18} color="var(--success-color)" />
                ) : (
                  <Clock size={18} color="var(--orangeAccent)" />
                )}
                <div>
                  <strong>{quizName}</strong>
                  <div className={styles.historyMeta}>
                    Status: {isSubmitted ? "Submitted & Recorded" : q.status.toUpperCase()}
                  </div>
                </div>
              </div>
              <div className={styles.historyItemRight}>
                {isSubmitted ? (
                  <span className={styles.scorePill}>
                    {scoreEarned !== undefined ? `${scoreEarned} pts` : "Submitted"}
                  </span>
                ) : (
                  <span className={styles.pendingPill}>Not Submitted</span>
                )}
                <button 
                  className={styles.historyActionBtn}
                  onClick={() => handleTakeQuiz(qId)}
                  disabled={!isSubmitted && q.status !== "active"}
                >
                  {isSubmitted ? "Review" : "Take Quiz"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyHistoryList;
