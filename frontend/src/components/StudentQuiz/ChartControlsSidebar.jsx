import React from "react";
import { ArrowLeft } from "lucide-react";
import styles from "../../styles/components_css/StudentQuiz/ChartControlsSidebar.module.css";

const ChartControlsSidebar = ({
  handleLeaveQuiz,
  currentQuestion,
  activeChartType,
  setActiveChartType,
  CHART_ICONS
}) => {
  return (
    <aside className={styles.leftSidebar}>
      <div className={styles.sidebarHeader}>
        <button onClick={handleLeaveQuiz} className={styles.backBtn}>
          <ArrowLeft size={18} /> Leave Quiz
        </button>
      </div>
      <div className={styles.sidebarContent}>
        <h3 className={styles.sidebarTitle}>Chart Types</h3>
        <div className={styles.chartList}>
          {Object.keys(CHART_ICONS)
            .filter(
              (type) =>
                !currentQuestion.allowedCharts ||
                currentQuestion.allowedCharts.includes(type),
            )
            .map((type) => {
              const Icon = CHART_ICONS[type];
              return (
                <button
                  key={type}
                  className={`${styles.chartTypeBtn} ${activeChartType === type ? styles.activeChartType : ""}`}
                  onClick={() => setActiveChartType(type)}
                >
                  <Icon size={18} />
                  <span>{type}</span>
                </button>
              );
            })}
        </div>
      </div>
    </aside>
  );
};

export default ChartControlsSidebar;
