import React from "react";
import { GraduationCap, LogOut, Radio } from "lucide-react";
import styles from "../../styles/components_css/StudentRoomLobby/LobbyHeader.module.css";

const LobbyHeader = ({ roomId, isConnected, session, handleLeaveRoom }) => {
  return (
    <header className={styles.lobbyHeader}>
      <div className={styles.headerLeft}>
        <GraduationCap size={28} className={styles.icon} />
        <div>
          <h1 style={{ letterSpacing: '1px' }}>
            Festify<span className={styles.brandAccent}>Edu</span>
          </h1>
          <span className={styles.roomCodeBadge}>Code: {roomId}</span>
        </div>
      </div>
      <div className={styles.headerRight}>
        <span className={styles.liveIndicator}>
          <Radio size={14} className={isConnected ? styles.pulseIcon : ""} />
          {isConnected ? "Live Sync Active" : "Connecting..."}
        </span>
        {session && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{session.display_name}</span>
          </div>
        )}
        <button className={styles.leaveBtn} onClick={handleLeaveRoom}>
          <LogOut size={16} /> Leave
        </button>
      </div>
    </header>
  );
};

export default LobbyHeader;
