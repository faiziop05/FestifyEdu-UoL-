import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Shield,
  Settings,
  X,
  BookOpen,
  Building,
  Users,
  Check,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Database,
} from "lucide-react";
import pageStyles from "../styles/pages_css/PremiumDashboard.module.css";
import tableStyles from "../styles/components_css/DataTable.module.css";
import formStyles from "../styles/components_css/SideForm.module.css";

const SharedDataAccess = ({
  quizzes,
  datasets,
  quizzesTotalPages,
  datasetsTotalPages,
  isLoadingQuizzes,
  isLoadingDatasets,
  tableSearch,
  setTableSearch,
  tablePage,
  setTablePage,
  entities,
  isFetchingEntities,
  entitySearch,
  setEntitySearch,
  entityPage,
  setEntityPage,
  onUpdateQuizAccess,
  onUpdateDatasetAccess,
  entityName, // "Teachers" or "Organizations"
  entityKey, // "allowed_entities" or "allowed_organizations"
  roleDescription, // Optional text to describe role capability
}) => {
  const [activeTab, setActiveTab] = useState("quizzes"); // "quizzes" | "datasets"

  const [editingItem, setEditingItem] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState([]);

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      access_type: "selected",
    },
  });

  const accessType = watch("access_type");

  const handleEditClick = (item) => {
    setEditingItem(item);
    reset({
      access_type: item.access_type || "selected",
    });
    const rawList = item[entityKey];
    const rawAllowed = Array.isArray(rawList) ? rawList : [];
    setSelectedEntities(
      rawAllowed.map((ent) =>
        typeof ent === "object" && ent !== null ? String(ent._id) : String(ent),
      ),
    );
  };

  const toggleEntity = (entityId) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId],
    );
  };

  const handleSelectAll = () => {
    setSelectedEntities(entities.map((entity) => String(entity._id)));
  };

  const handleClearAll = () => {
    setSelectedEntities([]);
  };

  const onSubmit = async (data) => {
    try {
      if (activeTab === "quizzes") {
        await onUpdateQuizAccess({
          quizId: editingItem._id,
          access_type: data.access_type,
          [entityKey]: data.access_type === "selected" ? selectedEntities : [],
        });
      } else {
        await onUpdateDatasetAccess({
          datasetId: editingItem._id,
          access_type: data.access_type,
          [entityKey]: data.access_type === "selected" ? selectedEntities : [],
        });
      }

      alert("Access updated successfully!");
      setEditingItem(null);
      reset();
    } catch (err) {
      alert(err.data?.message || "Failed to update access");
    }
  };

  const renderTable = (rawItems, isLoading, itemType) => {
    const items =
      itemType === "quizzes"
        ? rawItems.filter((item) => item.status === "published")
        : rawItems;
    return (
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.tableHead}>
            <tr>
              <th style={{ width: "40%", textAlign: "left" }}>
                {itemType === "quizzes" ? "Quiz Name" : "Dataset Name"}
              </th>
              <th style={{ width: "15%", textAlign: "left" }}>Status</th>
              <th style={{ width: "25%", textAlign: "left" }}>Access Level</th>
              <th style={{ width: "20%", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4">
                  <div className={tableStyles.emptyState}>
                    Loading {itemType}...
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {items.map((item) => {
                  const rawList = item[entityKey];
                  const allowedList = Array.isArray(rawList) ? rawList : [];

                  // Only count allowed items that are actually in the user's visible entities list
                  const allowedCount =
                    entities !== undefined
                      ? allowedList.filter((a) => {
                          const aId =
                            typeof a === "object" && a !== null
                              ? String(a._id)
                              : String(a);
                          return entities.some((e) => String(e._id) === aId);
                        }).length
                      : allowedList.length;

                  return (
                    <tr key={item._id} className={tableStyles.tableRow}>
                      <td className={tableStyles.tableCell}>
                        <div
                          style={{
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {itemType === "quizzes" ? (
                            <BookOpen
                              size={16}
                              style={{ color: "var(--brand-primary)" }}
                            />
                          ) : (
                            <Database
                              size={16}
                              style={{ color: "var(--brand-primary)" }}
                            />
                          )}
                          {item.name || item.title}
                        </div>
                      </td>
                      <td className={tableStyles.tableCell}>
                        <span
                          className={`${tableStyles.badge} ${item.status === "published" || item.status === "parsed" ? tableStyles.badgeRole : tableStyles.badgeInactive}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className={tableStyles.tableCellSecondary}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {item.access_type === "selected" ? (
                            <>
                              <Building size={16} />
                              {allowedCount} {entityName || "Entities"} Allowed
                            </>
                          ) : (
                            <>
                              <Globe size={16} />
                              All {entityName || "Entities"}
                            </>
                          )}
                        </div>
                      </td>
                      <td className={tableStyles.tableCell}>
                        <div
                          className={tableStyles.actionGroup}
                          style={{ justifyContent: "flex-end" }}
                        >
                          <button
                            onClick={() => handleEditClick(item)}
                            className={tableStyles.primaryActionBtn}
                            style={{
                              background: "var(--bg-elevated)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border-color)",
                            }}
                            title="Edit Access Rules"
                          >
                            <Settings size={18} />
                            Edit Access
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: 0 }}>
                      <div className={tableStyles.emptyState}>
                        <div
                          style={{
                            padding: "1rem",
                            background: "var(--bg-elevated)",
                            borderRadius: "50%",
                            marginBottom: "1rem",
                          }}
                        >
                          {itemType === "quizzes" ? (
                            <BookOpen
                              size={32}
                              style={{ color: "var(--brand-primary)" }}
                            />
                          ) : (
                            <Database
                              size={32}
                              style={{ color: "var(--brand-primary)" }}
                            />
                          )}
                        </div>
                        <h3>No {itemType} found</h3>
                        <p
                          style={{
                            maxWidth: "400px",
                            margin: "0 auto",
                            lineHeight: "1.5",
                          }}
                        >
                          There are currently no {itemType} on the platform to
                          manage access for. You can create new {itemType} in
                          the{" "}
                          {itemType === "quizzes" ? "Quiz Builder" : "Data Hub"}
                          .
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className={pageStyles.dashboardContainer}
      style={{ margin: 0, maxWidth: "100%", width: "100%" }}
    >
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            setActiveTab("quizzes");
            setEditingItem(null);
            setTableSearch("");
            setTablePage(1);
          }}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            background:
              activeTab === "quizzes"
                ? "var(--brand-primary)"
                : "var(--bg-surface)",
            color:
              activeTab === "quizzes"
                ? "var(--text-white)"
                : "var(--text-primary)",
            border:
              activeTab === "quizzes"
                ? "none"
                : "1px solid var(--border-color)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Quizzes Access
        </button>
        <button
          onClick={() => {
            setActiveTab("datasets");
            setEditingItem(null);
            setTableSearch("");
            setTablePage(1);
          }}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            background:
              activeTab === "datasets"
                ? "var(--brand-primary)"
                : "var(--bg-surface)",
            color:
              activeTab === "datasets"
                ? "var(--text-white)"
                : "var(--text-primary)",
            border:
              activeTab === "datasets"
                ? "none"
                : "1px solid var(--border-color)",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Datasets Access
        </button>
      </div>

      {editingItem && (
        <div
          className={formStyles.formContainer}
          style={{
            marginBottom: "2.5rem",
            borderTop: "4px solid var(--brand-primary)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            transform: "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            className={formStyles.formHeader}
            style={{ marginBottom: "1.5rem", paddingBottom: "1.25rem" }}
          >
            <div>
              <h2
                className={formStyles.formTitle}
                style={{
                  fontSize: "1.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <Shield size={24} style={{ color: "var(--brand-primary)" }} />
                Manage Access: {editingItem.name || editingItem.title}
              </h2>
              <p
                className={formStyles.formSubtitle}
                style={{ fontSize: "1rem", marginTop: "0.5rem" }}
              >
                Configure visibility and restrict who can access this{" "}
                {activeTab === "quizzes" ? "quiz" : "dataset"}.
              </p>
            </div>
            <button
              className={formStyles.closeButton}
              onClick={() => setEditingItem(null)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={formStyles.formGrid}>
              <div
                className={`${formStyles.inputGroup} ${formStyles.fullWidth}`}
              >
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  Access Level
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    {...register("access_type")}
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      fontSize: "1rem",
                      appearance: "none",
                      outline: "none",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <option value="all">
                      🌐 All {entityName || "Teachers"} (Public)
                    </option>
                    <option value="selected">
                      🏢 Specific {entityName || "Teachers"} (Private)
                    </option>
                  </select>
                  <div
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {accessType === "selected" && (
                <div
                  className={`${formStyles.inputGroup} ${formStyles.fullWidth}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <label style={{ margin: 0 }}>
                      Select Allowed {entityName || "Teachers"}
                    </label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <span
                        onClick={handleSelectAll}
                        style={{
                          color: "var(--brand-primary)",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Select All
                      </span>
                      <span
                        onClick={handleClearAll}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          fontWeight: "600",
                        }}
                      >
                        Clear
                      </span>
                    </div>
                  </div>

                  <div style={{ position: "relative", marginBottom: "1rem" }}>
                    <Search
                      size={18}
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-secondary)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search entities by name or email..."
                      value={entitySearch}
                      onChange={(e) => setEntitySearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.5rem 1rem 0.5rem 2.5rem",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-surface)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "16px",
                      padding: "1rem",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    {isFetchingEntities ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "var(--text-secondary)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Loader2 size={18} /> Searching...
                      </div>
                    ) : entities.length === 0 ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          color: "var(--text-secondary)",
                        }}
                      >
                        No entities found matching your criteria.
                      </div>
                    ) : (
                      <>
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                          {entities.map((entity) => (
                            <div
                              key={entity._id}
                              onClick={() => toggleEntity(entity._id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                borderRadius: "12px",
                                cursor: "pointer",
                                background: selectedEntities.includes(
                                  entity._id,
                                )
                                  ? "rgba(99, 102, 241, 0.08)"
                                  : "var(--bg-surface)",
                                border: selectedEntities.includes(entity._id)
                                  ? "1px solid var(--brand-primary)"
                                  : "1px solid var(--border-color)",
                                transition:
                                  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                marginBottom: "0.5rem",
                                boxShadow: selectedEntities.includes(entity._id)
                                  ? "0 4px 12px rgba(99, 102, 241, 0.1)"
                                  : "0 2px 4px rgba(0,0,0,0.02)",
                              }}
                            >
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "6px",
                                  border: selectedEntities.includes(entity._id)
                                    ? "none"
                                    : "2px solid var(--border-color)",
                                  background: selectedEntities.includes(
                                    entity._id,
                                  )
                                    ? "var(--brand-primary)"
                                    : "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s ease",
                                  flexShrink: 0,
                                }}
                              >
                                {selectedEntities.includes(entity._id) && (
                                  <Check
                                    size={16}
                                    color="var(--text-white)"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  flexGrow: 1,
                                }}
                              >
                                <div
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: selectedEntities.includes(
                                      entity._id,
                                    )
                                      ? "var(--brand-primary)"
                                      : "var(--bg-elevated)",
                                    color: selectedEntities.includes(entity._id)
                                      ? "var(--text-white)"
                                      : "var(--text-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s ease",
                                  }}
                                >
                                  <Users size={18} />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "var(--text-primary)",
                                      fontWeight: "600",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {entity.name || entity.organization_name}
                                  </span>
                                  <span
                                    style={{
                                      color: "var(--text-secondary)",
                                      fontSize: "0.8rem",
                                      marginTop: "2px",
                                    }}
                                  >
                                    {entity.email || entity.domain}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Pagination Controls Removed */}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className={formStyles.submitButton}>
              Save Access Rules
            </button>
          </form>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h3 style={{ margin: 0 }}>
          {activeTab === "quizzes" ? "Quizzes" : "Datasets"} List
        </h3>
        <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
            }}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.5rem 1rem 0.5rem 2.5rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {activeTab === "quizzes"
        ? renderTable(quizzes, isLoadingQuizzes, "quizzes")
        : renderTable(datasets, isLoadingDatasets, "datasets")}

      {/* Table Pagination */}
      {((activeTab === "quizzes" && quizzesTotalPages > 1) ||
        (activeTab === "datasets" && datasetsTotalPages > 1)) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            marginTop: "1rem",
            background: "var(--bg-surface)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
          }}
        >
          <button
            type="button"
            onClick={() => setTablePage((p) => Math.max(1, p - 1))}
            disabled={tablePage === 1}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              cursor: tablePage === 1 ? "not-allowed" : "pointer",
              opacity: tablePage === 1 ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-primary)",
            }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              fontWeight: "500",
            }}
          >
            Page {tablePage} of{" "}
            {activeTab === "quizzes" ? quizzesTotalPages : datasetsTotalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setTablePage((p) =>
                Math.min(
                  activeTab === "quizzes"
                    ? quizzesTotalPages
                    : datasetsTotalPages,
                  p + 1,
                ),
              )
            }
            disabled={
              tablePage ===
              (activeTab === "quizzes" ? quizzesTotalPages : datasetsTotalPages)
            }
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              cursor:
                tablePage ===
                (activeTab === "quizzes"
                  ? quizzesTotalPages
                  : datasetsTotalPages)
                  ? "not-allowed"
                  : "pointer",
              opacity:
                tablePage ===
                (activeTab === "quizzes"
                  ? quizzesTotalPages
                  : datasetsTotalPages)
                  ? 0.5
                  : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-primary)",
            }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SharedDataAccess;
