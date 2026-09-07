import React, { useState, useEffect } from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
} from "react-chartjs-2";
import {
  X,
  CheckCircle2,
  XCircle,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ScatterChart as ScatterChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StudentChartViewer from "../../pages/student/StudentChartViewer";
import styles from "../../styles/components_css/QuizResponsesModal.module.css";

const CHART_ICONS = {
  Bar: BarChartIcon,
  HorizontalBar: BarChartIcon,
  Line: LineChartIcon,
  Area: LineChartIcon,
  Pie: PieChartIcon,
  Doughnut: PieChartIcon,
  Radar: ScatterChartIcon,
  PolarArea: PieChartIcon,
  Scatter: ScatterChartIcon,
  Bubble: ScatterChartIcon,
};

const QuizResponsesModal = ({ isOpen, onClose, quizId, room, allQuizzes }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeChartType, setActiveChartType] = useState("Bar");
  const [revealedRoles, setRevealedRoles] = useState({});

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setRevealedRoles({});
    }
  }, [isOpen]);

  if (!isOpen || !quizId || !room) return null;

  const roomQuizObj = room.quizzes?.find(
    (q) => String(q.quiz_id?._id || q.quiz_id) === String(quizId),
  );

  let quiz = roomQuizObj?.quiz_id || {};
  if (allQuizzes) {
    const fullQuiz = allQuizzes.find((q) => String(q._id) === String(quizId));
    if (fullQuiz) quiz = fullQuiz;
  }

  if (!quiz || !quiz.questions) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || {};

  const submittedStudents =
    room.students?.filter((student) => {
      const session = student.student_session_id;
      if (!session || !session.submitted_quizzes) return false;
      return session.submitted_quizzes.some(
        (sq) => String(sq.quiz_id?._id || sq.quiz_id) === String(quizId),
      );
    }) || [];

  const getOptText = (opt) => {
    if (typeof opt === "string") return opt;
    if (opt && typeof opt === "object")
      return opt.option ?? opt.text ?? opt.label ?? "";
    return String(opt ?? "");
  };

  const toggleRole = (studentId) => {
    setRevealedRoles((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Aggregate responses
  const responseGroups = {};
  let totalResponsesForQ = 0;

  submittedStudents.forEach((student) => {
    const session = student.student_session_id;
    const submission = session.submitted_quizzes.find(
      (sq) => String(sq.quiz_id?._id || sq.quiz_id) === String(quizId),
    );
    if (!submission) return;

    const ansObj = submission.answers?.find(
      (a) => String(a.question_id) === String(currentQuestion._id),
    );
    if (ansObj) {
      let ansText = ansObj.answer;

      const addStudentToGroup = (t) => {
        if (!t) return;
        if (!responseGroups[t]) {
          responseGroups[t] = { count: 0, students: [] };
        }
        responseGroups[t].count += 1;
        responseGroups[t].students.push(session);
      };

      if (Array.isArray(ansText)) {
        if (ansText.length > 0) totalResponsesForQ++;
        ansText.forEach((a) => {
          const t = String(getOptText(a) || "");
          addStudentToGroup(t);
        });
      } else {
        let t = ansText;
        if (t && typeof t === "object") t = getOptText(t);
        t = String(t || "");
        if (t) {
          addStudentToGroup(t);
          totalResponsesForQ++;
        }
      }
    }
  });

  // Unique keys for rendering
  let optionKeys = [];
  if (currentQuestion.options && currentQuestion.options.length > 0) {
    optionKeys = currentQuestion.options.map((o) => String(getOptText(o)));
  }
  Object.keys(responseGroups).forEach((k) => {
    if (!optionKeys.includes(k)) optionKeys.push(k);
  });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <h2>{quiz.name || "Review Responses"}</h2>
            <p>{submittedStudents.length} student(s) submitted this quiz</p>
          </div>
          <div className={styles.modalHeaderRight}>
            <div className={styles.navControls}>
              <button
                onClick={() => {
                  setCurrentQuestionIndex(
                    Math.max(0, currentQuestionIndex - 1),
                  );
                  setActiveChartType(
                    questions[Math.max(0, currentQuestionIndex - 1)]
                      ?.chartType || "Bar",
                  );
                }}
                disabled={currentQuestionIndex === 0}
                className={styles.navBtn}
              >
                <ChevronLeft size={20} /> Prev
              </button>
              <span className={styles.navCounter}>
                Q{currentQuestionIndex + 1} / {questions.length}
              </span>
              <button
                onClick={() => {
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1),
                  );
                  setActiveChartType(
                    questions[
                      Math.min(questions.length - 1, currentQuestionIndex + 1)
                    ]?.chartType || "Bar",
                  );
                }}
                disabled={currentQuestionIndex === questions.length - 1}
                className={styles.navBtn}
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
            <button className={styles.closeBtn} onClick={onClose} title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.splitLayout}>
            {/* LEFT: Visuals / Charts */}
            <div className={styles.leftPane}>
              {currentQuestion.dataset_id ||
              currentQuestion.chartType ||
              currentQuestion.chart_type ||
              (currentQuestion.allowedCharts &&
                currentQuestion.allowedCharts.length > 0) ? (
                <div className={styles.chartArea}>
                  <div style={{ marginBottom: "12px" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        color: "var(--text-primary)",
                      }}
                    >
                      Dataset Reference
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      This chart visualizes the source dataset for this
                      question, not the student responses.
                    </p>
                  </div>
                  <div className={styles.chartControls}>
                    {Object.keys(CHART_ICONS)
                      .filter(
                        (type) =>
                          !currentQuestion.allowedCharts ||
                          currentQuestion.allowedCharts.includes(type),
                      )
                      .map((type) => {
                        const Icon = CHART_ICONS[type];
                        return (
                          <button
                            key={type}
                            className={`${styles.chartTypeBtn} ${activeChartType === type ? styles.activeChartType : ""}`}
                            onClick={() => setActiveChartType(type)}
                          >
                            <Icon size={14} /> {type}
                          </button>
                        );
                      })}
                  </div>
                  <div className={styles.chartWrapper}>
                    <StudentChartViewer
                      question={currentQuestion}
                      chartType={activeChartType}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.noVisuals}>
                  <p>No chart associated with this question.</p>
                </div>
              )}
            </div>

            {/* RIGHT: Question Text & Responses */}
            <div className={styles.rightPane}>
              <h3 className={styles.questionText}>
                {currentQuestion.question_text}
              </h3>

              <div className={styles.correctAnswerBox}>
                <CheckCircle2 size={18} color="var(--success-color)" />
                <span>
                  Correct Answer:{" "}
                  <strong>
                    {Array.isArray(currentQuestion.correct_answers)
                      ? currentQuestion.correct_answers.join(", ")
                      : currentQuestion.correct_answers}
                  </strong>
                </span>
              </div>

              <h4 className={styles.responsesHeading}>Student Responses</h4>

              <div className={styles.optionsList}>
                {optionKeys.length > 0 ? (
                  optionKeys.map((opt, i) => {
                    const group = responseGroups[opt] || {
                      count: 0,
                      students: [],
                    };
                    const count = group.count;
                    const percent =
                      totalResponsesForQ > 0
                        ? Math.round((count / totalResponsesForQ) * 100)
                        : 0;

                    const isCorrectChoice = Array.isArray(
                      currentQuestion.correct_answers,
                    )
                      ? currentQuestion.correct_answers.includes(opt)
                      : String(currentQuestion.correct_answers) === String(opt);

                    return (
                      <div
                        key={i}
                        className={`${styles.optionItem} ${isCorrectChoice ? styles.correctOption : ""}`}
                      >
                        <div className={styles.optionHeader}>
                          <span className={styles.optLabel}>{opt}</span>
                          <span className={styles.optCount}>
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{
                              width: `${percent}%`,
                              background: isCorrectChoice
                                ? "var(--success-color)"
                                : "var(--error-color)",
                            }}
                          />
                        </div>
                        {group.students.length > 0 && (
                          <div className={styles.studentList}>
                            {group.students.map((s) => (
                              <div
                                key={s._id}
                                className={styles.studentChip}
                                onClick={() => toggleRole(s._id)}
                              >
                                {s.display_name}
                                {revealedRoles[s._id] && (
                                  <span className={styles.revealedRole}>
                                    ({s.student_id})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className={styles.noResponsesYet}>
                    No responses to display.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResponsesModal;
