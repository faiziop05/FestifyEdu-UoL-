import React from "react";
import { PlusCircle, Database, Download } from "lucide-react";
import { useSelector } from "react-redux";
import styles from "../styles/pages_css/newQuiz.module.css";

const DatasetSelectorView = ({
  activeQuestionData,
  handleAddNewQuestion,
  setIsImportModalOpen,
  datasets,
  selectedDataset,
  setSelectedDataset,
  selectedSheetName,
  setSelectedSheetName,
  activeDs,
  handleUpdateActiveQuestionDataset,
  handleUpdateActiveQuestionSheet,
}) => {
  const { user } = useSelector((state) => state.auth);

  if (!activeQuestionData) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <PlusCircle size={48} />
        </div>
        <h2>No question selected</h2>
        <p>
          Select a question from the sidebar or add a new one to start building.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={styles.primaryBtn} onClick={handleAddNewQuestion}>
            Create First Question
          </button>
          <button
            className={styles.primaryBtn}
            style={{ backgroundColor: "#4f46e5" }}
            onClick={() => setIsImportModalOpen(true)}
          >
            <Download size={18} style={{ marginRight: "8px" }} />
            Import from Existing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <Database size={48} />
      </div>
      <h2>Select a Dataset</h2>
      <p>Choose an Excel file and a specific sheet to build your quiz from.</p>
      <div className={styles.datasetSelectorWrapper}>
        <select
          className={styles.datasetSelect}
          onChange={(e) => {
            const ds = datasets.find((d) => d._id === e.target.value);
            if (activeQuestionData) {
              handleUpdateActiveQuestionDataset(e.target.value);
            } else {
              setSelectedDataset(ds);
              setSelectedSheetName("");
            }
          }}
          value={activeQuestionData.datasetId || selectedDataset?._id || ""}
        >
          <option value="" disabled>
            -- Choose an Excel File --
          </option>
          {datasets.map((ds) => {
            const sheetsArray = ds.sheets || Object.keys(ds.parsed_data || {});
            const isShared = ds.teacher_id !== user?._id;
            return (
              <option key={ds._id} value={ds._id}>
                {ds.title} ({sheetsArray.length} sheets)
                {isShared ? " [Shared]" : ""}
              </option>
            );
          })}
        </select>

        {(activeQuestionData.datasetId || selectedDataset) && (
          <select
            className={styles.datasetSelect}
            style={{ marginTop: "16px" }}
            onChange={(e) => {
              if (activeQuestionData) {
                handleUpdateActiveQuestionSheet(e.target.value);
              } else {
                setSelectedSheetName(e.target.value);
              }
            }}
            value={activeQuestionData.sheetName || selectedSheetName || ""}
          >
            <option value="" disabled>
              -- Choose a Sheet --
            </option>
            {(
              activeDs?.sheets ||
              Object.keys(activeDs?.parsed_data || {}) ||
              []
            ).map((sheet) => (
              <option key={sheet} value={sheet}>
                {sheet}
              </option>
            ))}
          </select>
        )}
      </div>
      {datasets.length === 0 && (
        <p className={styles.warningText}>
          No datasets found! Please go to Data Hub to import data.
        </p>
      )}
    </div>
  );
};

export default DatasetSelectorView;
