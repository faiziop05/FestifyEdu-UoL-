import React from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import styles from "../../styles/pages_css/DataHub.module.css";

const DriveImportModal = ({
  isOpen,
  onClose,
  driveFiles,
  handleImportFile,
  importingFileId,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Select File from Google Drive</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.fileList}>
          {driveFiles.length === 0 ? (
            <p className={styles.emptyText}>
              No Excel/CSV files found in your Drive.
            </p>
          ) : (
            driveFiles.map((file) => (
              <div key={file.id} className={styles.fileRow}>
                <div className={styles.fileInfo}>
                  <FileSpreadsheet size={20} className={styles.fileIconSmall} />
                  <span>{file.name}</span>
                </div>
                <button
                  className={styles.btnImport}
                  onClick={() => handleImportFile(file)}
                  disabled={importingFileId !== null}
                >
                  {importingFileId === file.id ? (
                    <Loader2 className={styles.spin} size={16} />
                  ) : (
                    "Import"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriveImportModal;
