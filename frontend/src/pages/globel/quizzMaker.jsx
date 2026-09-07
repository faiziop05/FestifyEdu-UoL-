import React from "react";
import styles from "../../styles/pages_css/quizzMaker.module.css";
import { Link } from "react-router-dom";
import { PlusCircle, Library, FileEdit, CheckCircle2 } from "lucide-react";
import QuizList from "../../components/QuizList";
import { useSelector } from "react-redux";

function QuizzMaker() {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Quiz Builder Dashboard</h1>
        <Link to="/teacher/new-quiz" className={styles.createBtn}>
          <PlusCircle size={20} />
          Create New Quiz
        </Link>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.mainCol}>
          <QuizList
            title="Published Quizzes"
            type="published"
            icon={CheckCircle2}
            emptyMessage="You haven't published any quizzes yet."
          />
        </div>
        
        <div className={styles.sideCol}>
          <QuizList
            title="Your Drafts"
            type="draft"
            icon={FileEdit}
            emptyMessage="You don't have any saved drafts."
          />
          
          {!isSuperAdmin && (
            <QuizList
              title="Shared with You"
              type="shared"
              icon={Library}
              emptyMessage="No quizzes have been shared with you by your administrators."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default QuizzMaker;
