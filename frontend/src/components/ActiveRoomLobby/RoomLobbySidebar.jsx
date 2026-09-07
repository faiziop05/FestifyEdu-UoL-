import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Square,
  Users,
  Trash2,
  Calendar,
  Clock,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import styles from "../../styles/pages_css/ActiveRoomLobby.module.css";

const RoomLobbySidebar = ({
  isLeftSidebarOpen,
  setIsLeftSidebarOpen,
  isCodeVisible,
  setIsCodeVisible,
  room,
  handleSettingChange,
  handleDeleteRoom,
  handleStatusChange,
  handleLeaveLobby,
}) => {
  return (
    <div
      className={`${styles.leftSidebar} ${!isLeftSidebarOpen ? styles.collapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <button
          className={styles.collapseBtn}
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
          {isLeftSidebarOpen && <span>Collapse Controls</span>}
        </button>
      </div>

      <div
        className={`${styles.sidebarContent} ${!isLeftSidebarOpen ? styles.sidebarContentCollapsed : ""}`}
      >
        {/* Session Info Area */}
        {isLeftSidebarOpen && (
          <div
            style={{
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: "1.3",
              }}
            >
              {room?.name || "Untitled Session"}
            </h3>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {room?.status === "scheduled" && room?.scheduled_for ? (
                <span>
                  <Calendar
                    size={12}
                    style={{ marginRight: "4px", verticalAlign: "middle" }}
                  />{" "}
                  Scheduled: {new Date(room.scheduled_for).toLocaleString()}
                </span>
              ) : room?.status === "active" && room?.started_at ? (
                <span
                  style={{ color: "var(--success-color)", fontWeight: "600" }}
                >
                  <Clock
                    size={12}
                    style={{ marginRight: "4px", verticalAlign: "middle" }}
                  />{" "}
                  Started: {new Date(room.started_at).toLocaleString()}
                </span>
              ) : room?.status === "ended" && room?.ended_at ? (
                <span>
                  <Clock
                    size={12}
                    style={{ marginRight: "4px", verticalAlign: "middle" }}
                  />{" "}
                  Ended: {new Date(room.ended_at).toLocaleString()}
                </span>
              ) : (
                room?._id && (
                  <span>
                    <Calendar
                      size={12}
                      style={{ marginRight: "4px", verticalAlign: "middle" }}
                    />{" "}
                    Created:{" "}
                    {new Date(
                      parseInt(room._id.substring(0, 8), 16) * 1000,
                    ).toLocaleDateString()}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <div className={styles.codeControls}>
          <button
            className={`${styles.sidebarActionBtn} ${isCodeVisible ? styles.activeState : ""} ${!isLeftSidebarOpen ? styles.iconOnlyBtn : ""}`}
            onClick={() => setIsCodeVisible(!isCodeVisible)}
            title={isCodeVisible ? "Hide Join Code" : "Reveal Join Code"}
          >
            {isCodeVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            {isLeftSidebarOpen && (
              <span>
                {isCodeVisible ? "Hide Join Code" : "Reveal Join Code"}
              </span>
            )}
          </button>
        </div>

        <div className={styles.settingsSection}>
          {isLeftSidebarOpen && <h3>Session Data Access</h3>}

          <div
            className={`${styles.settingRow} ${!isLeftSidebarOpen ? styles.iconRow : ""}`}
            title="Leaderboard"
          >
            <div className={styles.settingInfo}>
              <Users
                size={20}
                color={
                  !isLeftSidebarOpen &&
                  room?.settings?.show_leaderboard !== false
                    ? "var(--brand-primary)"
                    : "currentColor"
                }
              />
              {isLeftSidebarOpen && <span>Leaderboard</span>}
            </div>
            {isLeftSidebarOpen ? (
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={room?.settings?.show_leaderboard !== false}
                  onChange={(e) =>
                    handleSettingChange("show_leaderboard", e.target.checked)
                  }
                />
                <span className={styles.toggleSlider}></span>
              </label>
            ) : (
              <button
                className={styles.iconToggleBtn}
                onClick={() =>
                  handleSettingChange(
                    "show_leaderboard",
                    room?.settings?.show_leaderboard === false,
                  )
                }
              />
            )}
          </div>
          {isLeftSidebarOpen && (
            <p className={styles.settingHint}>
              Show live leaderboard to students.
            </p>
          )}
        </div>

        <div
          className={`${styles.dangerZone} ${!isLeftSidebarOpen ? styles.dangerZoneCollapsed : ""}`}
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {room?.status !== "active" ? (
            <button
              className={`${styles.sidebarActionBtn} ${!isLeftSidebarOpen ? styles.iconOnlyBtn : ""}`}
              style={{
                background: "var(--success-color)",
                color: "white",
                borderColor: "var(--success-color)",
              }}
              onClick={() => handleStatusChange("active")}
              title="Start Session"
            >
              <Play fill="currentColor" size={20} />
              {isLeftSidebarOpen && <span>Start Session</span>}
            </button>
          ) : (
            <button
              className={`${styles.sidebarActionBtn} ${!isLeftSidebarOpen ? styles.iconOnlyBtn : ""}`}
              style={{
                background: "var(--orangeAccent)",
                color: "white",
                borderColor: "var(--orangeAccent)",
              }}
              onClick={() => handleStatusChange("ended")}
              title="End Session"
            >
              <Square fill="currentColor" size={20} />
              {isLeftSidebarOpen && <span>End Session</span>}
            </button>
          )}
          <button
            className={`${styles.sidebarActionBtn} ${!isLeftSidebarOpen ? styles.iconOnlyBtn : ""}`}
            style={{
              background: "transparent",
              color: "var(--accent)",
              borderColor: "var(--accent)",
            }}
            onClick={handleLeaveLobby}
            title="Leave Lobby"
          >
            <LogOut size={20} />
            {isLeftSidebarOpen && <span>Leave Lobby</span>}
          </button>
          <button
            className={`${styles.sidebarActionBtn} ${!isLeftSidebarOpen ? styles.iconOnlyBtn : ""}`}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "var(--error-color)",
              borderColor: "rgba(239, 68, 68, 0.2)",
            }}
            onClick={handleDeleteRoom}
            title="Delete Session"
          >
            <Trash2 size={20} />
            {isLeftSidebarOpen && <span>Delete Session</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomLobbySidebar;
