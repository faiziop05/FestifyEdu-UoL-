import React, { useState } from "react";
import { useGetStudentPerformanceQuery } from "../../redux/api/performanceApiSlice";
import DashboardHero from "../../components/DashboardHero";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/pages_css/StudentPerformance.module.css";
import {
  PerformanceLoadingState,
  PerformanceErrorState,
  PerformanceEmptyState,
} from "../../components/StudentPerformance/PerformanceStatusStates";
import PerformanceSearch from "../../components/StudentPerformance/PerformanceSearch";
import PerformanceTable from "../../components/StudentPerformance/PerformanceTable";

const StudentPerformance = () => {
  const navigate = useNavigate();
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetStudentPerformanceQuery();
  const students = response?.data || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  return (
    <div className={styles.container}>
      <DashboardHero
        title="Student Performance"
        subtitle="Overview of student participation and scores across all your sessions."
        badgeText="Analytics"
      />

      <div className={styles.card}>
        {isLoading ? (
          <PerformanceLoadingState />
        ) : isError ? (
          <PerformanceErrorState refetch={refetch} />
        ) : students.length === 0 ? (
          <PerformanceEmptyState />
        ) : (
          <div className={styles.contentWrapper}>
            <PerformanceSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={setCurrentPage}
            />

            <PerformanceTable
              students={students}
              searchTerm={searchTerm}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              itemsPerPage={itemsPerPage}
              navigate={navigate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPerformance;
