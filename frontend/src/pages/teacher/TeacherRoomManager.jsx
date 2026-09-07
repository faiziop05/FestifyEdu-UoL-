import React, { useState } from "react";
import {
  useGetRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../../redux/api/roomApiSlice";
import { useGetPublishedQuizzesQuery } from "../../redux/api/quizApiSlice";
import {
  Users,
  Plus,
  Play,
  Calendar,
  Settings,
  X,
  Search,
  Globe,
  Lock,
  BarChart3,
  Trash2,
  Edit2,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/pages_css/TeacherRoomManager.module.css";
import RoomManagerHeader from "../../components/TeacherRoomManager/RoomManagerHeader";
import RoomListGrid from "../../components/TeacherRoomManager/RoomListGrid";
import SessionFormModal from "../../components/TeacherRoomManager/SessionFormModal";

function TeacherRoomManager({ user }) {
  const navigate = useNavigate();
  const { data: rooms, isLoading: isLoadingRooms } = useGetRoomsQuery();
  const { data: quizzes, isLoading: isLoadingQuizzes } =
    useGetPublishedQuizzesQuery();
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  // Form State
  const [sessionName, setSessionName] = useState("");
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [scheduleType, setScheduleType] = useState("now"); // "now" or "later"
  const [scheduledDate, setScheduledDate] = useState("");

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: sessionName || "Untitled Session",
        quizzes: selectedQuizzes.map((qId) => ({
          quiz_id: qId,
          status: "waiting",
        })),
        settings: {
          is_public: isPublic,
          show_leaderboard: showLeaderboard,
        },
      };

      if (editingRoomId) {
        // Only update these fields if they exist
        await updateRoom({ id: editingRoomId, ...payload }).unwrap();
      } else {
        // Create new room
        payload.teacher_id = user._id;
        payload.status = scheduleType === "later" ? "scheduled" : "waiting";
        payload.scheduled_for =
          scheduleType === "later" ? new Date(scheduledDate) : null;

        const newRoom = await createRoom(payload).unwrap();
        if (scheduleType === "now") {
          setIsModalOpen(false);
          resetForm();
          navigate(`/teacher/room/${newRoom._id}`);
          return;
        }
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save room", err);
      alert("Failed to save session.");
    }
  };

  const resetForm = () => {
    setEditingRoomId(null);
    setSessionName("");
    setSelectedQuizzes([]);
    setIsPublic(false);
    setShowLeaderboard(true);
    setScheduleType("now");
    setScheduledDate("");
  };

  const openEditModal = (room) => {
    setEditingRoomId(room._id);
    setSessionName(room.name || "");
    setSelectedQuizzes(
      room.quizzes ? room.quizzes.map((q) => q.quiz_id?._id || q.quiz_id) : [],
    );
    setIsPublic(room.settings?.is_public || false);
    setShowLeaderboard(room.settings?.show_leaderboard !== false);
    setScheduleType(room.scheduled_for ? "later" : "now");
    if (room.scheduled_for) {
      const d = new Date(room.scheduled_for);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      setScheduledDate(d.toISOString().slice(0, 16));
    } else {
      setScheduledDate("");
    }
    setIsModalOpen(true);
  };

  const toggleQuizSelection = (quizId) => {
    if (selectedQuizzes.includes(quizId)) {
      setSelectedQuizzes(selectedQuizzes.filter((id) => id !== quizId));
    } else {
      setSelectedQuizzes([...selectedQuizzes, quizId]);
    }
  };

  return (
    <div className={styles.managerContainer}>
      <RoomManagerHeader
        resetForm={resetForm}
        setIsModalOpen={setIsModalOpen}
      />

      <RoomListGrid
        rooms={rooms}
        isLoadingRooms={isLoadingRooms}
        navigate={navigate}
        openEditModal={openEditModal}
        deleteRoom={deleteRoom}
        resetForm={resetForm}
        setIsModalOpen={setIsModalOpen}
      />

      {isModalOpen && (
        <SessionFormModal
          user={user}
          editingRoomId={editingRoomId}
          setIsModalOpen={setIsModalOpen}
          handleSaveRoom={handleSaveRoom}
          sessionName={sessionName}
          setSessionName={setSessionName}
          isLoadingQuizzes={isLoadingQuizzes}
          quizzes={quizzes}
          selectedQuizzes={selectedQuizzes}
          toggleQuizSelection={toggleQuizSelection}
          showLeaderboard={showLeaderboard}
          setShowLeaderboard={setShowLeaderboard}
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
        />
      )}
    </div>
  );
}

export default TeacherRoomManager;
