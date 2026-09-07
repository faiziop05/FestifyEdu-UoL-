import React from "react";
import { Plus, Search } from "lucide-react";
import styles from "../styles/pages_css/PremiumDashboard.module.css";

const ManagementHeader = ({ title, subtitle, searchTerm, onSearchChange, onAddClick, addButtonText = "Add New" }) => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerTitleBlock}>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className={styles.headerActionsBlock}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button
          onClick={onAddClick}
          className={styles.addButton}
        >
          <Plus size={18} />
          {addButtonText}
        </button>
      </div>
    </header>
  );
};

export default ManagementHeader;
