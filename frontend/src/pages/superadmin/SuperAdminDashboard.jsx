import React from "react";
import { useSelector } from "react-redux";
import { Building, Users, Database, PenTool, Sparkles } from "lucide-react";
import styles from "../../styles/pages_css/PremiumDashboard.module.css";
import DashboardHero from "../../components/DashboardHero";
import DashboardSection from "../../components/DashboardSection";
import OverviewCard from "../../components/OverviewCard";
import {
  useGetOrganizationsQuery,
  useGetQuizzesQuery,
  useGetSuperAdminDatasetsQuery,
  useGetAdminsQuery,
} from "../../redux/api/superAdminApiSlice";

const SuperAdminDashboard = () => {
  const user = useSelector((state) => state.auth.user);

  const { data: orgData, isLoading: loadingOrgs } = useGetOrganizationsQuery({
    page: 1,
    limit: 100,
  });
  const { data: quizData, isLoading: loadingQuizzes } = useGetQuizzesQuery({
    page: 1,
    limit: 100,
  });
  const { data: datasetData, isLoading: loadingDatasets } =
    useGetSuperAdminDatasetsQuery({ page: 1, limit: 100 });
  const { data: adminsData, isLoading: loadingAdmins } = useGetAdminsQuery({
    page: 1,
    limit: 100,
  });

  const totalOrgs =
    orgData?.totalOrganizations || orgData?.organizations?.length || 0;
  const totalQuizzes = quizData?.totalQuizzes || quizData?.quizzes?.length || 0;
  const totalDatasets =
    datasetData?.totalDatasets || datasetData?.datasets?.length || 0;
  const totalAdmins = Array.isArray(adminsData)
    ? adminsData.length
    : adminsData?.users?.length || 0;

  return (
    <div className={styles.dashboardContainer}>
      <DashboardHero
        title={`Welcome back, ${user?.name || "Super Admin"}! 👋`}
        subtitle="Global platform command center. Monitor platform metrics and access administrative management hubs below."
        badgeText="Super Admin Control"
      />

      <DashboardSection
        title="Platform Command Center"
        icon={Sparkles}
        type="stats"
      >
        <OverviewCard
          icon={Building}
          title="Organizations"
          value={loadingOrgs ? "..." : totalOrgs}
          description="Provision new institutions, domains, and manage system limits."
          badgeText="Manage Orgs"
          path="/super-admin/organizations"
        />
        <OverviewCard
          icon={Users}
          title="Platform Admins"
          value={loadingAdmins ? "..." : totalAdmins}
          description="Create and manage organization administrator accounts."
          badgeText="Manage Admins"
          path="/super-admin/admins"
        />
        <OverviewCard
          icon={PenTool}
          title="Global Quiz Builder"
          value={loadingQuizzes ? "..." : totalQuizzes}
          description="Create master quizzes and grant organization access."
          badgeText="Quiz Builder"
          path="/super-admin/quiz-builder"
        />
        <OverviewCard
          icon={Database}
          title="Global Data Hub"
          value={loadingDatasets ? "..." : totalDatasets}
          description="Import datasets and allocate access to organization admins."
          badgeText="Data Hub"
          path="/super-admin/data"
        />
      </DashboardSection>
    </div>
  );
};

export default SuperAdminDashboard;
