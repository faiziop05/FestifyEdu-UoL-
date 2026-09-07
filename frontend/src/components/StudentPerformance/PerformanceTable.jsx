import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import styles from "../../styles/components_css/StudentPerformance/PerformanceTable.module.css";

const PerformanceTable = ({
  students,
  searchTerm,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  navigate
}) => {
  const getScoreClass = (score) => {
    if (score >= 80) return styles.scoreHigh;
    if (score >= 50) return styles.scoreMedium;
    return styles.scoreLow;
  };

  const filteredStudents = students.filter((student) =>
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Sessions Attended</th>
              <th>Quizzes Taken</th>
              <th>Average Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.map((student) => (
              <tr
                key={student.rollNumber}
                className={styles.clickableRow}
                onClick={() =>
                  navigate(`/teacher/student-performance/${student.rollNumber}`)
                }
              >
                <td>
                  <span className={styles.boldRollNumber}>
                    {student.rollNumber}
                  </span>
                </td>
                <td>{student.sessionsAttended}</td>
                <td>{student.quizzesTaken}</td>
                <td>
                  <span
                    className={`${styles.scoreBadge} ${getScoreClass(
                      student.averageScore || 0
                    )}`}
                  >
                    {student.averageScore !== null
                      ? `${student.averageScore}%`
                      : "N/A"}
                  </span>
                </td>
                <td className={styles.actionCell}>
                  <ChevronRight className={styles.actionIcon} size={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= totalPages}
            className={styles.pageButton}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default PerformanceTable;
