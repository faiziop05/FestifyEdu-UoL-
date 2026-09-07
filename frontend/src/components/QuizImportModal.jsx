import React from "react";
import styles from "../styles/components_css/QuizImportModal.module.css";

export default function QuizImportModal({
  isOpen,
  onClose,
  teacherQuizzes,
  selectedImportQuizId,
  setSelectedImportQuizId,
  selectedImportQuestions,
  setSelectedImportQuestions,
  handleImportQuestions,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Import Questions</h2>
          <button className={styles.closeModalBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Select a Quiz to Import From</label>
            <select
              value={selectedImportQuizId}
              onChange={(e) => {
                setSelectedImportQuizId(e.target.value);
                setSelectedImportQuestions([]);
              }}
              className={styles.selectInput}
            >
              <option value="">-- Choose Quiz --</option>
              {teacherQuizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {selectedImportQuizId && (
            <div className={styles.importQuestionList}>
              <h4>Select Questions to Import</h4>
              {teacherQuizzes
                .find((q) => q._id === selectedImportQuizId)
                ?.questions.map((q, i) => (
                  <label key={q._id} className={styles.importQuestionItem}>
                    <input
                      type="checkbox"
                      checked={selectedImportQuestions.includes(q._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedImportQuestions([
                            ...selectedImportQuestions,
                            q._id,
                          ]);
                        } else {
                          setSelectedImportQuestions(
                            selectedImportQuestions.filter(
                              (id) => id !== q._id,
                            ),
                          );
                        }
                      }}
                    />
                    <span>
                      {i + 1}. {q.question_text || "Untitled Question"}
                    </span>
                  </label>
                ))}
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleImportQuestions}
            disabled={selectedImportQuestions.length === 0}
          >
            Import Selected ({selectedImportQuestions.length})
          </button>
        </div>
      </div>
    </div>
  );
}
