import React from "react";
import styles from "../styles/components_css/QuizSidebar.module.css";
import {
  Menu,
  PlusCircle,
  Download,
  GripVertical,
  Trash2,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  PanelLeftOpen,
} from "lucide-react";

export default function QuizSidebar({
  questions,
  activeIndex,
  setActiveIndex,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  handleAddNewQuestion,
  setIsImportModalOpen,
  draggedIndex,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDeleteQuestion,
}) {
  return (
    <div
      className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        {!isSidebarCollapsed && <h3>Batch Questions</h3>}
        {isSidebarCollapsed && (
          <h3 className={styles.collapsedBadge}>{questions.length}</h3>
        )}
        <button
          className={styles.toggleSidebarBtn}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>
      </div>

      <div className={styles.addQuestionWrapper}>
        <button
          className={styles.addQuestionBtn}
          onClick={handleAddNewQuestion}
          title={isSidebarCollapsed ? "Add New Question" : ""}
        >
          <PlusCircle size={18} />
          {!isSidebarCollapsed && "Add Question"}
        </button>

        <button
          className={`${styles.addQuestionBtn} ${styles.importBtn}`}
          onClick={() => setIsImportModalOpen(true)}
          title={isSidebarCollapsed ? "Import Question" : ""}
        >
          <Download size={18} />
          {!isSidebarCollapsed && "Import"}
        </button>
      </div>

      {!isSidebarCollapsed && (
        <div className={styles.sidebarStats}>
          <span>{questions.length} Questions</span>
        </div>
      )}

      <div className={styles.questionList}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className={`${styles.questionItem} ${activeIndex === idx ? styles.active : ""} ${draggedIndex === idx ? styles.dragging : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onClick={() => setActiveIndex(idx)}
            title={isSidebarCollapsed ? q.questionText || "Empty Question" : ""}
          >
            {!isSidebarCollapsed && (
              <GripVertical size={16} className={styles.dragHandle} />
            )}
            <div className={styles.questionIndex}>{idx + 1}</div>

            {!isSidebarCollapsed && (
              <div className={styles.questionPreview}>
                <p className={styles.qText}>
                  {q.questionText ? q.questionText : <i>Empty Question...</i>}
                </p>
                <span className={styles.qType}>
                  {q.questionType.toUpperCase()}
                </span>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button
                className={styles.deleteQuestionBtn}
                onClick={(e) => handleDeleteQuestion(e, idx)}
                title="Delete Question"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
