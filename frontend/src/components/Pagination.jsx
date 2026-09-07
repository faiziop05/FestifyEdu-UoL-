import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1.5rem",
      padding: "1rem",
      background: "var(--bg-surface)",
      border: "1px solid var(--border-color)",
      borderRadius: "16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
    }}>
      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: "500" }}>
        Page <span style={{ color: "var(--text-primary)", fontWeight: "700" }}>{page}</span> of {totalPages}
      </span>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px", borderRadius: "10px",
            border: "1px solid var(--border-color)",
            background: page === 1 ? "var(--bg-elevated)" : "var(--bg-surface)",
            color: page === 1 ? "var(--text-secondary)" : "var(--text-primary)",
            cursor: page === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px", borderRadius: "10px",
            border: "1px solid var(--border-color)",
            background: page === totalPages ? "var(--bg-elevated)" : "var(--bg-surface)",
            color: page === totalPages ? "var(--text-secondary)" : "var(--text-primary)",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
