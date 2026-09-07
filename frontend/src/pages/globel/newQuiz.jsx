import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/pages_css/newQuiz.module.css";
import QuizBuilder from "../../components/QuizBuilder";
import QuizTopBar from "../../components/QuizTopBar";
import QuizSidebar from "../../components/QuizSidebar";
import QuizImportModal from "../../components/QuizImportModal";
import DatasetSelectorView from "../../components/DatasetSelectorView";
import { Database } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetDatasetsQuery } from "../../redux/api/datasetApiSlice";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByIdQuery,
  useGetQuizzesByTeacherQuery,
} from "../../redux/api/quizApiSlice";

function NewQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [quizName, setQuizName] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: existingQuiz } = useGetQuizByIdQuery(quizId, { skip: !quizId });
  const hasPopulated = React.useRef(false);

  const { data: datasetsData } = useGetDatasetsQuery(user?._id, {
    skip: !user?._id,
  });
  const baseDatasets = datasetsData?.datasets || [];

  const [sharedDataset, setSharedDataset] = useState(null);
  const datasets = React.useMemo(() => {
    if (
      sharedDataset &&
      !baseDatasets.find((d) => d._id === sharedDataset._id)
    ) {
      return [...baseDatasets, sharedDataset];
    }
    return baseDatasets;
  }, [baseDatasets, sharedDataset]);

  const [selectedDataset, setSelectedDataset] = useState(null);
  const [selectedSheetName, setSelectedSheetName] = useState("");

  const [draggedIndex, setDraggedIndex] = useState(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportQuizId, setSelectedImportQuizId] = useState("");
  const [selectedImportQuestions, setSelectedImportQuestions] = useState([]);

  const { data: teacherQuizzesData } = useGetQuizzesByTeacherQuery(user?._id, {
    skip: !user?._id,
  });
  const teacherQuizzes = teacherQuizzesData || [];

  const [createQuiz] = useCreateQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();

  React.useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  React.useEffect(() => {
    if (!hasUnsavedChanges) return;

    window.history.pushState(null, "", window.location.href);

    const handlePopState = (e) => {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave without saving?",
        )
      ) {
        setHasUnsavedChanges(false);
        window.history.back();
      } else {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  React.useEffect(() => {
    if (existingQuiz && existingQuiz.questions && !hasPopulated.current) {
      hasPopulated.current = true;
      setQuizName(existingQuiz.name);

      const loadedQuestions = existingQuiz.questions.map((q) => ({
        id: q._id || Date.now() + Math.random(),
        datasetId: q.dataset_id?._id || q.dataset_id,
        sheetName: q.sheet_name,
        selectedRows: q.selectedRows,
        axisX: q.axisX,
        axisY: q.axisY,
        axisR: q.axisR,
        chartType: q.chartType,
        groupBy: q.groupBy || "",
        aggregation: q.aggregation || "Count",
        allowedCharts: q.allowedCharts || [
          "Bar",
          "HorizontalBar",
          "Line",
          "Area",
          "Pie",
          "Doughnut",
          "Radar",
          "PolarArea",
          "Scatter",
          "Bubble",
        ],
        isGrouped: !!q.groupBy,
        questionText: q.question_text,
        questionType: q.question_type,
        correctAnswer:
          q.question_type !== "mcq" && q.question_type !== "choose_one"
            ? q.correct_answers?.[0] || ""
            : "",
        options:
          q.question_type === "mcq" || q.question_type === "choose_one"
            ? q.options?.map((o) => ({
                value: o.option,
                isCorrect: o.is_correct,
              })) || []
            : [],
        isDraft: false,
      }));

      setQuestions(loadedQuestions);

      if (loadedQuestions.length > 0) {
        const firstOriginalQ = existingQuiz.questions[0];
        // Use the populated dataset object from the quiz itself
        const ds =
          typeof firstOriginalQ.dataset_id === "object"
            ? firstOriginalQ.dataset_id
            : datasets.find((d) => d._id === firstOriginalQ.dataset_id);
        if (ds) {
          setSharedDataset(ds);
          setSelectedDataset(ds);
          setSelectedSheetName(firstOriginalQ.sheet_name || "");
        }
        setActiveIndex(0);
      }
    }
  }, [existingQuiz, datasets]);

  const handleAddNewQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      isDraft: true,
      questionText: "",
      questionType: "mcq",
      options: [
        { value: "", isCorrect: false },
        { value: "", isCorrect: false },
      ],
      correctAnswer: "",
      axisX: "",
      axisY: "",
      axisR: "",
      chartType: "Bar",
      datasetId: selectedDataset?._id || "",
      sheetName: selectedSheetName,
    };
    setQuestions([...questions, newQuestion]);
    setHasUnsavedChanges(true);
    setActiveIndex(questions.length);
  };

  const handleImportQuestions = () => {
    const quiz = teacherQuizzes.find((q) => q._id === selectedImportQuizId);
    if (!quiz) return;

    const selectedQList = quiz.questions.filter((q) =>
      selectedImportQuestions.includes(q._id),
    );
    if (selectedQList.length === 0) return;

    const importedQuestions = selectedQList.map((q, idx) => ({
      id: Date.now() + Math.random() + idx,
      datasetId: q.dataset_id?._id || q.dataset_id,
      sheetName: q.sheet_name,
      selectedRows: q.selectedRows,
      axisX: q.axisX,
      axisY: q.axisY,
      axisR: q.axisR,
      chartType: q.chartType,
      groupBy: q.groupBy || "",
      aggregation: q.aggregation || "Count",
      allowedCharts: q.allowedCharts || [
        "Bar",
        "HorizontalBar",
        "Line",
        "Area",
        "Pie",
        "Doughnut",
        "Radar",
        "PolarArea",
        "Scatter",
        "Bubble",
      ],
      isGrouped: !!q.groupBy,
      questionText: q.question_text,
      questionType: q.question_type,
      correctAnswer:
        q.question_type !== "mcq" && q.question_type !== "choose_one"
          ? q.correct_answers?.[0] || ""
          : "",
      options:
        q.question_type === "mcq" || q.question_type === "choose_one"
          ? q.options?.map((o) => ({
              value: o.option,
              isCorrect: o.is_correct,
            })) || []
          : [],
      isDraft: false,
    }));

    setQuestions([...questions, ...importedQuestions]);
    setHasUnsavedChanges(true);
    setActiveIndex(questions.length);
    setIsImportModalOpen(false);
    setSelectedImportQuizId("");
    setSelectedImportQuestions([]);
  };

  const handleDeleteQuestion = (e, indexToRemove) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    const updatedQuestions = questions.filter(
      (_, idx) => idx !== indexToRemove,
    );
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);

    if (activeIndex === indexToRemove) {
      setActiveIndex(-1);
    } else if (activeIndex > indexToRemove) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.parentNode);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newQuestions = [...questions];
    const draggedQuestion = newQuestions[draggedIndex];

    newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(index, 0, draggedQuestion);

    setQuestions(newQuestions);
    setHasUnsavedChanges(true);

    if (draggedIndex === activeIndex) {
      setActiveIndex(index);
    } else if (activeIndex > draggedIndex && activeIndex <= index) {
      setActiveIndex(activeIndex - 1);
    } else if (activeIndex < draggedIndex && activeIndex >= index) {
      setActiveIndex(activeIndex + 1);
    }

    setDraggedIndex(null);
  };

  const handleSaveQuestion = (updatedQuestionData) => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = {
      ...updatedQuestions[activeIndex],
      ...updatedQuestionData,
      isDraft: false,
    };
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
    setActiveIndex(-1);
  };

  const activeQuestionData = activeIndex >= 0 ? questions[activeIndex] : null;

  const handleUpdateActiveQuestionDataset = (datasetId) => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = {
      ...updatedQuestions[activeIndex],
      datasetId: datasetId,
      sheetName: "",
    };
    setQuestions(updatedQuestions);
  };

  const handleUpdateActiveQuestionSheet = (sheetName) => {
    const updatedQuestions = [...questions];
    updatedQuestions[activeIndex] = {
      ...updatedQuestions[activeIndex],
      sheetName: sheetName,
    };
    setQuestions(updatedQuestions);
  };

  const activeDs = datasets.find(
    (d) => d._id === (activeQuestionData?.datasetId || selectedDataset?._id),
  );

  const handlePublishQuiz = async (status) => {
    if (!quizName) {
      alert("Please enter a quiz name");
      return;
    }

    if (status === "published" && questions.some((q) => q.isDraft)) {
      alert("Please save all question configurations before publishing.");
      return;
    }

    const validQuestions = questions.filter((q) => !q.isDraft);

    if (status === "published" && validQuestions.length === 0) {
      alert("Please add at least one configured question to publish the quiz.");
      return;
    }

    try {
      const formattedQuestions = validQuestions.map((q) => ({
        dataset_id: q.datasetId,
        sheet_name: q.sheetName,
        selectedRows: q.selectedRows,
        axisX: q.axisX,
        axisY: q.axisY,
        axisR: q.axisR,
        chartType: q.chartType,
        groupBy: q.isGrouped ? q.groupBy || "" : "",
        aggregation: q.isGrouped ? q.aggregation || "Count" : "Count",
        allowedCharts: q.allowedCharts || [
          "Bar",
          "HorizontalBar",
          "Line",
          "Area",
          "Pie",
          "Doughnut",
          "Radar",
          "PolarArea",
          "Scatter",
          "Bubble",
        ],
        question_text: q.questionText,
        question_type: q.questionType,
        options:
          q.questionType === "mcq" || q.questionType === "choose_one"
            ? q.options?.map((opt) => ({
                option: typeof opt === "object" ? opt.value || opt.option : opt,
                is_correct:
                  typeof opt === "object"
                    ? opt.isCorrect || opt.is_correct
                    : opt === q.correctAnswer,
              })) || []
            : [],
        correct_answers:
          q.questionType === "mcq" || q.questionType === "choose_one"
            ? q.options
                ?.filter((opt) =>
                  typeof opt === "object"
                    ? opt.isCorrect || opt.is_correct
                    : opt === q.correctAnswer,
                )
                .map((opt) =>
                  typeof opt === "object" ? opt.value || opt.option : opt,
                ) || []
            : [q.correctAnswer].filter(Boolean),
      }));

      const payload = {
        teacher_id: user._id,
        name: quizName,
        status: status,
        questions: formattedQuestions,
      };

      if (quizId) {
        await updateQuiz({ id: quizId, ...payload }).unwrap();
      } else {
        await createQuiz(payload).unwrap();
      }

      const getRedirectPath = (path) => {
        if (user?.role === "super_admin") return `/super-admin/${path}`;
        if (user?.role === "admin") return `/admin/${path}`;
        return `/teacher/${path}`;
      };

      setHasUnsavedChanges(false);
      alert(
        `Quiz ${status === "draft" ? "saved as draft" : "published"} successfully!`,
      );
      navigate(getRedirectPath("quiz-builder"));
    } catch (error) {
      console.error("Error publishing quiz:", error);
      alert("An error occurred while publishing.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <QuizSidebar
        questions={questions}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        handleAddNewQuestion={handleAddNewQuestion}
        setIsImportModalOpen={setIsImportModalOpen}
        draggedIndex={draggedIndex}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleDeleteQuestion={handleDeleteQuestion}
      />

      <div className={styles.contentWrapper}>
        <QuizTopBar
          quizId={quizId}
          quizName={quizName}
          setQuizName={setQuizName}
          hasUnsavedChanges={hasUnsavedChanges}
          setHasUnsavedChanges={setHasUnsavedChanges}
          handlePublishQuiz={handlePublishQuiz}
        />

        <div className={styles.container}>
          <div className={styles.mainArea}>
            {!activeQuestionData ||
            !(activeQuestionData.datasetId || selectedDataset) ||
            !(activeQuestionData.sheetName || selectedSheetName) ? (
              <DatasetSelectorView
                activeQuestionData={activeQuestionData}
                handleAddNewQuestion={handleAddNewQuestion}
                setIsImportModalOpen={setIsImportModalOpen}
                datasets={datasets}
                selectedDataset={selectedDataset}
                setSelectedDataset={setSelectedDataset}
                selectedSheetName={selectedSheetName}
                setSelectedSheetName={setSelectedSheetName}
                activeDs={activeDs}
                handleUpdateActiveQuestionDataset={
                  handleUpdateActiveQuestionDataset
                }
                handleUpdateActiveQuestionSheet={
                  handleUpdateActiveQuestionSheet
                }
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                {/* Per-Question Dataset Selector */}
                <div className={styles.perQuestionDatasetBar}>
                  <Database
                    size={16}
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Data for this question:
                  </span>
                  <select
                    className={styles.datasetSelectSmall}
                    value={
                      activeQuestionData.datasetId || selectedDataset?._id || ""
                    }
                    onChange={(e) =>
                      handleUpdateActiveQuestionDataset(e.target.value)
                    }
                  >
                    <option value="" disabled>
                      -- File --
                    </option>
                    {datasets.map((ds) => (
                      <option key={ds._id} value={ds._id}>
                        {ds.title}
                      </option>
                    ))}
                  </select>

                  {activeDs && (
                    <select
                      className={styles.datasetSelectSmall}
                      value={
                        activeQuestionData.sheetName || selectedSheetName || ""
                      }
                      onChange={(e) =>
                        handleUpdateActiveQuestionSheet(e.target.value)
                      }
                    >
                      <option value="" disabled>
                        -- Sheet --
                      </option>
                      {(
                        activeDs.sheets ||
                        Object.keys(activeDs.parsed_data || {})
                      ).map((sheet) => (
                        <option key={sheet} value={sheet}>
                          {sheet}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <QuizBuilder
                  key={activeQuestionData.id} // Forces remount when switching questions
                  initialData={activeQuestionData}
                  datasetId={
                    activeQuestionData.datasetId || selectedDataset?._id
                  }
                  sheetName={activeQuestionData.sheetName || selectedSheetName}
                  onSave={handleSaveQuestion}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <QuizImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        teacherQuizzes={teacherQuizzes.filter((q) => q._id !== quizId)}
        selectedImportQuizId={selectedImportQuizId}
        setSelectedImportQuizId={setSelectedImportQuizId}
        selectedImportQuestions={selectedImportQuestions}
        setSelectedImportQuestions={setSelectedImportQuestions}
        handleImportQuestions={handleImportQuestions}
      />
    </div>
  );
}

export default NewQuiz;
