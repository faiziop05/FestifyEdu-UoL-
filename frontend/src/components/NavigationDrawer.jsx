import styles from "../styles/components_css/NavigationDrawer.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import {
  LayoutDashboard,
  PenTool,
  BrainCircuit,
  Database,
  Users,
  Building,
  Shield,
  LogOut,
  User,
  TrendingUp,
} from "lucide-react";

const getSidebarOptions = (role) => {
  const options = [];
  if (role === "super_admin") {
    options.push({
      title: "Dashboard",
      path: "/super-admin/dashboard",
      icon: LayoutDashboard,
    });
    options.push({
      title: "Manage Orgs",
      path: "/super-admin/organizations",
      icon: Building,
    });
    options.push({
      title: "Manage Admins",
      path: "/super-admin/admins",
      icon: Shield,
    });

    options.push({
      title: "Quiz Builder",
      path: "/super-admin/quiz-builder",
      icon: PenTool,
    });
    options.push({
      title: "Data Hub",
      path: "/super-admin/data",
      icon: Database,
    });
  } else if (role === "admin") {
    options.push({
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    });
    options.push({
      title: "Manage Teachers",
      path: "/admin/teachers",
      icon: Users,
    });
    options.push({
      title: "Quiz Builder",
      path: "/teacher/quiz-builder",
      icon: PenTool,
    });
    options.push({ title: "Data Hub", path: "/teacher/data", icon: Database });
  } else {
    // Default teacher
    options.push({
      title: "Dashboard",
      path: "/teacher/dashboard",
      icon: LayoutDashboard,
    });
    options.push({
      title: "Quiz Builder",
      path: "/teacher/quiz-builder",
      icon: PenTool,
    });
    options.push({
      title: "Quiz Taker",
      path: "/teacher/quiz-taker",
      icon: BrainCircuit,
    });
    options.push({ title: "Data Hub", path: "/teacher/data", icon: Database });
    options.push({
      title: "Student Performance",
      path: "/teacher/student-performance",
      icon: TrendingUp,
    });
  }

  return options;
};

function NavigationDrawer() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const options = getSidebarOptions(user?.role);

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

  return (
    <div className={styles.container}>
      <Link
        to={profilePath}
        className={styles.profileSection}
      >
        <div className={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || "T"}
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.name || "Teacher User"}</p>
          <p className={styles.userRole}>
            {user?.role?.replace("_", " ") || "Teacher"}
          </p>
        </div>
      </Link>
      <div className={styles.navItems}>
        {options.map((option, key) => {
          const isActive =
            location.pathname === option.path ||
            (location.pathname.startsWith(option.path + "/") &&
              option.path !== "/");
          const Icon = option.icon;

          return (
            <Link
              to={option.path}
              key={key}
              className={`${styles.navItem} ${isActive ? styles.activeItem : ""}`}
            >
              <div
                className={`${styles.iconContainer} ${
                  isActive ? styles.activeIcon : ""
                }`}
              >
                <Icon size={20} />
              </div>
              <span className={styles.navText}>{option.title}</span>
            </Link>
          );
        })}
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={`${styles.navItem} ${styles.signOutBtn}`}
        >
          <div className={styles.iconContainer}>
            <LogOut size={20} />
          </div>
          <span className={styles.navText}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default NavigationDrawer;
