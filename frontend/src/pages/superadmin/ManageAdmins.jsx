import React, { useState } from "react";
import {
  useGetAdminsQuery,
  useDeleteAdminMutation,
  useGetOrganizationsQuery,
} from "../../redux/api/superAdminApiSlice";
import { Users, Plus, Trash2, Edit2, Building, Shield } from "lucide-react";
import ManagementHeader from "../../components/ManagementHeader";
import DataTable from "../../components/DataTable";
import AdminModal from "../../components/AdminModal";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import tableStyles from "../../styles/components_css/DataTable.module.css";
import pageStyles from "../../styles/pages_css/PremiumDashboard.module.css";
import { useSearchParams, useNavigate } from "react-router-dom";

const ManageAdmins = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedOrgId = searchParams.get("orgId") || "";

  const { data: orgData } = useGetOrganizationsQuery();
  const organizations = orgData?.organizations || [];

  const { data, isLoading, refetch } = useGetAdminsQuery({
    organization_id: selectedOrgId || undefined,
    page: 1,
    limit: 50,
  });

  const [deleteAdmin] = useDeleteAdminMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const totalPages = 1;

  const [editingAdmin, setEditingAdmin] = useState(null);

  const handleAddClick = () => {
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this admin?")) {
      try {
        await deleteAdmin(id).unwrap();
        alert("Removed successfully");
        refetch();
      } catch (err) {
        alert("Failed to remove");
      }
    }
  };

  const rawData = data?.admins || data || [];
  const adminArr = Array.isArray(rawData) ? rawData : [];
  const admins = adminArr.filter(
    (item) =>
      !searchTerm ||
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.email &&
        item.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className={pageStyles.dashboardContainer}>
      <ManagementHeader
        title="Manage Organization Admins"
        subtitle="Manage the administrators for all organizations. Assign them to specific districts and control their access."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        addButtonText="Add Admin"
      />

      {/* Organization Selector Bar */}
      <div className={pageStyles.filterBar}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Building size={20} color="var(--brand-primary)" />
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            Filter by Organization:
          </span>
        </div>
        <select
          value={selectedOrgId}
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              setSearchParams({ orgId: val });
            } else {
              setSearchParams({});
            }
          }}
          className={pageStyles.filterSelect}
        >
          <option value="">All Organizations (Show All Admins)</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.organization_name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={[
          { header: "Name" },
          { header: "Email" },
          { header: "Organization" },
          { header: "Role" },
          { header: "Status" },
          { header: "Actions", align: "right" },
        ]}
        data={admins}
        isLoading={isLoading}
        emptyMessage="No administrators found matching your criteria."
        renderRow={(admin) => (
          <tr key={admin._id} className={tableStyles.tableRow}>
            <td className={tableStyles.tableCell}>{admin.name}</td>
            <td className={tableStyles.tableCell}>{admin.email}</td>
            <td className={tableStyles.tableCell}>
              {admin.organization_id?.organization_name || "Unassigned"}
            </td>
            <td className={tableStyles.tableCell}>
              <StatusBadge status={admin.role} type="role" />
            </td>
            <td className={tableStyles.tableCell}>
              <StatusBadge status={admin.status} />
            </td>
            <td
              className={tableStyles.tableCell}
              style={{ textAlign: "right" }}
            >
              <div className={tableStyles.actionGroup}>
                <button
                  className={tableStyles.primaryActionBtn}
                  onClick={() => handleEditClick(admin)}
                  title="Edit Admin"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className={tableStyles.dangerActionBtn}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to remove this administrator?",
                      )
                    ) {
                      deleteAdmin(admin._id)
                        .unwrap()
                        .then(() => {
                          alert("Admin removed!");
                          refetch();
                        })
                        .catch((err) =>
                          alert(err.data?.message || "Failed to remove admin"),
                        );
                    }
                  }}
                  title="Remove Admin"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Admin Add/Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAdmin={editingAdmin}
        defaultOrgId={selectedOrgId}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default ManageAdmins;
