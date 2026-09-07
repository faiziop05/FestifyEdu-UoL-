import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGetStudentPerformanceDetailQuery } from "../../redux/api/performanceApiSlice";
import DashboardHero from "../../components/DashboardHero";
import styles from "../../styles/pages_css/StudentPerformanceDetail.module.css";
import {
  PerformanceDetailLoadingState,
  PerformanceDetailErrorState,
  PerformanceDetailEmptyState,
} from "../../components/StudentPerformanceDetail/PerformanceDetailStatusStates";
import SessionHistoryCard from "../../components/StudentPerformanceDetail/SessionHistoryCard";

const StudentPerformanceDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetStudentPerformanceDetailQuery(studentId);
  const sessions = response?.data || [];

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back to Overview
      </button>

      <DashboardHero
        title={`Roll Number: ${studentId}`}
        subtitle="Detailed session and quiz response history"
        badgeText="Student Details"
      />

      {isLoading ? (
        <PerformanceDetailLoadingState />
      ) : isError ? (
        <PerformanceDetailErrorState refetch={refetch} />
      ) : sessions.length === 0 ? (
        <PerformanceDetailEmptyState />
      ) : (
        sessions.map((session) => (
          <SessionHistoryCard key={session._id} session={session} />
        ))
      )}
    </div>
  );
};

export default StudentPerformanceDetail;
