import React from "react";
import { Calendar, Globe, Lock, BarChart3, Play, Trash2, Edit2, Clock, Users } from "lucide-react";
import styles from "../../styles/components_css/TeacherRoomManager/RoomListGrid.module.css";

const RoomListGrid = ({ 
  rooms, 
  isLoadingRooms, 
  navigate, 
  openEditModal, 
  deleteRoom,
  resetForm,
  setIsModalOpen
}) => {
  return (
    <div className={styles.roomGrid}>
      {isLoadingRooms ? (
        <div className={styles.loading}>Loading sessions...</div>
      ) : rooms && rooms.length > 0 ? (
        rooms.map(room => (
          <div key={room._id} className={styles.roomCard}>
            <div className={styles.roomCardHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {room.name || "Untitled Session"}
                </h3>
                <div className={styles.roomCodeBadge}>Code: {room.room_code}</div>
              </div>
              <span className={`${styles.statusBadge} ${styles[room.status]}`}>
                {room.status.toUpperCase()}
              </span>
            </div>
            <div className={styles.roomCardBody}>
              <p><strong>{room.quizzes.length}</strong> Quizzes Attached</p>
              {room.status === 'scheduled' && room.scheduled_for ? (
                <p className={styles.scheduledText}>
                  <Calendar size={14}/> {new Date(room.scheduled_for).toLocaleString()}
                </p>
              ) : room.status === 'active' && room.started_at ? (
                <p className={styles.scheduledText} style={{ color: 'var(--success-color)' }}>
                  <Clock size={14}/> Started: {new Date(room.started_at).toLocaleString()}
                </p>
              ) : room.status === 'ended' && room.ended_at ? (
                <p className={styles.scheduledText}>
                  <Clock size={14}/> Ended: {new Date(room.ended_at).toLocaleString()}
                </p>
              ) : (
                <p className={styles.scheduledText}>
                  <Calendar size={14}/> Created: {new Date(parseInt(room._id.substring(0, 8), 16) * 1000).toLocaleDateString()}
                </p>
              )}
              <div className={styles.settingsTags}>
                {room.settings?.is_public ? (
                  <span className={styles.tag}><Globe size={12}/> Public</span>
                ) : (
                  <span className={styles.tag}><Lock size={12}/> Private</span>
                )}
                {room.settings?.show_leaderboard && (
                  <span className={styles.tag}><BarChart3 size={12}/> Leaderboard On</span>
                )}
              </div>
            </div>
            <div className={styles.roomCardFooter}>
              <button 
                className={styles.actionBtn}
                onClick={() => navigate(`/teacher/room/${room._id}`)}
              >
                <Play size={16} /> Open Lobby
              </button>
              <button 
                className={styles.actionBtn}
                onClick={() => openEditModal(room)}
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
              >
                <Edit2 size={16} /> Edit
              </button>
              <button 
                className={styles.deleteBtn}
                onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this session?")) {
                    await deleteRoom(room._id);
                  }
                }}
                title="Delete Session"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyState}>
          <Users size={48} className={styles.emptyIcon} />
          <h3>No Active Sessions</h3>
          <p>Create a session to generate a room code and invite students.</p>
          <button className={styles.createBtnSecondary} onClick={() => { resetForm(); setIsModalOpen(true); }}>
            Create Session
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomListGrid;
