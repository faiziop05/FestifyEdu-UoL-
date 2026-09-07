import React from "react";
import { Users } from "lucide-react";
import styles from "../../styles/components_css/StudentPerformance/PerformanceStatusStates.module.css";

export const PerformanceLoadingState = () => (
  <div className={styles.emptyState}>
    <p>Loading performance data...</p>
  </div>
);

export const PerformanceErrorState = ({ refetch }) => (
  <div className={styles.emptyState}>
    <p>Failed to load student performance. Please try again.</p>
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

export const PerformanceEmptyState = () => (
  <div className={styles.emptyState}>
    <Users size={48} color="var(--text-light-gray)" />
    <h3>No Student Data Yet</h3>
    <p>
      Once students join your sessions and take quizzes, their
      performance metrics will appear here.
    </p>
  </div>
);
