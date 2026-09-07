import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetQuizByIdQuery, useGetStudentQuizByIdQuery, useSubmitStudentQuizMutation, useGetStudentSessionStatusQuery, useSaveStudentProgressMutation } from "../../redux/api/quizApiSlice";
import { useGetRoomByIdQuery } from "../../redux/api/roomApiSlice";
import { 
  Loader2, ArrowLeft, CheckCircle2, XCircle,
  BarChart, LineChart, PieChart, ScatterChart, LayoutDashboard, Database, Info, StopCircle, AlertCircle, Eye, Lock, Trophy
} from "lucide-react";
import StudentChartViewer from "./StudentChartViewer";
import Header from "../../components/Header";
import useRoomSocket from "../../hooks/useRoomSocket";
import styles from "../../styles/pages_css/StudentQuizView.module.css";

import ChartControlsSidebar from "../../components/StudentQuiz/ChartControlsSidebar";
import QuestionPanel from "../../components/StudentQuiz/QuestionPanel";
import QuizNavigationPanel from "../../components/StudentQuiz/QuizNavigationPanel";
import { QuizStoppedScreen, QuizLoadingScreen, QuizErrorScreen, QuizEmptyScreen } from "../../components/StudentQuiz/QuizStatusScreens";

const CHART_ICONS = {
  Bar: BarChart,
  HorizontalBar: BarChart,
  Line: LineChart,
  Area: LineChart,
  Pie: PieChart,
  Doughnut: PieChart,
  Radar: LayoutDashboard,
  PolarArea: PieChart,
  Scatter: ScatterChart,
  Bubble: ScatterChart,
};

const getOptText = (opt) => {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object") return opt.option ?? opt.text ?? opt.label ?? "";
  return String(opt ?? "");
};

function StudentQuizView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Use public student query for account-free students, or fall back to teacher query
  const { data: studentQuiz, isLoading: isStudentLoading, error: studentError } = useGetStudentQuizByIdQuery(quizId, {
    skip: !!user && user.role !== "student",
  });
  const { data: teacherQuiz, isLoading: isTeacherLoading, error: teacherError } = useGetQuizByIdQuery(quizId, {
    skip: !user || user.role === "student",
  });

  const quiz = studentQuiz || teacherQuiz;
  const isLoading = isStudentLoading || isTeacherLoading;
  const error = studentError || teacherError;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeChartType, setActiveChartType] = useState("Bar");
  const [isQuizEndedByTeacher, setIsQuizEndedByTeacher] = useState(false);

  const [session] = useState(() => {
    const s = localStorage.getItem("studentSession");
    return s ? JSON.parse(s) : null;
  });

  const [answers, setAnswers] = useState({});
  const [saveStudentProgress] = useSaveStudentProgressMutation();

  useEffect(() => {
    if (Object.keys(answers).length > 0 && session?._id) {
      const timeoutId = setTimeout(() => {
        saveStudentProgress({ session_id: session._id, progress: answers }).catch(console.error);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [answers, session?._id]);

  const [localCurrentRoom] = useState(() => {
    const r = localStorage.getItem("currentRoom");
    return r ? JSON.parse(r) : null;
  });

  const roomId = session?.classroom_id || localCurrentRoom?._id;

  const { data: fetchedRoom } = useGetRoomByIdQuery(roomId, {
    pollingInterval: 5000,
    skip: !roomId,
  });

  const currentRoom = fetchedRoom || localCurrentRoom;

  const [localSubmittedAnswers, setLocalSubmittedAnswers] = useState(() => {
    try {
      const stored = localStorage.getItem(`submittedQuiz_${session?._id}_${quizId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { data: sessionStatus } = useGetStudentSessionStatusQuery(session?._id, {
    skip: !session?._id,
  });

  useEffect(() => {
    if (sessionStatus?.saved_progress && Object.keys(answers).length === 0) {
      setAnswers(sessionStatus.saved_progress);
    }
  }, [sessionStatus]);

  const [submitStudentQuiz] = useSubmitStudentQuizMutation();

  const isAlreadySubmitted = useMemo(() => {
    if (isSubmitted || localSubmittedAnswers) return true;
    if (!sessionStatus?.submitted_quizzes) return false;
    return sessionStatus.submitted_quizzes.some(
      (sq) => String(sq.quiz_id?._id || sq.quiz_id) === String(quizId)
    );
  }, [isSubmitted, localSubmittedAnswers, sessionStatus, quizId]);

  // Load previous answers if already submitted
  useEffect(() => {
    if (localSubmittedAnswers) {
      setAnswers((prev) => ({ ...prev, ...localSubmittedAnswers }));
      return;
    }
    if (sessionStatus?.submitted_quizzes) {
      const prevSub = sessionStatus.submitted_quizzes.find(
        (sq) => String(sq.quiz_id?._id || sq.quiz_id) === String(quizId)
      );
      if (prevSub && prevSub.answers && quiz?.questions) {
        const loadedAnswers = {};
        prevSub.answers.forEach((ans) => {
          const qIdx = quiz.questions.findIndex(
            (q) => String(q._id) === String(ans.question_id)
          );
          if (qIdx !== -1) {
            loadedAnswers[qIdx] = ans.answer;
          }
        });
        setAnswers((prev) => ({ ...prev, ...loadedAnswers }));
      }
    }
  }, [sessionStatus, quizId, quiz, localSubmittedAnswers]);

  const { roomState, isConnected, listenTo, emitEvent } = useRoomSocket({
    roomCode: currentRoom?.room_code,
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

  const showLeaderboard = roomState?.settings 
    ? roomState.settings.show_leaderboard 
    : currentRoom?.settings?.show_leaderboard;
    
  const [studentsList, setStudentsList] = useState(roomState?.students || currentRoom?.students || []);

  useEffect(() => {
    if (roomState?.students) {
      setStudentsList(roomState.students);
    }
  }, [roomState]);

  useEffect(() => {
    const unbindAnswer = listenTo("answer_submitted", (data) => {
      setStudentsList((prev) => {
        return prev.map(student => {
          const sid = student.student_session_id?._id || student.student_session_id;
          if (String(sid) === String(data.session_id)) {
            return {
              ...student,
              student_session_id: {
                ...(student.student_session_id || {}),
                score: (student.student_session_id?.score || 0) + data.score,
                display_name: data.display_name || student.student_session_id?.display_name
              }
            };
          }
          return student;
        });
      });
    });

    const unbindJoin = listenTo("student_joined", (data) => {
      setStudentsList((prev) => {
        const exists = prev.find(s => {
          const sid = s.student_session_id?._id || s.student_session_id;
          return String(sid) === String(data.session_id);
        });
        if (exists) return prev;
        return [
          ...prev,
          {
            student_session_id: {
              _id: data.session_id,
              display_name: data.display_name,
              score: 0,
            }
          }
        ];
      });
    });

    return () => {
      unbindAnswer();
      unbindJoin();
    };
  }, [listenTo]);

  const isAnswersRevealed = useMemo(() => {
    const quizzesArr = roomState?.quizzes || currentRoom?.quizzes || [];
    const matchingQuiz = quizzesArr.find(
      (q) => String(q.quiz_id?._id || q.quiz_id) === String(quizId)
    );
    return Boolean(matchingQuiz?.reveal_answers);
  }, [roomState, currentRoom, quizId]);

  useEffect(() => {
    const unbindEnded = listenTo("quiz_ended", (data) => {
      if (String(data.quiz_id) === String(quizId)) {
        setIsQuizEndedByTeacher(true);
      }
    });
    return () => unbindEnded();
  }, [listenTo, quizId]);

  useEffect(() => {
    if (roomState) {
      if (roomState.status === "ended") {
        setIsQuizEndedByTeacher(true);
        return;
      }
      if (roomState.quizzes) {
        const matchingQuiz = roomState.quizzes.find(
          (q) => String(q.quiz_id?._id || q.quiz_id) === String(quizId)
        );
        if (matchingQuiz && matchingQuiz.status === "ended") {
          setIsQuizEndedByTeacher(true);
        }
      }
    }
  }, [roomState, quizId]);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentQuestionIndex]) {
      setActiveChartType(quiz.questions[currentQuestionIndex].chartType || "Bar");
    }
  }, [quiz, currentQuestionIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isSubmitted && !isQuizEndedByTeacher) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave the quiz?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitted, isQuizEndedByTeacher]);

  if (isQuizEndedByTeacher) return <QuizStoppedScreen navigate={navigate} currentRoom={currentRoom} />;

  if (isLoading) return <QuizLoadingScreen />;

  if (error || !quiz) return <QuizErrorScreen navigate={navigate} currentRoom={currentRoom} />;

  if (!quiz.questions || quiz.questions.length === 0) return <QuizEmptyScreen navigate={navigate} currentRoom={currentRoom} />;

  const currentQuestion = quiz.questions[currentQuestionIndex] || {};
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const hasAnsweredAtLeastOne = Object.values(answers).some(ans => {
    if (Array.isArray(ans)) return ans.length > 0;
    return !!ans;
  });

  const handleAnswerChange = (val, isChecked) => {
    if (currentQuestion.question_type === "mcq") {
      const currentAnswers = Array.isArray(answers[currentQuestionIndex]) 
        ? answers[currentQuestionIndex] 
        : (answers[currentQuestionIndex] ? [answers[currentQuestionIndex]] : []);
      if (isChecked) {
        setAnswers({ ...answers, [currentQuestionIndex]: [...currentAnswers, val] });
      } else {
        setAnswers({ ...answers, [currentQuestionIndex]: currentAnswers.filter((a) => a !== val) });
      }
    } else {
      setAnswers({ ...answers, [currentQuestionIndex]: val });
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      if (!session && user?.role && user.role !== "student") {
        const displayRole = user.role.replace("_", " ");
        alert(`Preview Mode: As a ${displayRole}, your answers will not be submitted.`);
        return;
      }
      if (isAlreadySubmitted) return;

      if (window.confirm("Are you sure you want to submit your quiz? You won't be able to change your answers after submitting.")) {
        try {
          const formattedAnswers = Object.entries(answers).map(([qIdx, ansVal]) => ({
            question_id: quiz.questions[qIdx]?._id,
            answer: ansVal,
          }));

          if (session?._id) {
            await submitStudentQuiz({
              quiz_id: quizId,
              session_id: session._id,
              answers: formattedAnswers,
            }).unwrap();
          }

          setLocalSubmittedAnswers(answers);
          setIsSubmitted(true);
        } catch (err) {
          console.error("Submission failed or already submitted:", err);
          
          if (err?.data?.error === "Quiz has already been submitted.") {
            setLocalSubmittedAnswers(answers);
            setIsSubmitted(true);
          } else {
            alert(`Failed to submit quiz: ${err?.data?.error || "Unknown error"}`);
          }
        }
      }
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleLeaveQuiz = () => {
    if (isAlreadySubmitted) {
      navigate(currentRoom ? `/student/room/${currentRoom.room_code}` : "/student/join");
    } else if (window.confirm("Are you sure you want to leave this quiz? Your progress in this attempt will be lost.")) {
      navigate(currentRoom ? `/student/room/${currentRoom.room_code}` : "/student/join");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <ChartControlsSidebar
        handleLeaveQuiz={handleLeaveQuiz}
        currentQuestion={currentQuestion}
        activeChartType={activeChartType}
        setActiveChartType={setActiveChartType}
        CHART_ICONS={CHART_ICONS}
      />

      <main className={styles.rightMainArea}>
        <Header variant="student" />

        <div className={styles.contentRow}>
          <div className={styles.chartWrapper}>
            <StudentChartViewer
              question={currentQuestion}
              chartType={activeChartType}
            />
          </div>

          <QuestionPanel
            currentQuestion={currentQuestion}
            isAlreadySubmitted={isAlreadySubmitted}
            isAnswersRevealed={isAnswersRevealed}
            answers={answers}
            currentQuestionIndex={currentQuestionIndex}
            handleAnswerChange={handleAnswerChange}
            handlePrev={handlePrev}
            handleNext={handleNext}
            isLastQuestion={isLastQuestion}
            hasAnsweredAtLeastOne={hasAnsweredAtLeastOne}
            getOptText={getOptText}
          />
        </div>
      </main>

      <QuizNavigationPanel
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        showLeaderboard={showLeaderboard}
        studentsList={studentsList}
        session={session}
        answers={answers}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        currentQuestion={currentQuestion}
      />
    </div>
  );
};

export default StudentQuizView;
