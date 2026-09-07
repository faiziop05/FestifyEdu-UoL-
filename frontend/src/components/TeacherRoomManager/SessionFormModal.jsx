import React from "react";
import { X } from "lucide-react";
import styles from "../../styles/components_css/TeacherRoomManager/SessionFormModal.module.css";

const SessionFormModal = ({
  user,
  editingRoomId,
  setIsModalOpen,
  handleSaveRoom,
  sessionName,
  setSessionName,
  isLoadingQuizzes,
  quizzes,
  selectedQuizzes,
  toggleQuizSelection,
  showLeaderboard,
  setShowLeaderboard,
  scheduleType,
  setScheduleType,
  scheduledDate,
  setScheduledDate
}) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{editingRoomId ? "Edit Session" : "Create New Session"}</h2>
          <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSaveRoom} className={styles.modalForm}>
          <div className={styles.formSection}>
            <h3>1. Session Details</h3>
            <div className={styles.datePicker}>
              <label>Session Name</label>
              <input 
                type="text" 
                placeholder="e.g. Fall Midterm Review"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>2. Select Quizzes</h3>
            <div className={styles.quizSelector}>
              {isLoadingQuizzes ? <p>Loading quizzes...</p> : 
                quizzes?.length > 0 ? (
                  quizzes.map(q => (
                    <div 
                      key={q._id} 
                      className={`${styles.quizOption} ${selectedQuizzes.includes(q._id) ? styles.selected : ''}`}
                      onClick={() => toggleQuizSelection(q._id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedQuizzes.includes(q._id)}
                        readOnly
                      />
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <span>{q.name}</span>
                        {(q.teacher_id?._id ? q.teacher_id._id !== user?._id : q.teacher_id !== user?._id) && (
                          <span style={{ fontSize: "0.75rem", padding: "2px 8px", background: "var(--brand-primary)", color: "var(--text-white)", borderRadius: "12px", fontWeight: "600" }}>
                            Shared
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className={styles.noQuizzesText}>No published quizzes available. Publish a quiz first.</p>
                )
              }
            </div>
          </div>

          <div className={styles.formSection}>
            <h3>3. Session Settings</h3>
            <label className={styles.toggleLabel}>
              <div className={styles.toggleText}>
                <strong>Show Leaderboard</strong>
                <p>Allow students to see live rankings during the quiz.</p>
              </div>
              <input 
                type="checkbox" 
                className={styles.toggleInput}
                checked={showLeaderboard} 
                onChange={e => setShowLeaderboard(e.target.checked)} 
              />
            </label>
          </div>

          <div className={styles.formSection}>
            <h3>4. Schedule</h3>
            <div className={styles.scheduleTabs}>
              <button 
                type="button"
                className={`${styles.tabBtn} ${scheduleType === 'now' ? styles.activeTab : ''}`}
                onClick={() => setScheduleType('now')}
              >
                Start Now
              </button>
              <button 
                type="button"
                className={`${styles.tabBtn} ${scheduleType === 'later' ? styles.activeTab : ''}`}
                onClick={() => setScheduleType('later')}
              >
                Schedule Later
              </button>
            </div>
            
            {scheduleType === 'later' && (
              <div className={styles.datePicker}>
                <label>Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              {editingRoomId 
                ? "Save Changes" 
                : (scheduleType === 'now' ? "Create & Open Lobby" : "Schedule Session")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionFormModal;
