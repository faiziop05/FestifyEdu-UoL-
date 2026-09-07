import React from "react";
import { Calendar, CheckCircle2, XCircle } from "lucide-react";
import styles from "../../styles/components_css/StudentPerformanceDetail/SessionHistoryCard.module.css";

const SessionHistoryCard = ({ session }) => {
  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionHeader}>
        <div>
          <h3 className={styles.sessionTitle}>
            {session.classroom_id?.name || "Untitled Session"}
          </h3>
          <div className={styles.sessionDate}>
            <Calendar size={14} />
            {new Date(
              session.classroom_id?.started_at || session.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div className={styles.scoreBadge}>Score: {session.score}</div>
      </div>

      {session.submitted_quizzes && session.submitted_quizzes.length > 0 ? (
        session.submitted_quizzes.map((quiz, qIdx) => (
          <div key={qIdx} className={styles.quizContainer}>
            <div className={styles.quizHeader}>
              <h4 className={styles.quizTitle}>
                {quiz.quiz_id?.title || quiz.quiz_id?.name || "Quiz"}
              </h4>
              <span className={styles.scoreBadge}>
                Quiz Score: {quiz.score}
              </span>
            </div>

            <div className={styles.questionList}>
              {quiz.answers &&
                quiz.answers.map((ans, aIdx) => {
                  // Find the actual question text if possible
                  const questionObj = quiz.quiz_id?.questions?.find(
                    (q) => q._id.toString() === ans.question_id
                  );
                  const questionText = questionObj
                    ? questionObj.question_text
                    : `Question ${aIdx + 1}`;

                  return (
                    <div key={aIdx} className={styles.questionItem}>
                      <div className={styles.questionText}>{questionText}</div>
                      <div className={styles.answerRow}>
                        {ans.is_correct ? (
                          <CheckCircle2
                            size={16}
                            className={styles.correctAnswer}
                          />
                        ) : (
                          <XCircle
                            size={16}
                            className={styles.incorrectAnswer}
                          />
                        )}
                        <span
                          className={
                            ans.is_correct
                              ? styles.correctAnswer
                              : styles.incorrectAnswer
                          }
                        >
                          Student Answer: {JSON.stringify(ans.answer)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          No quizzes were submitted in this session.
        </p>
      )}
    </div>
  );
};

export default SessionHistoryCard;
