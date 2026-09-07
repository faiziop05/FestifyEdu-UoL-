import React from "react";
import styles from "../styles/components_css/DataTable.module.css";

const StatusBadge = ({ status, type = "status" }) => {
  if (type === "role") {
    return <span className={`${styles.badge} ${styles.badgeRole}`}>{status}</span>;
  }
  
  const isActive = status === "active" || status === "true" || status === true;
  return (
    <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

export default StatusBadge;
