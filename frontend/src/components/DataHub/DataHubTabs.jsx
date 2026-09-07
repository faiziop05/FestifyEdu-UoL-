import React from "react";
import { Database, Shield } from "lucide-react";

const DataHubTabs = ({ user, activeTab, setActiveTab }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "1.5rem",
        paddingBottom: "0.5rem",
        flexWrap: "wrap"
      }}
    >
      <button
        onClick={() => setActiveTab("datasets")}
        style={{
          padding: "0.5rem 1rem",
          background: "none",
          border: "none",
          borderBottom:
            activeTab === "datasets"
              ? "2px solid var(--brand-primary)"
              : "2px solid transparent",
          color:
            activeTab === "datasets"
              ? "var(--brand-primary)"
              : "var(--text-secondary)",
          fontWeight: activeTab === "datasets" ? "600" : "400",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "1rem",
        }}
      >
        <Database size={18} /> My Datasets
      </button>

      {(user?.role === "admin" || user?.role === "super_admin") && (
        <button
          onClick={() => setActiveTab("access")}
          style={{
            padding: "0.5rem 1rem",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "access"
                ? "2px solid var(--brand-primary)"
                : "2px solid transparent",
            color:
              activeTab === "access"
                ? "var(--brand-primary)"
                : "var(--text-secondary)",
            fontWeight: activeTab === "access" ? "600" : "400",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1rem",
          }}
        >
          <Shield size={18} /> Data Access
        </button>
      )}
    </div>
  );
};

export default DataHubTabs;
