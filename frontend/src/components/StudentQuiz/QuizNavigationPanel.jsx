import React from "react";
import { Trophy, LayoutDashboard, Info, Database } from "lucide-react";
import styles from "../../styles/components_css/StudentQuiz/QuizNavigationPanel.module.css";

const QuizNavigationPanel = ({
  quiz,
  currentQuestionIndex,
  showLeaderboard,
  studentsList,
  session,
  answers,
  setCurrentQuestionIndex,
  currentQuestion
}) => {
  return (
    <aside className={styles.rightNavSidebar}>
      <div className={styles.navPanelHeader}>
        <h2 className={styles.sidebarQuizTitle}>{quiz.name}</h2>
        <div className={styles.sidebarProgressText}>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
        <div className={styles.sidebarProgressBar}>
          <div
            className={styles.sidebarProgressFill}
            style={{
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className={styles.navPanelContent}>
        {showLeaderboard && (
          <div className={styles.navSection} style={{ marginTop: "16px" }}>
            <div className={styles.navSectionHeader}>
              <Trophy size={16} color="var(--orangeAccent)" />
              <span>Leaderboard</span>
            </div>
            <div
              className={styles.questionGrid}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "250px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {studentsList.length > 0 ? (
                [...studentsList]
                  .sort(
                    (a, b) =>
                      (b.student_session_id?.score || 0) -
                      (a.student_session_id?.score || 0),
                  )
                  .map((student, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                        padding: "6px 8px",
                        background:
                          student.student_session_id?._id === session?._id
                            ? "rgba(var(--brand-primary-rgb), 0.1)"
                            : "var(--bg-default)",
                        border:
                          student.student_session_id?._id === session?._id
                            ? "1px solid var(--brand-primary)"
                            : "1px solid var(--border-color)",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            student.student_session_id?._id === session?._id
                              ? "700"
                              : "500",
                        }}
                      >
                        #{idx + 1} {student.student_session_id?.display_name || "Student"}
                      </span>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "var(--brand-primary)",
                        }}
                      >
                        {student.student_session_id?.score || 0} pts
                      </span>
                    </div>
                  ))
              ) : (
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  No scores yet
                </span>
              )}
            </div>
          </div>
        )}

        <div className={styles.navSection}>
          <div className={styles.navSectionHeader}>
            <LayoutDashboard size={16} />
            <span>Question Map</span>
          </div>
          <div className={styles.questionGrid}>
            {quiz.questions.map((q, idx) => {
              let isAnswered = false;
              if (q.question_type === "mcq") {
                isAnswered = Array.isArray(answers[idx]) && answers[idx].length > 0;
              } else {
                isAnswered = !!answers[idx];
              }
              const isActive = idx === currentQuestionIndex;
              let circleClass = styles.qCircle;
              if (isActive) circleClass += ` ${styles.qCircleActive}`;
              else if (isAnswered) circleClass += ` ${styles.qCircleAnswered}`;

              return (
                <button
                  key={idx}
                  className={circleClass}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  title={`Go to Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navSectionHeader}>
            <Info size={16} />
            <span>Data Context</span>
          </div>
          <div className={styles.contextCard}>
            <div className={styles.contextItem}>
              <Database size={14} className={styles.contextIcon} />
              <span className={styles.contextLabel}>Dataset:</span>
              <span className={styles.contextValue}>{quiz.name}</span>
            </div>
            <div className={styles.contextItem}>
              <LayoutDashboard size={14} className={styles.contextIcon} />
              <span className={styles.contextLabel}>Active Sheet:</span>
              <span className={styles.contextValue}>
                {currentQuestion.sheet_name || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default QuizNavigationPanel;
