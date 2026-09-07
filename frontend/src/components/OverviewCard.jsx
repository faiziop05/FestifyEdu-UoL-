import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import styles from "../styles/components_css/OverviewCard.module.css";

const OverviewCard = ({ icon: Icon, title, value, description, badgeText, path }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.overviewCard} onClick={() => navigate(path)}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          {Icon && <Icon size={22} />}
        </div>
        <div className={styles.headerRight}>
          {badgeText && <span className={styles.badge}>{badgeText}</span>}
          <div className={styles.arrowWrapper}>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <div className={styles.cardBody}>
        {value !== undefined && value !== null && (
          <h2 className={styles.value}>{value}</h2>
        )}
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
};

export default OverviewCard;
