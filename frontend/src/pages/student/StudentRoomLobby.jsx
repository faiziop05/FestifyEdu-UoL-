import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useRoomSocket from "../../hooks/useRoomSocket";
import { useGetStudentSessionStatusQuery } from "../../redux/api/quizApiSlice";
import styles from "../../styles/pages_css/StudentRoomLobby.module.css";

import LobbyHeader from "../../components/StudentRoomLobby/LobbyHeader";
import LobbyWelcomeBanner from "../../components/StudentRoomLobby/LobbyWelcomeBanner";
import LobbyQuizzesGrid from "../../components/StudentRoomLobby/LobbyQuizzesGrid";
import LobbyHistoryList from "../../components/StudentRoomLobby/LobbyHistoryList";

function StudentRoomLobby() {
  const { roomId } = useParams(); // room_code
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("studentSession");
    if (!savedSession) {
      navigate("/student/join");
      return;
    }
    setSession(JSON.parse(savedSession));

    const savedRoom = localStorage.getItem("currentRoom");
    if (savedRoom) {
      setRoomData(JSON.parse(savedRoom));
    }
  }, [navigate]);

  const { data: sessionStatus } = useGetStudentSessionStatusQuery(session?._id, {
    skip: !session?._id,
  });

  const { roomState, isConnected, listenTo } = useRoomSocket({
    roomCode: roomId,
    sessionId: session?._id,
    role: "student",
  });

  useEffect(() => {
    const unbindSessionEnded = listenTo("session_ended", (data) => {
      localStorage.removeItem("studentSession");
      localStorage.removeItem("currentRoom");
      navigate("/student/join");
    });

    const unbindForceDisconnect = listenTo("force_disconnect", (data) => {
      localStorage.removeItem("studentSession");
      localStorage.removeItem("currentRoom");
      navigate("/student/join");
    });

    const unbindKicked = listenTo("kicked_from_room", () => {
      localStorage.removeItem("studentSession");
      localStorage.removeItem("currentRoom");
      navigate("/student/join");
    });

    return () => {
      unbindSessionEnded();
      unbindForceDisconnect();
      unbindKicked();
    };
  }, [listenTo, navigate]);

  useEffect(() => {
    if (roomState) {
      setRoomData((prev) => {
        const newData = { ...prev, ...roomState };
        localStorage.setItem("currentRoom", JSON.stringify(newData));
        return newData;
      });
    }
  }, [roomState]);

  const handleLeaveRoom = () => {
    if (window.confirm("Are you sure you want to leave the room?")) {
      localStorage.removeItem("studentSession");
      localStorage.removeItem("currentRoom");
      navigate("/student/join");
    }
  };

  const handleTakeQuiz = (quizId) => {
    navigate(`/student/take-quiz/${quizId}`);
  };

  const quizzes = roomData?.quizzes || [];

  return (
    <div className={styles.lobbyContainer}>
      <LobbyHeader
        roomId={roomId}
        isConnected={isConnected}
        session={session}
        handleLeaveRoom={handleLeaveRoom}
      />

      <main className={styles.lobbyMain}>
        {!roomData ? (
          <div className={styles.waitingState}>
            <div className={styles.spinner}></div>
            <p>Syncing with the classroom...</p>
          </div>
        ) : (
          <>
            <LobbyWelcomeBanner session={session} />

            <LobbyQuizzesGrid
              quizzes={quizzes}
              session={session}
              sessionStatus={sessionStatus}
              handleTakeQuiz={handleTakeQuiz}
            />

            <LobbyHistoryList
              quizzes={quizzes}
              session={session}
              sessionStatus={sessionStatus}
              handleTakeQuiz={handleTakeQuiz}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default StudentRoomLobby;
