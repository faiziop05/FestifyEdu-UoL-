import React from "react";
import { Search } from "lucide-react";
import styles from "../../styles/components_css/StudentPerformance/PerformanceSearch.module.css";

const PerformanceSearch = ({ searchTerm, setSearchTerm, setCurrentPage }) => {
  return (
    <div className={styles.tableControls}>
      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search roll number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>
    </div>
  );
};

export default PerformanceSearch;
