import React from "react";
import { useSelector } from "react-redux";
import { Users, PenTool, Database, Sparkles } from "lucide-react";
import styles from "../../styles/pages_css/PremiumDashboard.module.css";
import DashboardHero from "../../components/DashboardHero";
import DashboardSection from "../../components/DashboardSection";
import OverviewCard from "../../components/OverviewCard";
import {
  useGetTeachersQuery,
  useGetAdminQuizzesQuery,
  useGetAdminDatasetsQuery,
} from "../../redux/api/adminApiSlice";

const AdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const orgId = user?.organization_id?._id || user?.organization_id;

  const { data: teachersData, isLoading: loadingTeachers } =
    useGetTeachersQuery({ orgId, limit: 100 }, { skip: !orgId });
  const { data: quizzesData, isLoading: loadingQuizzes } =
    useGetAdminQuizzesQuery({ page: 1, limit: 100 });
  const { data: datasetsData, isLoading: loadingDatasets } =
    useGetAdminDatasetsQuery({ page: 1, limit: 100 });

  const totalTeachers = Array.isArray(teachersData)
    ? teachersData.length
    : teachersData?.users?.length || teachersData?.teachers?.length || 0;
  const totalQuizzes = quizzesData?.quizzes?.length || 0;
  const totalDatasets = datasetsData?.datasets?.length || 0;

  return (
    <div className={styles.dashboardContainer}>
      <DashboardHero
        title={`Welcome back, ${user?.name || "Admin"}! 👋`}
        subtitle="Organization administration panel. Monitor teaching staff, manage learning modules, and allocate data resources across your institution."
        badgeText="Organization Control"
      />

      <DashboardSection
        title="Organization Command Center"
        icon={Sparkles}
        type="stats"
      >
        <OverviewCard
          icon={Users}
          title="Manage Teachers"
          value={loadingTeachers ? "..." : totalTeachers}
          description="Register, edit, and manage teaching staff in your organization."
          badgeText="Teaching Staff"
          path="/admin/teachers"
        />
        <OverviewCard
          icon={PenTool}
          title="Quiz Builder"
          value={loadingQuizzes ? "..." : totalQuizzes}
          description="Create quizzes and manage teacher access rules."
          badgeText="Quizzes"
          path="/teacher/quiz-builder"
        />
        <OverviewCard
          icon={Database}
          title="Organization Data Hub"
          value={loadingDatasets ? "..." : totalDatasets}
          description="Import datasets and grant permission to teaching staff."
          badgeText="Data Hub"
          path="/teacher/data"
        />
      </DashboardSection>
    </div>
  );
};

export default AdminDashboard;
