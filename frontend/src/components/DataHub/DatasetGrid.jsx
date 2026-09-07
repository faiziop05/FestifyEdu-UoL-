import React from "react";
import { Database, FileSpreadsheet, Download, Trash2, Loader2 } from "lucide-react";
import styles from "../../styles/pages_css/DataHub.module.css";

const DatasetGrid = ({
  title,
  datasets,
  loading,
  emptyMessage,
  showDelete,
  handleExportExcel,
  handleDeleteDataset,
  onDatasetClick,
}) => {
  return (
    <>
      <h2
        style={{
          marginTop: title === "Shared With You" ? "2.5rem" : "1.5rem",
          marginBottom: "1rem",
          fontSize: "1.25rem",
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      <div className={styles.datasetGrid}>
        {loading ? (
          <div className={styles.loader}>
            <Loader2 className={styles.spin} size={32} />
          </div>
        ) : datasets.length === 0 ? (
          <div className={styles.emptyState}>
            <Database size={48} className={styles.emptyIcon} />
            <h3>{emptyMessage.title}</h3>
            <p>{emptyMessage.description}</p>
          </div>
        ) : (
          datasets.map((ds) => (
            <div 
              key={ds._id} 
              className={styles.datasetCard}
              onClick={() => onDatasetClick && onDatasetClick(ds)}
              style={{ cursor: onDatasetClick ? "pointer" : "default" }}
            >
              <div className={styles.cardHeader}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileSpreadsheet size={24} className={styles.fileIcon} />
                  <h3 className={styles.cardTitle}>{ds.title}</h3>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportExcel(ds);
                    }}
                    className={styles.exportBtn}
                    title="Export to Excel"
                  >
                    <Download size={18} />
                  </button>
                  {showDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDataset(ds._id);
                      }}
                      className={styles.deleteBtn}
                      title="Delete Dataset"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className={styles.cardBody}>
                <p>
                  <strong>Sheets:</strong> {(ds.sheets || []).length}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={styles.statusBadge}>{ds.status}</span>
                </p>
                <p className={styles.dateText}>
                  Imported on: {new Date(ds.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default DatasetGrid;
