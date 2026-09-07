import React from "react";
import { Plus } from "lucide-react";
import styles from "../../styles/components_css/TeacherRoomManager/RoomManagerHeader.module.css";

const RoomManagerHeader = ({ resetForm, setIsModalOpen }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h1>Session Manager</h1>
        <p>Create and manage live quiz rooms for your students.</p>
      </div>
      <button 
        className={styles.createBtn}
        onClick={() => { resetForm(); setIsModalOpen(true); }}
      >
        <Plus size={18} />
        Create Session
      </button>
    </div>
  );
};

export default RoomManagerHeader;
