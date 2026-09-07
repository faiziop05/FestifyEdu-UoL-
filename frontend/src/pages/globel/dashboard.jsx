import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavigationDrawer from "../../components/NavigationDrawer";
import Header from "../../components/Header";
import styles from "../../styles/pages_css/teacherDashboard.module.css";

function DashboardLayout() {
  return (
    <div className={styles.container}>
      <NavigationDrawer />
      <div className={styles.mainContent}>
        <Header variant="dashboardHeader" />
        <div className={styles.pageWrapper}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
