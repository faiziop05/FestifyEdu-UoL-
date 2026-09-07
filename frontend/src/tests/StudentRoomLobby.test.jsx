import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StudentRoomLobby from "../pages/student/StudentRoomLobby";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// Mock child components
vi.mock("../components/StudentRoomLobby/LobbyHeader", () => ({
  default: () => <div data-testid="mock-header" />,
}));
vi.mock("../components/StudentRoomLobby/LobbyWelcomeBanner", () => ({
  default: () => <div data-testid="mock-banner" />,
}));
vi.mock("../components/StudentRoomLobby/LobbyQuizzesGrid", () => ({
  default: ({ quizzes }) => (
    <div data-testid="mock-quizzes-grid">
      {quizzes.map((q, i) => (
        <span key={i}>{q.quiz_id.name}</span>
      ))}
    </div>
  ),
}));
vi.mock("../components/StudentRoomLobby/LobbyHistoryList", () => ({
  default: () => <div data-testid="mock-history" />,
}));

// Mock API hooks
vi.mock("../redux/api/quizApiSlice", () => ({
  useGetStudentSessionStatusQuery: vi.fn(),
}));

// Mock Socket hook
const mockEmitEvent = vi.fn();
let socketListeners = {};
const mockListenTo = vi.fn((event, callback) => {
  socketListeners[event] = callback;
  return () => {
    delete socketListeners[event];
  };
});

vi.mock("../hooks/useRoomSocket", () => ({
  default: vi.fn(() => ({
    emitEvent: mockEmitEvent,
    listenTo: mockListenTo,
    isConnected: true,
    roomState: null,
  })),
}));

import { useGetStudentSessionStatusQuery } from "../redux/api/quizApiSlice";
import useRoomSocket from "../hooks/useRoomSocket";

describe("StudentRoomLobby Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketListeners = {};

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn((key) => {
        if (key === "studentSession")
          return JSON.stringify({
            _id: "session1",
            display_name: "Test Student",
          });
        if (key === "currentRoom")
          return JSON.stringify({ room_code: "123456", quizzes: [] });
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    useGetStudentSessionStatusQuery.mockReturnValue({
      data: { score: 0 },
    });

    // Mock global alert
    window.alert = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/student/room/123456"]}>
        <Routes>
          <Route path="/student/room/:roomId" element={<StudentRoomLobby />} />
          <Route
            path="/student/join"
            element={<div data-testid="mock-join-page">Join Page</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders the lobby and fetches local storage correctly", () => {
    renderComponent();
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-banner")).toBeInTheDocument();
    expect(screen.getByTestId("mock-quizzes-grid")).toBeInTheDocument();
  });

  it("redirects to join page if no student session exists in localStorage", () => {
    window.localStorage.getItem.mockReturnValue(null);
    renderComponent();
    expect(screen.getByTestId("mock-join-page")).toBeInTheDocument();
  });

  it("handles socket session_ended event by alerting and redirecting", async () => {
    renderComponent();

    // Simulate socket event
    socketListeners["session_ended"]({ message: "Teacher ended session" });

    expect(window.alert).toHaveBeenCalledWith("Teacher ended session");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(
      "studentSession",
    );
    await waitFor(() => {
      expect(screen.getByTestId("mock-join-page")).toBeInTheDocument();
    });
  });

  it("updates room data when roomState changes from socket", async () => {
    useRoomSocket.mockReturnValue({
      emitEvent: mockEmitEvent,
      listenTo: mockListenTo,
      isConnected: true,
      roomState: { quizzes: [{ quiz_id: { name: "New Socket Quiz" } }] },
    });

    renderComponent();

    // Check if the new quiz from socket state is rendered
    expect(screen.getByText("New Socket Quiz")).toBeInTheDocument();
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });
});
