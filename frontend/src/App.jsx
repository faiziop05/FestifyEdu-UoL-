import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/login";
import DashboardLayout from "./pages/globel/dashboard"; // This acts as our Layout now
import QuizzMaker from "./pages/globel/quizzMaker";
import NewQuiz from "./pages/globel/newQuiz";
import Profile from "./pages/globel/Profile";
import DashboardHome from "./pages/teacher/DashboardHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import ManageOrganizations from "./pages/superadmin/ManageOrganizations";
import ManageAdmins from "./pages/superadmin/ManageAdmins";
import ManageTeachers from "./pages/admin/ManageTeachers";
import DataHub from "./pages/globel/DataHub";
import QuizTakerArea from "./pages/globel/QuizTakerArea";
import StudentQuizView from "./pages/student/StudentQuizView";
import ActiveRoomLobby from "./pages/teacher/ActiveRoomLobby";
import StudentRoomLobby from "./pages/student/StudentRoomLobby";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentPerformance from "./pages/teacher/StudentPerformance";
import StudentPerformanceDetail from "./pages/teacher/StudentPerformanceDetail";
import HelpCenter from "./pages/globel/HelpCenter";
import styles from "./App.module.css";

import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/help" element={<HelpCenter />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin", "super_admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default route redirects to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="quiz-builder" element={<QuizzMaker />} />
          <Route path="quiz-taker" element={<QuizTakerArea />} />
          <Route path="data" element={<DataHub />} />
          <Route path="student-performance" element={<StudentPerformance />} />
          <Route
            path="student-performance/:studentId"
            element={<StudentPerformanceDetail />}
          />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>

        {/* Full Screen Teacher Routes (No Sidebar) */}
        <Route
          path="/teacher/new-quiz"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin", "super_admin"]}>
              <NewQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/edit-quiz/:quizId"
          element={
            <ProtectedRoute allowedRoles={["teacher", "admin", "super_admin"]}>
              <NewQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/room/:roomId"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <ActiveRoomLobby />
            </ProtectedRoute>
          }
        />

        {/* Full Screen Student Routes (Account-Free) */}
        <Route path="/student/join" element={<QuizTakerArea />} />
        <Route path="/student/room/:roomId" element={<StudentRoomLobby />} />
        <Route
          path="/student/take-quiz/:quizId"
          element={<StudentQuizView />}
        />
        <Route path="/student/help" element={<HelpCenter />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<ManageTeachers />} />
          <Route path="quiz-builder" element={<QuizzMaker />} />
          <Route path="data" element={<DataHub />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>

        {/* Super Admin Routes */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="organizations" element={<ManageOrganizations />} />
          <Route path="admins" element={<ManageAdmins />} />
          <Route path="quiz-builder" element={<QuizzMaker />} />
          <Route path="data" element={<DataHub />} />
          <Route path="profile" element={<Profile />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>

        {/* Fallback route - redirect unknown URLs to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
