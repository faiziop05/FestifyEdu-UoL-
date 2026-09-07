import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HelpCircle,
  Calendar,
  LayoutList,
  Loader2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDeleteQuizMutation, useGetQuizzesByTeacherQuery } from "../redux/api/quizApiSlice";
import styles from "../styles/components_css/QuizList.module.css";
import tableStyles from "../styles/components_css/DataTable.module.css";

const QuizList = ({
  type,
  title,
  icon: Icon,
  emptyMessage,
  isStudentView,
}) => {
  const [deleteQuiz] = useDeleteQuizMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading } = useGetQuizzesByTeacherQuery({
    teacherId: user?._id || user?.id,
    type,
    search: debouncedSearch,
    page,
    limit: 10
  }, { skip: !user });

  const quizzes = data?.quizzes || (Array.isArray(data) ? data : []);
  const totalPages = data?.totalPages || 1;

  const handleRowClick = (e, quizId) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (!isStudentView && type === "shared") return; // Cannot edit shared quizzes
    navigate(isStudentView ? `/quiz-taker/${quizId}` : `/teacher/edit-quiz/${quizId}`);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone.",
      )
    ) {
      try {
        await deleteQuiz(id).unwrap();
        alert("Quiz deleted successfully");
      } catch (err) {
        alert("Failed to delete quiz");
      }
    }
  };
  return (
    <div className={styles.quizListContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "8px" }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
          {Icon && <Icon size={24} className={styles.titleIcon} />}
          {title}
        </h2>
        {(!isLoading || debouncedSearch || page > 1) && (
          <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.5rem 1rem 0.5rem 2.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={32} />
        </div>
      ) : quizzes.length === 0 ? (
        <div className={styles.emptyState}>
          <LayoutList size={48} />
          <h3>No Quizzes Found</h3>
          <p>{emptyMessage || "You don't have any quizzes here yet."}</p>
        </div>
      ) : quizzes.length === 0 && debouncedSearch ? (
        <div className={styles.emptyState}>
          <LayoutList size={48} />
          <h3>No matches found</h3>
          <p>Try adjusting your search query.</p>
        </div>
      ) : (
        <>
          <div className={tableStyles.tableContainer}>
            <table className={tableStyles.table}>
            <thead className={tableStyles.tableHead}>
              <tr>
                <th>Quiz Name</th>
                <th>Status</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr 
                  key={quiz._id} 
                  className={tableStyles.tableRow}
                  onClick={(e) => handleRowClick(e, quiz._id)}
                  style={{ cursor: "pointer" }}
                >
                  <td className={tableStyles.tableCell} style={{ fontWeight: 600 }}>{quiz.name}</td>
                  <td className={tableStyles.tableCell}>
                    <span
                      className={`${tableStyles.badge} ${quiz.status === "draft" ? tableStyles.badgeInactive : tableStyles.badgeActive}`}
                    >
                      {quiz.status}
                    </span>
                  </td>
                  <td className={tableStyles.tableCellSecondary}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={16} /> {quiz.questions?.length || 0}
                    </div>
                  </td>
                  <td className={tableStyles.tableCellSecondary}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> {new Date(quiz.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className={tableStyles.tableCell}>
                    <div className={tableStyles.actionGroup}>
                      {isStudentView ? (
                        <Link 
                          to={`/quiz-taker/${quiz._id}`} 
                          style={{ textDecoration: 'none' }}
                        >
                          <button className={tableStyles.primaryActionBtn}>
                            Take Quiz
                          </button>
                        </Link>
                      ) : type === "shared" ? (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          View Only
                        </span>
                      ) : (
                        <>
                          <Link 
                            to={`/teacher/edit-quiz/${quiz._id}`} 
                            style={{ textDecoration: 'none' }}
                          >
                            <button className={tableStyles.primaryActionBtn}>
                              Edit Quiz
                            </button>
                          </Link>
                          <button
                            className={tableStyles.dangerActionBtn}
                            onClick={(e) => handleDelete(e, quiz._id)}
                            title="Delete Quiz"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          
          {totalPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-surface)"
            }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: page === 1 ? "var(--bg-elevated)" : "var(--bg-surface)",
                    color: page === 1 ? "var(--text-secondary)" : "var(--text-primary)",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    background: page === totalPages ? "var(--bg-elevated)" : "var(--bg-surface)",
                    color: page === totalPages ? "var(--text-secondary)" : "var(--text-primary)",
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizList;
