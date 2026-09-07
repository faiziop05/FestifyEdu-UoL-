import React from "react";
import { ArrowLeft, Eye, Save } from "lucide-react";
import styles from "../styles/components_css/QuizTopBar.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function QuizTopBar({
  quizId,
  quizName,
  setQuizName,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  handlePublishQuiz,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <button
          className={styles.backBtn}
          onClick={() => {
            const getRedirectPath = (path) => {
              if (user?.role === "super_admin") return `/super-admin/${path}`;
              if (user?.role === "admin") return `/admin/${path}`;
              return `/teacher/${path}`;
            };

            if (hasUnsavedChanges) {
              if (
                window.confirm(
                  "You have unsaved changes. Are you sure you want to leave without saving?",
                )
              ) {
                navigate(getRedirectPath("quiz-builder"));
              }
            } else {
              navigate(getRedirectPath("quiz-builder"));
            }
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
      <div className={styles.topBarTitle}>
        <input
          type="text"
          placeholder="Enter Quiz Title..."
          value={quizName}
          onChange={(e) => {
            setQuizName(e.target.value);
            setHasUnsavedChanges(true);
          }}
          className={styles.quizTitleInput}
        />
      </div>
      <div className={styles.topBarActions}>
        <button
          className={`${styles.publishBtnTop} ${styles.previewBtn}`}
          onClick={() => {
            if (quizId) {
              window.open(`/student/take-quiz/${quizId}`, "_blank");
            } else {
              alert("Please save the quiz as a draft first to preview it.");
            }
          }}
        >
          <Eye size={18} /> Preview as Student
        </button>
        <button
          className={`${styles.publishBtnTop} ${styles.draftBtn}`}
          onClick={() => handlePublishQuiz("draft")}
        >
          <Save size={18} /> Save as Draft
        </button>
        <button
          className={styles.publishBtnTop}
          onClick={() => handlePublishQuiz("published")}
        >
          <Save size={18} /> Publish Quiz
        </button>
      </div>
    </div>
  );
}
