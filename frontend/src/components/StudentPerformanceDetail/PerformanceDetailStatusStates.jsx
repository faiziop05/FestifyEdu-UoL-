import React from "react";
import { FileQuestion } from "lucide-react";
import styles from "../../styles/components_css/StudentPerformanceDetail/PerformanceDetailStatusStates.module.css";

export const PerformanceDetailLoadingState = () => (
  <div className={styles.emptyState}>
    <p>Loading student details...</p>
  </div>
);

export const PerformanceDetailErrorState = ({ refetch }) => (
  <div className={styles.emptyState}>
    <p>Failed to load student details. Please try again.</p>
    <button
      onClick={refetch}
      style={{
        marginTop: "12px",
        padding: "8px 16px",
        cursor: "pointer",
      }}
    >
      Retry
    </button>
  </div>
);

export const PerformanceDetailEmptyState = () => (
  <div className={styles.emptyState}>
    <FileQuestion size={48} color="var(--text-light-gray)" />
    <h3>No Sessions Found</h3>
    <p>This student has not attended any of your sessions.</p>
  </div>
);
