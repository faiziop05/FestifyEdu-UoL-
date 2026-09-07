import React from "react";
import { Loader2 } from "lucide-react";
import styles from "../styles/components_css/DataTable.module.css";

const DataTable = ({ columns, data, isLoading, emptyMessage = "No data found", renderRow }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {columns.map((col, idx) => {
              const isLast = idx === columns.length - 1;
              const align = col.align || (isLast ? "right" : "left");
              return (
                <th key={idx} style={{ textAlign: align }}>
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className={styles.emptyState}>
                  <Loader2 className="spin" size={32} style={{ color: "var(--brand-primary)", marginBottom: "1rem" }} />
                  <p>Loading...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <div className={styles.emptyState}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem auto"
                  }}>
                    <span style={{ fontSize: "24px" }}>📋</span>
                  </div>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
