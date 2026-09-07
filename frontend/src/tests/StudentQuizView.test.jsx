import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StudentQuizView from "../pages/student/StudentQuizView";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import * as reactRedux from "react-redux";

// Mock child components
vi.mock("../components/Header", () => ({
  default: () => <div data-testid="mock-header" />,
}));
vi.mock("../pages/student/StudentChartViewer", () => ({
  default: () => <div data-testid="mock-chart-viewer" />,
}));
vi.mock("../components/StudentQuiz/ChartControlsSidebar", () => ({
  default: () => <div data-testid="mock-sidebar" />,
}));
vi.mock("../components/StudentQuiz/QuizNavigationPanel", () => ({
  default: () => <div data-testid="mock-nav-panel" />,
}));
vi.mock("../components/StudentQuiz/QuizStatusScreens", () => ({
  QuizStoppedScreen: () => <div data-testid="mock-stopped" />,
  QuizLoadingScreen: () => <div data-testid="mock-loading" />,
  QuizErrorScreen: () => <div data-testid="mock-error" />,
  QuizEmptyScreen: () => <div data-testid="mock-empty" />,
}));
vi.mock("../components/StudentQuiz/QuestionPanel", () => ({
  default: ({ handleNext, handleAnswerChange }) => (
    <div data-testid="mock-question-panel">
      <button onClick={() => handleAnswerChange("A", true)}>Select A</button>
      <button onClick={handleNext}>Next / Submit</button>
    </div>
  ),
}));

// Mock API hooks
vi.mock("../redux/api/quizApiSlice", () => ({
  useGetQuizByIdQuery: vi.fn(),
  useGetStudentQuizByIdQuery: vi.fn(),
  useSubmitStudentQuizMutation: vi.fn(),
  useGetStudentSessionStatusQuery: vi.fn(),
}));
vi.mock("../redux/api/roomApiSlice", () => ({
  useGetRoomByIdQuery: vi.fn(),
}));

// Mock Socket hook
const mockEmitEvent = vi.fn();
const mockListenTo = vi.fn(() => vi.fn());

vi.mock("../hooks/useRoomSocket", () => ({
  default: vi.fn(() => ({
    emitEvent: mockEmitEvent,
    listenTo: mockListenTo,
    isConnected: true,
    roomState: null,
  })),
}));

// Redux mock
vi.mock("react-redux", () => ({
  useSelector: vi.fn(),
}));

import {
  useGetStudentQuizByIdQuery,
  useSubmitStudentQuizMutation,
  useGetStudentSessionStatusQuery,
  useGetQuizByIdQuery,
} from "../redux/api/quizApiSlice";
import { useGetRoomByIdQuery } from "../redux/api/roomApiSlice";

describe("StudentQuizView Component", () => {
  const mockSubmitQuiz = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Redux auth state
    reactRedux.useSelector.mockReturnValue({ user: { role: "student" } });

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn((key) => {
        if (key === "studentSession")
          return JSON.stringify({
            _id: "session1",
            display_name: "Test Student",
          });
        return null;
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock API queries
    useSubmitStudentQuizMutation.mockReturnValue([mockSubmitQuiz]);
    useGetStudentQuizByIdQuery.mockReturnValue({
      data: {
        _id: "quiz1",
        questions: [{ _id: "q1", text: "Question 1", question_type: "mcq" }],
      },
      isLoading: false,
      error: null,
    });
    useGetStudentSessionStatusQuery.mockReturnValue({ data: {} });
    useGetQuizByIdQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    useGetRoomByIdQuery.mockReturnValue({ data: { _id: "room1" } });

    // Global confirm
    window.confirm = vi.fn(() => true);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/student/take-quiz/quiz1"]}>
        <Routes>
          <Route
            path="/student/take-quiz/:quizId"
            element={<StudentQuizView />}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders the quiz layout when data is loaded", () => {
    renderComponent();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    // expect(screen.getByTestId('mock-chart-viewer')).toBeInTheDocument();
    // expect(screen.getByTestId('mock-question-panel')).toBeInTheDocument();
    // expect(screen.getByTestId('mock-nav-panel')).toBeInTheDocument();
  });

  it("allows selecting an answer and submitting the quiz", async () => {
    mockSubmitQuiz.mockReturnValue({ unwrap: () => Promise.resolve() });

    renderComponent();

    // Select an answer
    fireEvent.click(screen.getByText("Select A"));

    // Submit (since it's the last/only question)
    fireEvent.click(screen.getByText("Next / Submit"));

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockSubmitQuiz).toHaveBeenCalledWith({
        quiz_id: "quiz1",
        session_id: "session1",
        answers: [{ question_id: "q1", answer: ["A"] }],
      });
    });

    // Check if it saved to localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "submittedQuiz_session1_quiz1",
      expect.any(String),
    );
  });

  it("displays empty screen if quiz has no questions", () => {
    useGetStudentQuizByIdQuery.mockReturnValue({
      data: { _id: "quiz1", questions: [] },
      isLoading: false,
    });

    renderComponent();
    expect(screen.getByTestId("mock-empty")).toBeInTheDocument();
  });
});
