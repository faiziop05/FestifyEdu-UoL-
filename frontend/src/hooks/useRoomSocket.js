import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export function useRoomSocket({ roomCode, sessionId, role = "student" }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);

  useEffect(() => {
    if (!roomCode) return;

    // Connect to Socket.io
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["polling", "websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    const joinRoom = () => {
      setIsConnected(true);
      if (role === "teacher") {
        socket.emit("join_room_teacher", { room_code: String(roomCode) });
      } else {
        socket.emit("join_room_student", {
          room_code: String(roomCode),
          session_id: sessionId,
        });
      }
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("room_updated", (data) => {
      setRoomState(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomCode, sessionId, role]);

  const listenTo = (eventName, callback) => {
    if (!socketRef.current) return () => {};
    socketRef.current.on(eventName, callback);
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, callback);
      }
    };
  };

  const emitEvent = (eventName, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    roomState,
    listenTo,
    emitEvent,
  };
}
export default useRoomSocket;
