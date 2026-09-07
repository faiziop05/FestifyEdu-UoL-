import React from "react";
import { Clock, Radio, Lock, CheckCircle2, Eye, BookOpen, Award, Play } from "lucide-react";
import styles from "../../styles/components_css/StudentRoomLobby/LobbyQuizzesGrid.module.css";

const LobbyQuizzesGrid = ({ quizzes, session, sessionStatus, handleTakeQuiz }) => {
  return (
    <div className={styles.quizzesSection}>
      <h3>Classroom Quizzes</h3>
      {quizzes.length === 0 ? (
        <div className={styles.emptyQuizzes}>
          <Clock size={32} className={styles.emptyIcon} />
          <p>No quizzes added to this session yet.</p>
          <span>Your teacher will activate quizzes during the class. Hang tight!</span>
        </div>
      ) : (
        <div className={styles.quizzesGrid}>
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
              <div key={qId || idx} className={`${styles.quizCard} ${isSubmitted ? styles.submittedCard : ""}`}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.badgeGroup}>
                    {q.status === "active" && !isSubmitted && (
                      <span className={styles.liveBadge}>
                        <Radio size={12} className={styles.pulseIcon} /> LIVE NOW
                      </span>
                    )}
                    {q.status === "waiting" && !isSubmitted && (
                      <span className={styles.waitingBadge}>
                        <Clock size={12} /> WAITING
                      </span>
                    )}
                    {q.status === "ended" && !isSubmitted && (
                      <span className={styles.endedBadge}>
                        <Lock size={12} /> CLOSED
                      </span>
                    )}
                    {isSubmitted && (
                      <span className={styles.submittedBadge}>
                        <CheckCircle2 size={12} /> SUBMITTED
                      </span>
                    )}
                    {q.reveal_answers && (
                      <span className={styles.revealedBadge}>
                        <Eye size={12} /> ANSWERS REVEALED
                      </span>
                    )}
                  </div>
                  {q.time_limit && (
                    <span className={styles.timerBadge}>
                      <Clock size={12} /> {q.time_limit} mins
                    </span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.quizTitleRow}>
                    <BookOpen size={22} className={styles.quizTitleIcon} />
                    <h4>{quizName}</h4>
                  </div>

                  {isSubmitted && (
                    <div className={styles.scoreRow}>
                      <Award size={16} color="var(--success-color)" />
                      <span>Score Recorded: <strong>{scoreEarned !== undefined ? `${scoreEarned} pts` : "Submitted"}</strong></span>
                    </div>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  {isSubmitted ? (
                    <button
                      className={styles.reviewBtn}
                      onClick={() => handleTakeQuiz(qId)}
                    >
                      <Eye size={16} /> Review Answers
                    </button>
                  ) : q.status === "active" ? (
                    <button
                      className={styles.startBtn}
                      onClick={() => handleTakeQuiz(qId)}
                    >
                      <Play size={16} /> Start Quiz
                    </button>
                  ) : (
                    <button className={styles.disabledBtn} disabled>
                      <Clock size={16} /> {q.status === "ended" ? "Quiz Ended" : "Waiting for Teacher"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LobbyQuizzesGrid;
