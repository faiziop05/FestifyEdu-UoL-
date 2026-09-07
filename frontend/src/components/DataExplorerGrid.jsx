import React from "react";
import { Loader2 } from "lucide-react";
import styles from "../styles/components_css/QuizBuilder.module.css";

const DataExplorerGrid = ({
  searchQuery,
  setSearchQuery,
  datasetData,
  allHeaders,
  selectedRows,
  toggleRow,
  selectAllVisible,
  handleScroll,
  isFetching,
  hideCheckboxes = false,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styles["qb-panel-header"]}>
        <div>
          <h2 className={styles["qb-title"]}>Data Explorer</h2>
          <p className={styles["qb-subtitle"]}>
            {hideCheckboxes ? "View and search through your dataset rows." : "Filter rows to dynamically update your analysis."}
          </p>
        </div>
        <div className={styles["qb-search-box"]}>
          <input
            type="text"
            placeholder="🔍 Search rows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles["qb-grid-wrapper"]} onScroll={handleScroll}>
        {datasetData.length > 0 ? (
          <table className={styles["qb-grid-table"]}>
            <thead>
              <tr>
                {!hideCheckboxes && (
                  <th className={styles["qb-grid-checkbox-col"]}>
                    <label className={styles["qb-toggle-pill"]}>
                      <input
                        type="checkbox"
                        checked={
                          datasetData.length > 0 &&
                          datasetData.every((row) =>
                            selectedRows.has(row._originalIndex),
                          )
                        }
                        onChange={selectAllVisible}
                      />
                      <span className={styles["qb-toggle-slider"]}></span>
                    </label>
                  </th>
                )}
                {allHeaders.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datasetData.map((row, idx) => {
                const origIndex = row._originalIndex ?? idx;
                const isSelected = !hideCheckboxes && selectedRows && selectedRows.has(origIndex);
                return (
                  <tr
                    key={origIndex}
                    className={`${styles["qb-grid-row"]} ${
                      isSelected ? styles["selected"] : ""
                    }`}
                    onClick={() => !hideCheckboxes && toggleRow && toggleRow(origIndex)}
                    style={{ cursor: hideCheckboxes ? "default" : "pointer" }}
                  >
                    {!hideCheckboxes && (
                      <td
                        className={styles["qb-grid-checkbox-col"]}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className={styles["qb-toggle-pill"]}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow && toggleRow(origIndex)}
                          />
                          <span className={styles["qb-toggle-slider"]}></span>
                        </label>
                      </td>
                    )}
                    {allHeaders.map((header) => (
                      <td key={`${origIndex}-${header}`}>{row[header]}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles["qb-no-results"]}>
            {isFetching ? "Loading..." : "No data available."}
          </div>
        )}
        {isFetching && datasetData.length > 0 && (
          <div style={{ textAlign: "center", padding: "16px" }}>
            <Loader2 className={styles.spin} /> Loading more...
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExplorerGrid;
