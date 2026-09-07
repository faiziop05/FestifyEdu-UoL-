import React from "react";
import { useSelector } from "react-redux";
import { useGetQuizzesByTeacherQuery } from "../../redux/api/quizApiSlice";
import { useGetRoomsQuery } from "../../redux/api/roomApiSlice";
import { useGetDatasetsQuery } from "../../redux/api/datasetApiSlice";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  PlayCircle,
  Database,
  FileText,
  Activity,
  ChevronRight,
} from "lucide-react";
import DashboardHero from "../../components/DashboardHero";
import DashboardSection from "../../components/DashboardSection";
import OverviewCard from "../../components/OverviewCard";
import pageStyles from "../../styles/pages_css/PremiumDashboard.module.css";
import styles from "../../styles/pages_css/DashboardHome.module.css";

const DashboardHome = () => {
  const user = useSelector((state) => state.auth.user);
  const teacherId = user?._id || user?.id;
  const navigate = useNavigate();

  const { data: quizzes = [], isLoading: loadingQuizzes } =
    useGetQuizzesByTeacherQuery(teacherId, { skip: !teacherId });
  const { data: rooms = [], isLoading: loadingRooms } = useGetRoomsQuery();
  const { data: datasets = [], isLoading: loadingDatasets } =
    useGetDatasetsQuery(teacherId, { skip: !teacherId });

  const activeRooms = rooms.filter(
    (r) => r.status === "active" || r.status === "waiting",
  );
  const totalDatasets = (datasets?.datasets || []).length;

  return (
    <div className={pageStyles.dashboardContainer}>
      <DashboardHero
        title={`Welcome back, ${user?.name || "Teacher"}! 👋`}
        subtitle="Here’s what’s happening with your classes today. Monitor active rooms, build quizzes from datasets, and host live sessions."
        badgeText="Teacher Workspace"
      />

      <DashboardSection title="Teacher Workspace" icon={Activity} type="stats">
        <OverviewCard
          icon={PlusCircle}
          title="Create New Quiz"
          value={loadingQuizzes ? "..." : quizzes.length}
          description="Build dynamic quizzes from your Google Drive & Data Hub datasets."
          badgeText="Quiz Builder"
          path="/teacher/new-quiz"
        />
        <OverviewCard
          icon={PlayCircle}
          title="Host a Live Session"
          value={loadingRooms ? "..." : activeRooms.length}
          description="Launch a live room lobby for student quiz taking."
          badgeText="Session Manager"
          path="/teacher/quiz-taker"
        />
        <OverviewCard
          icon={Database}
          title="Manage Data Hub"
          value={loadingDatasets ? "..." : totalDatasets}
          description="Connect Google Drive, import Excel files, and view datasets."
          badgeText="Data Hub"
          path="/teacher/data"
        />
      </DashboardSection>

      <section className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Recent Quizzes</h2>
        <div className={styles.activityList}>
          {loadingQuizzes ? (
            <div className={styles.emptyState}>Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className={styles.emptyState}>
              No quizzes created yet. Get started by creating one!
            </div>
          ) : (
            [...quizzes]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 5)
              .map((quiz) => (
                <div key={quiz._id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.activityDetails}>
                    <h4>{quiz.title}</h4>
                    <p>
                      {quiz.questions?.length || 0} Questions • Created{" "}
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className={styles.startBtn}
                    onClick={() => navigate("/teacher/quiz-taker")}
                  >
                    Host <ChevronRight size={16} />
                  </button>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
