import React from "react";
import styles from "../styles/components_css/QuizBuilder.module.css";
import { Trash2 } from "lucide-react";

const QuestionForm = ({
  register,
  errors,
  currentQuestionType,
  fields,
  watch,
  setValue,
  remove,
  append,
  handleSubmit,
  onSubmitForm,
}) => {
  return (
    <div className={styles["qb-quiz-builder"]}>
      <h2 className={styles["qb-title"]}>Finalize Question</h2>
      <p className={styles["qb-subtitle"]}>
        Write a question based on the insights from your chart.
      </p>

      <div className={styles["qb-form-group"]}>
        {currentQuestionType === "blank" && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button
              type="button"
              className={styles["qb-btn-secondary"]}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              onClick={() => {
                const currentText = watch("questionText") || "";
                if (currentText.includes("_______")) {
                  setValue("questionText", currentText.replace("_______", "").trim());
                } else {
                  setValue("questionText", currentText + (currentText.endsWith(" ") || currentText === "" ? "" : " ") + "_______");
                }
              }}
            >
              {watch("questionText")?.includes("_______") ? "Remove Blank" : "Insert Blank (_______)"}
            </button>
          </div>
        )}
        <textarea
          className={`${styles["qb-textarea"]} ${
            errors.questionText ? styles["qb-input-error"] : ""
          }`}
          placeholder="e.g. Based on the chart, the team with the highest frequency of wins is _______."
          {...register("questionText")}
        />
        {errors.questionText && (
          <span className={styles["qb-error-text"]}>
            {errors.questionText.message}
          </span>
        )}
      </div>

      <div className={styles["qb-form-row"]}>
        <div className={styles["qb-half"]}>
          <select className={styles["qb-select"]} {...register("questionType")}>
            <option value="mcq">Multiple Choice</option>
            <option value="choose_one">Choose One (Dropdown)</option>
            <option value="text">Short Answer</option>
            <option value="blank">Fill in the Blank</option>
          </select>
        </div>
        <div className={`${styles["qb-half"]} ${styles["qb-form-group"]}`}>
          {currentQuestionType !== "mcq" &&
            currentQuestionType !== "choose_one" && (
              <>
                <input
                  type="text"
                  className={`${styles["qb-input"]} ${
                    errors.correctAnswer ? styles["qb-input-error"] : ""
                  }`}
                  placeholder="Correct answer..."
                  {...register("correctAnswer")}
                />
                {errors.correctAnswer && (
                  <span className={styles["qb-error-text"]}>
                    {errors.correctAnswer.message}
                  </span>
                )}
              </>
            )}
        </div>
      </div>

      {(currentQuestionType === "mcq" ||
        currentQuestionType === "choose_one") && (
        <div className={styles["qb-options-container"]}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles["qb-option-wrapper"]}>
              <div className={styles["qb-option-row"]}>
                <input
                  type={currentQuestionType === "mcq" ? "checkbox" : "radio"}
                  className={styles["qb-option-is-correct"]}
                  checked={watch(`options.${index}.isCorrect`)}
                  onChange={(e) => {
                    if (currentQuestionType === "choose_one") {
                      fields.forEach((_, i) =>
                        setValue(`options.${i}.isCorrect`, false),
                      );
                    }
                    setValue(`options.${index}.isCorrect`, e.target.checked);
                  }}
                />
                <input
                  type="text"
                  className={`${styles["qb-input"]} ${
                    errors.options?.[index]?.value
                      ? styles["qb-input-error"]
                      : ""
                  }`}
                  placeholder={`Option ${index + 1}`}
                  {...register(`options.${index}.value`)}
                />
                {fields.length > 2 && (
                  <button
                    type="button"
                    className={styles["qb-btn-icon"]}
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {errors.options?.[index]?.value && (
                <span className={styles["qb-error-text"]}>
                  {errors.options[index].value.message}
                </span>
              )}
            </div>
          ))}
          {errors.options?.root && (
            <span className={styles["qb-error-text"]}>
              {errors.options.root.message}
            </span>
          )}
          <button
            type="button"
            className={styles["qb-btn-secondary"]}
            onClick={() => append({ value: "" })}
          >
            + Add Option
          </button>
        </div>
      )}

      <div className={styles["qb-actions"]}>
        <button
          type="button"
          className={styles["qb-btn-primary"]}
          onClick={handleSubmit(onSubmitForm, (errors) =>
            console.log("Validation failed with errors:", errors),
          )}
        >
          Save Question
        </button>
      </div>
    </div>
  );
};

export default QuestionForm;
