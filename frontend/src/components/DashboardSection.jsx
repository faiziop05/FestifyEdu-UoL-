import React from "react";
import styles from "../styles/components_css/DashboardSection.module.css";

const DashboardSection = ({ title, icon: Icon, children, type = "stats" }) => {
  return (
    <section>
      <h2 className={styles.sectionTitle}>
        {Icon && <Icon size={20} color="var(--brand-primary)" />}
        {title}
      </h2>
      <div className={type === "stats" ? styles.statsGrid : styles.actionsGrid}>
        {children}
      </div>
    </section>
  );
};

export default DashboardSection;
