import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} from "../../redux/api/roomApiSlice";
import { useGetPublishedQuizzesQuery } from "../../redux/api/quizApiSlice";
import Header from "../../components/Header";
import styles from "../../styles/pages_css/ActiveRoomLobby.module.css";
import RoomLobbySidebar from "../../components/ActiveRoomLobby/RoomLobbySidebar";
import RoomLobbyQuizzes from "../../components/ActiveRoomLobby/RoomLobbyQuizzes";
import RoomLobbyParticipants from "../../components/ActiveRoomLobby/RoomLobbyParticipants";
import AddQuizModal from "../../components/ActiveRoomLobby/AddQuizModal";
import QuizResponsesModal from "../../components/ActiveRoomLobby/QuizResponsesModal";
import useRoomSocket from "../../hooks/useRoomSocket";

function ActiveRoomLobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    data: room,
    isLoading,
    isError,
    refetch,
  } = useGetRoomByIdQuery(roomId, {
    pollingInterval: 3000,
  });
  const { data: allQuizzes, isLoading: isQuizzesLoading } =
    useGetPublishedQuizzesQuery();

  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [tempSelectedQuizzes, setTempSelectedQuizzes] = useState([]);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [responsesQuizId, setResponsesQuizId] = useState(null);

  const { listenTo, emitEvent } = useRoomSocket({
    roomCode: room?.room_code,
    role: "teacher",
  });

  useEffect(() => {
    const unbindJoin = listenTo("student_joined", (data) => {
      console.log("Teacher received student_joined:", data);
      refetch();
    });
    const unbindLeave = listenTo("student_disconnected", (data) => {
      console.log("Teacher received student_disconnected:", data);
      refetch();
    });
    const unbindAnswer = listenTo("answer_submitted", (data) => {
      console.log("Teacher received answer_submitted:", data);
      refetch();
    });
    return () => {
      unbindJoin();
      unbindLeave();
      unbindAnswer();
    };
  }, [listenTo, refetch]);

  // Track selected timer (in minutes) for each quiz before starting. '0' means no timer.
  const [quizTimers, setQuizTimers] = useState({});

  const handleTimerChange = (quizId, minutes) => {
    setQuizTimers((prev) => ({ ...prev, [quizId]: minutes }));
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateRoom({ id: room._id, status: newStatus }).unwrap();
      if (newStatus === "ended") {
        emitEvent("end_session", { room_code: room.room_code });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSettingChange = async (settingKey, newValue) => {
    try {
      await updateRoom({
        id: room._id,
        settings: {
          ...room.settings,
          [settingKey]: newValue,
        },
      }).unwrap();
    } catch (err) {
      console.error(`Failed to update ${settingKey}`, err);
    }
  };

  const handleDeleteRoom = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this session?",
      )
    ) {
      try {
        await deleteRoom(room._id).unwrap();
        navigate("/teacher/quiz-taker");
      } catch (err) {
        console.error("Failed to delete session", err);
      }
    }
  };

  const openQuizModal = () => {
    // initialize temp selected from current room
    setTempSelectedQuizzes(room.quizzes.map((q) => q.quiz_id._id || q.quiz_id));
    setIsQuizModalOpen(true);
  };

  const toggleQuizSelection = (quizId) => {
    if (tempSelectedQuizzes.includes(quizId)) {
      setTempSelectedQuizzes(tempSelectedQuizzes.filter((id) => id !== quizId));
    } else {
      setTempSelectedQuizzes([...tempSelectedQuizzes, quizId]);
    }
  };

  const saveQuizzes = async () => {
    try {
      const newQuizzesArray = tempSelectedQuizzes.map((qId) => {
        // preserve status if it was already in the room
        const existing = room.quizzes.find(
          (q) => (q.quiz_id._id || q.quiz_id) === qId,
        );
        return { quiz_id: qId, status: existing ? existing.status : "waiting" };
      });
      await updateRoom({ id: room._id, quizzes: newQuizzesArray }).unwrap();
      setIsQuizModalOpen(false);
    } catch (err) {
      console.error("Failed to update quizzes", err);
    }
  };

  const handleSetQuizStatus = async (targetQuizId, newStatus) => {
    try {
      const updatedQuizzes = room.quizzes.map((q) => {
        const qId = q.quiz_id._id || q.quiz_id;

        // If this is the target quiz being updated
        if (qId === targetQuizId) {
          const updates = { quiz_id: qId, status: newStatus };

          if (newStatus === "active") {
            const timeLimit = parseInt(quizTimers[targetQuizId] || 0, 10);
            if (timeLimit > 0) {
              updates.time_limit = timeLimit;
              updates.started_at = new Date().toISOString();
            } else {
              updates.time_limit = null;
              updates.started_at = new Date().toISOString();
            }
          }
          // If ended or waiting, optionally clear timer? Or keep for history.
          return { ...q, ...updates };
        }

        // If we are activating a new quiz, auto-pause any other currently active quizzes
        if (newStatus === "active" && q.status === "active") {
          return { ...q, quiz_id: qId, status: "waiting" };
        }
        return { ...q, quiz_id: qId };
      });
      await updateRoom({ id: room._id, quizzes: updatedQuizzes }).unwrap();
    } catch (err) {
      console.error("Failed to update quiz status", err);
    }
  };

  const handleToggleRevealAnswers = async (targetQuizId) => {
    try {
      const updatedQuizzes = room.quizzes.map((q) => {
        const qId = q.quiz_id._id || q.quiz_id;
        if (qId === targetQuizId) {
          return { ...q, quiz_id: qId, reveal_answers: !q.reveal_answers };
        }
        return { ...q, quiz_id: qId };
      });
      await updateRoom({ id: room._id, quizzes: updatedQuizzes }).unwrap();
    } catch (err) {
      console.error("Failed to toggle reveal answers", err);
    }
  };

  const openResponsesModal = (quizId) => {
    setResponsesQuizId(quizId);
  };

  const closeResponsesModal = () => {
    setResponsesQuizId(null);
  };

  if (isLoading)
    return <div className={styles.loadingState}>Loading session...</div>;
  if (isError || !room)
    return <div className={styles.errorState}>Session not found.</div>;

  const handleLeaveLobby = () => {
    navigate("/teacher/quiz-taker");
  };

  return (
    <div className={styles.lobbyContainer}>
      <RoomLobbySidebar
        isLeftSidebarOpen={isLeftSidebarOpen}
        setIsLeftSidebarOpen={setIsLeftSidebarOpen}
        isCodeVisible={isCodeVisible}
        setIsCodeVisible={setIsCodeVisible}
        room={room}
        handleSettingChange={handleSettingChange}
        handleDeleteRoom={handleDeleteRoom}
        handleStatusChange={handleStatusChange}
        handleLeaveLobby={handleLeaveLobby}
      />

      {/* Middle Section: Main Dashboard */}
      <div className={styles.mainCenter}>
        <Header variant="teacher" hideNav={true} />

        <div className={styles.centerContentArea}>
          {/* Room Code Banner */}
          {isCodeVisible && (
            <div className={`${styles.roomCodeBanner} ${styles.activeCode}`}>
              <div className={styles.codePresentation}>
                <p
                  className={styles.joinText}
                  style={{ margin: 0, marginBottom: "16px" }}
                >
                  Join at <strong>example.com/join</strong>
                </p>
                <h1 className={styles.massiveCode}>
                  {room.room_code.slice(0, 3)} {room.room_code.slice(3)}
                </h1>
              </div>
            </div>
          )}

          <RoomLobbyQuizzes
            room={room}
            allQuizzes={allQuizzes}
            openQuizModal={openQuizModal}
            quizTimers={quizTimers}
            handleTimerChange={handleTimerChange}
            handleSetQuizStatus={handleSetQuizStatus}
            handleToggleRevealAnswers={handleToggleRevealAnswers}
            openResponsesModal={openResponsesModal}
            isCodeVisible={isCodeVisible}
          />
        </div>
      </div>

      <RoomLobbyParticipants
        room={room}
        isCodeVisible={isCodeVisible}
        handleStatusChange={handleStatusChange}
      />

      <AddQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        isQuizzesLoading={isQuizzesLoading}
        allQuizzes={allQuizzes}
        tempSelectedQuizzes={tempSelectedQuizzes}
        toggleQuizSelection={toggleQuizSelection}
        saveQuizzes={saveQuizzes}
      />

      <QuizResponsesModal
        isOpen={!!responsesQuizId}
        onClose={closeResponsesModal}
        quizId={responsesQuizId}
        room={room}
        allQuizzes={allQuizzes}
      />
    </div>
  );
}

export default ActiveRoomLobby;
