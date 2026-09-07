import React, { useState, useEffect } from "react";
import {
  useGetTeachersQuery,
  useDeleteTeacherMutation,
} from "../../redux/api/adminApiSlice";
import { Users, Trash2, Edit2 } from "lucide-react";
import pageStyles from "../../styles/pages_css/PremiumDashboard.module.css";
import { useSelector } from "react-redux";
import ManagementHeader from "../../components/ManagementHeader";
import DataTable from "../../components/DataTable";
import TeacherModal from "../../components/TeacherModal";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import tableStyles from "../../styles/components_css/DataTable.module.css";

const ManageTeachers = () => {
  const { user } = useSelector((state) => state.auth);
  const selectedOrgId = user?.organization_id;
  const userDomain = user?.email ? user.email.split("@")[1] : "";

  const [deleteTeacher] = useDeleteTeacherMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data, isLoading, refetch } = useGetTeachersQuery(
    { orgId: selectedOrgId, page, limit: 10, search: debouncedSearch },
    { skip: !selectedOrgId },
  );

  const totalPages = data?.totalPages || 1;

  const [editingTeacher, setEditingTeacher] = useState(null);

  const handleAddClick = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this teacher?")) {
      try {
        await deleteTeacher(id).unwrap();
        alert("Removed successfully");
        refetch();
      } catch (err) {
        alert("Failed to remove");
      }
    }
  };

  const rawData = data?.users || data?.teachers || data || [];
  const teachers = Array.isArray(rawData) ? rawData : [];

  return (
    <div className={pageStyles.dashboardContainer}>
      <ManagementHeader
        title="Manage Teachers"
        subtitle="Manage the teaching staff for your organization. You can create new accounts, modify details, or remove access."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        addButtonText="Add Teacher"
      />

      <DataTable
        columns={[
          { header: "Name" },
          { header: "Email" },
          { header: "Status" },
          { header: "Actions", align: "right" },
        ]}
        data={teachers}
        isLoading={isLoading}
        emptyMessage="No teachers found matching your criteria."
        renderRow={(teacher) => (
          <tr key={teacher._id} className={tableStyles.tableRow}>
            <td className={tableStyles.tableCell}>{teacher.name}</td>
            <td className={tableStyles.tableCell}>{teacher.email}</td>
            <td className={tableStyles.tableCell}>
              <StatusBadge status={teacher.status || "active"} />
            </td>
            <td
              className={tableStyles.tableCell}
              style={{ textAlign: "right" }}
            >
              <div className={tableStyles.actionGroup}>
                <button
                  className={tableStyles.primaryActionBtn}
                  onClick={() => handleEditClick(teacher)}
                  title="Edit Teacher"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className={tableStyles.dangerActionBtn}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to remove this teacher?",
                      )
                    ) {
                      deleteTeacher(teacher._id)
                        .unwrap()
                        .then(() => {
                          alert("Teacher removed!");
                          refetch();
                        })
                        .catch((err) =>
                          alert(
                            err.data?.message || "Failed to remove teacher",
                          ),
                        );
                    }
                  }}
                  title="Remove Teacher"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Teacher Add/Edit Modal */}
      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTeacher={editingTeacher}
        userDomain={userDomain}
        selectedOrgId={selectedOrgId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default ManageTeachers;
