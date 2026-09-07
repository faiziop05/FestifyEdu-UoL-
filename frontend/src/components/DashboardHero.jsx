import React from "react";
import { Calendar } from "lucide-react";
import styles from "../styles/components_css/DashboardHero.module.css";

const DashboardHero = ({ title, subtitle, badgeText = "Overview", children }) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={styles.heroSection}>
      <div className={styles.heroTop}>
        {badgeText && <span className={styles.heroBadge}>{badgeText}</span>}
        <div className={styles.dateBadge}>
          <Calendar size={13} />
          <span>{currentDate}</span>
        </div>
      </div>
      <div className={styles.heroContent}>
        <h1 className={styles.welcomeTitle}>{title}</h1>
        {subtitle && <p className={styles.welcomeSubtitle}>{subtitle}</p>}
        {children && <div className={styles.heroActions}>{children}</div>}
      </div>
    </header>
  );
};

export default DashboardHero;
