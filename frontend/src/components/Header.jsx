import React from "react";
import styles from "../styles/components_css/Header.module.css";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { LogOut } from "lucide-react";

const Header = ({ variant = "teacher", hideNav = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Provide fallback so it doesn't crash if used outside Redux provider (e.g. auth pages)
  const authState = useSelector((state) => state.auth || {});
  const user = authState.user;

  const handleSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  const profilePath =
    user?.role === "super_admin"
      ? "/super-admin/profile"
      : user?.role === "admin"
        ? "/admin/profile"
        : "/teacher/profile";

  const helpPath =
    variant === "auth"
      ? "/auth/help"
      : user?.role === "super_admin"
        ? "/super-admin/help"
        : user?.role === "admin"
          ? "/admin/help"
          : user?.role === "teacher"
            ? "/teacher/help"
            : "/student/help";

  return (
    <header
      className={`${styles["main-header"]} ${variant === "auth" ? styles["auth-header"] : ""}`}
    >
      <div className={styles["header-brand"]}>
        <h1>
          Festify<span className={styles["brand-accent"]}>Edu</span>
        </h1>
      </div>

      {variant === "teacher" && !hideNav && (
        <nav className={styles["header-nav"]}>
          <a href="/teacher/dashboard" className={styles["nav-link"]}>
            Dashboard
          </a>
          <a href="/teacher/quizzes" className={styles["nav-link"]}>
            Quizzes
          </a>
          <a href="/teacher/rooms" className={styles["nav-link"]}>
            Classrooms
          </a>
        </nav>
      )}

      <div className={styles["header-actions"]}>
        {variant === "teacher" ? (
          <div className={styles["profile-menu"]}>
            <Link to={helpPath} className={styles["help-link"]}>
              Need Help?
            </Link>
            <div className={styles["avatar"]}>
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
            <button className={styles["logout-btn"]} onClick={handleSignOut}>
              Logout
            </button>
          </div>
        ) : variant === "dashboardHeader" ? (
          <>
            <ThemeToggle variant="header" />
            <Link to={helpPath} className={styles["help-link"]} style={{ marginLeft: '1rem', marginRight: '0.5rem' }}>
              Need Help?
            </Link>
            <div className={styles["mobile-only-actions"]}>
              <Link to={profilePath} className={styles["avatar-link"]}>
                <div className={styles["avatar"]}>
                  {user?.name?.charAt(0)?.toUpperCase() || "T"}
                </div>
              </Link>
              <button
                className={styles["logout-icon-btn"]}
                onClick={handleSignOut}
              >
                <LogOut size={20} color="var(--error-color)" />
              </button>
            </div>
          </>
        ) : (
          <Link to={helpPath} className={styles["help-link"]}>
            Need Help?
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
