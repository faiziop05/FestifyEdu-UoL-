import React from "react";
import { Lock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import styles from "../../styles/components_css/StudentQuiz/QuestionPanel.module.css";

const QuestionPanel = ({
  currentQuestion,
  isAlreadySubmitted,
  isAnswersRevealed,
  answers,
  currentQuestionIndex,
  handleAnswerChange,
  handlePrev,
  handleNext,
  isLastQuestion,
  hasAnsweredAtLeastOne,
  getOptText
}) => {
  return (
    <div className={styles.questionPanelWrapper}>
      <div className={styles.questionPanel}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h2 className={styles.questionText} style={{ margin: 0 }}>
            {currentQuestion.question_text}
          </h2>
          {isAlreadySubmitted && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--success-color)",
                padding: "0.4rem 0.8rem",
                borderRadius: "99px",
                fontSize: "0.85rem",
                fontWeight: 700,
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <Lock size={14} /> SUBMITTED
            </span>
          )}
        </div>

        {/* Reveal Answer Banner */}
        {isAnswersRevealed && (
          <div style={{ marginBottom: "1.5rem" }}>
            {answers[currentQuestionIndex] === undefined ? (
              <div
                style={{
                  padding: "0.875rem 1.25rem",
                  borderRadius: "12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "var(--orangeAccent)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={20} />
                <span>
                  Not Answered / Closed — Correct Answer(s):{" "}
                  <strong>
                    {Array.isArray(currentQuestion.correct_answers)
                      ? currentQuestion.correct_answers.join(", ")
                      : currentQuestion.correct_answers}
                  </strong>
                </span>
              </div>
            ) : (
              (() => {
                const ans = answers[currentQuestionIndex];
                const correctAns = currentQuestion.correct_answers || [];
                const isCorrect = Array.isArray(ans)
                  ? ans.every((a) => correctAns.includes(a))
                  : correctAns.includes(ans);

                return isCorrect ? (
                  <div
                    style={{
                      padding: "0.875rem 1.25rem",
                      borderRadius: "12px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "var(--success-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={20} />
                    <span>✓ Correct Answer (+10 pts)</span>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "0.875rem 1.25rem",
                      borderRadius: "12px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "var(--error-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: 600,
                    }}
                  >
                    <XCircle size={20} />
                    <span>
                      ✗ Incorrect Answer — Correct Answer:{" "}
                      <strong>
                        {Array.isArray(correctAns)
                          ? correctAns.join(", ")
                          : correctAns}
                      </strong>
                    </span>
                  </div>
                );
              })()
            )}
          </div>
        )}

        <div className={styles.answerArea}>
          {currentQuestion.question_type === "choose_one" && (
            <div className={styles.optionsList}>
              {(currentQuestion.options || []).map((opt, i) => {
                const optVal = getOptText(opt);
                const isSelected = answers[currentQuestionIndex] === optVal;
                const isCorrectChoice = currentQuestion.correct_answers?.includes(optVal);

                let optionStyle = {};
                if (isAnswersRevealed) {
                  if (isCorrectChoice) {
                    optionStyle = {
                      background: "rgba(16, 185, 129, 0.15)",
                      borderColor: "var(--success-color)",
                      color: "var(--success-color)",
                    };
                  } else if (isSelected && !isCorrectChoice) {
                    optionStyle = {
                      background: "rgba(239, 68, 68, 0.15)",
                      borderColor: "var(--error-color)",
                      color: "var(--error-color)",
                    };
                  }
                }

                return (
                  <label
                    key={i}
                    className={`${styles.optionLabel} ${isSelected ? styles.selectedOption : ""}`}
                    style={{
                      ...optionStyle,
                      cursor: isAlreadySubmitted ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name={`q-${currentQuestionIndex}`}
                      value={optVal}
                      checked={isSelected}
                      disabled={isAlreadySubmitted}
                      onChange={(e) =>
                        !isAlreadySubmitted && handleAnswerChange(e.target.value)
                      }
                      className={styles.hiddenRadio}
                    />
                    <div className={styles.radioCircle}></div>
                    <span className={styles.optionText}>
                      {optVal}
                      {isAnswersRevealed && isCorrectChoice && " (Correct Answer)"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {currentQuestion.question_type === "mcq" && (
            <div className={styles.optionsList}>
              {(currentQuestion.options || []).map((opt, i) => {
                const optVal = getOptText(opt);
                const isSelected = Array.isArray(answers[currentQuestionIndex])
                  ? answers[currentQuestionIndex].includes(optVal)
                  : answers[currentQuestionIndex] === optVal;
                const isCorrectChoice = currentQuestion.correct_answers?.includes(optVal);

                let optionStyle = {};
                if (isAnswersRevealed) {
                  if (isCorrectChoice) {
                    optionStyle = {
                      background: "rgba(16, 185, 129, 0.15)",
                      borderColor: "var(--success-color)",
                      color: "var(--success-color)",
                    };
                  } else if (isSelected && !isCorrectChoice) {
                    optionStyle = {
                      background: "rgba(239, 68, 68, 0.15)",
                      borderColor: "var(--error-color)",
                      color: "var(--error-color)",
                    };
                  }
                }

                return (
                  <label
                    key={i}
                    className={`${styles.optionLabel} ${isSelected ? styles.selectedOption : ""}`}
                    style={{
                      ...optionStyle,
                      cursor: isAlreadySubmitted ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name={`q-${currentQuestionIndex}`}
                      value={optVal}
                      checked={isSelected}
                      disabled={isAlreadySubmitted}
                      onChange={(e) =>
                        !isAlreadySubmitted &&
                        handleAnswerChange(e.target.value, e.target.checked)
                      }
                      className={styles.hiddenRadio}
                    />
                    <div className={styles.checkboxSquare}></div>
                    <span className={styles.optionText}>
                      {optVal}
                      {isAnswersRevealed && isCorrectChoice && " (Correct Answer)"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {(currentQuestion.question_type === "text" || currentQuestion.question_type === "blank") && (
            <textarea
              className={styles.textInput}
              placeholder={
                isAlreadySubmitted ? "Your submission is recorded" : "Type your answer here..."
              }
              value={answers[currentQuestionIndex] || ""}
              disabled={isAlreadySubmitted}
              onChange={(e) => !isAlreadySubmitted && handleAnswerChange(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className={styles.footerActions}>
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className={styles.btnSecondary}
        >
          Previous
        </button>

        {isAlreadySubmitted && isLastQuestion ? (
          <button
            disabled
            className={styles.btnPrimary}
            style={{
              opacity: 0.7,
              cursor: "not-allowed",
              background: "var(--success-color)",
            }}
          >
            <CheckCircle2 size={16} /> Quiz Submitted
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={styles.btnPrimary}
            disabled={isLastQuestion ? !hasAnsweredAtLeastOne && !isAlreadySubmitted : false}
          >
            {isLastQuestion ? "Submit Quiz" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
