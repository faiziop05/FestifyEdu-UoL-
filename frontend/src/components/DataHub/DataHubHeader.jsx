import React from "react";
import { DownloadCloud, Upload } from "lucide-react";
import styles from "../../styles/pages_css/DataHub.module.css";

const DataHubHeader = ({
  user,
  handleConnectGoogleDrive,
  fileInputRef,
  handleLocalFileChange,
  loadDriveFiles,
}) => {
  return (
    <div className={styles.header}>
      <div>
        <h1>Data Hub</h1>
        <p>Manage your imported datasets for Quiz Generation.</p>
      </div>
      <div className={styles.actions}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
          }}
        >
          <button
            className={styles.btnSecondary}
            onClick={handleConnectGoogleDrive}
          >
            {user?.google_drive_email
              ? "Reconnect Drive"
              : "Connect Google Drive"}
          </button>
          {user?.google_drive_email && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--success-color)",
                fontWeight: 600,
              }}
            >
              ✓ Connected: {user.google_drive_email}
            </span>
          )}
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload size={18} /> Import Local File
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLocalFileChange}
          style={{ display: "none" }}
          accept=".xlsx, .xls, .csv"
        />
        <button
          className={styles.btnSecondary}
          style={{
            background: "var(--brand-primary)",
            color: "white",
            borderColor: "var(--brand-primary)",
          }}
          onClick={loadDriveFiles}
        >
          <DownloadCloud size={18} /> Import Drive Data
        </button>
      </div>
    </div>
  );
};

export default DataHubHeader;
