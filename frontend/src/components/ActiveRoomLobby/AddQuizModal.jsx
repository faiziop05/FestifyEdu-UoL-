import React from "react";
import { X } from "lucide-react";
import styles from "../../styles/pages_css/ActiveRoomLobby.module.css";

const AddQuizModal = ({
  isOpen,
  onClose,
  isQuizzesLoading,
  allQuizzes,
  tempSelectedQuizzes,
  toggleQuizSelection,
  saveQuizzes,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Manage Session Quizzes</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <p>Select which quizzes are available in this live session.</p>
          <div className={styles.quizSelector}>
            {isQuizzesLoading ? (
              <p>Loading quizzes...</p>
            ) : allQuizzes?.length > 0 ? (
              allQuizzes.map((q) => (
                <div 
                  key={q._id} 
                  className={`${styles.quizOption} ${tempSelectedQuizzes.includes(q._id) ? styles.selected : ''}`}
                  onClick={() => toggleQuizSelection(q._id)}
                >
                  <input 
                    type="checkbox" 
                    checked={tempSelectedQuizzes.includes(q._id)}
                    readOnly
                  />
                  <span>{q.name}</span>
                </div>
              ))
            ) : (
              <p className={styles.noQuizzesText}>No published quizzes available.</p>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.submitBtn} onClick={saveQuizzes}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default AddQuizModal;
