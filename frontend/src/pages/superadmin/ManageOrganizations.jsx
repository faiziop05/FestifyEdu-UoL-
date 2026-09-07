import React, { useState } from "react";
import {
  useGetOrganizationsQuery,
  useDeleteOrganizationMutation,
} from "../../redux/api/superAdminApiSlice";
import { Building, Plus, Trash2, Edit2, Users } from "lucide-react";
import ManagementHeader from "../../components/ManagementHeader";
import DataTable from "../../components/DataTable";
import OrganizationModal from "../../components/OrganizationModal";
import StatusBadge from "../../components/StatusBadge";
import Pagination from "../../components/Pagination";
import tableStyles from "../../styles/components_css/DataTable.module.css";
import pageStyles from "../../styles/pages_css/PremiumDashboard.module.css";
import { useNavigate } from "react-router-dom";

const ManageOrganizations = () => {
  const [deleteOrganization] = useDeleteOrganizationMutation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetOrganizationsQuery({
    search: searchTerm,
    page,
    limit: 10,
  });
  const totalPages = data?.totalPages || 1;

  const [editingOrg, setEditingOrg] = useState(null);

  const handleAddClick = () => {
    setEditingOrg(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (org) => {
    setEditingOrg(org);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (createdOrgId) => {
    refetch();
    if (createdOrgId && !editingOrg) {
      if (
        window.confirm(
          "Organization added successfully! Would you like to create an Admin user for this organization now?",
        )
      ) {
        navigate(`/super-admin/admins?orgId=${createdOrgId}`);
      }
    }
  };

  if (isLoading)
    return (
      <div style={{ padding: "2rem", color: "var(--text-white)" }}>
        Loading organizations...
      </div>
    );

  const organizations = data?.organizations || [];

  return (
    <div className={pageStyles.dashboardContainer}>
      <ManagementHeader
        title="Manage Organizations"
        subtitle="Global directory of all organizations registered on the platform. Add new districts, update subscriptions, or suspend access."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={handleAddClick}
        addButtonText="Add Organization"
      />

      <DataTable
        columns={[
          { header: "Organization Name" },
          { header: "Domain" },
          { header: "City" },
          { header: "Country" },
          { header: "Status" },
          { header: "End Date" },
          { header: "Actions", align: "right" },
        ]}
        data={organizations}
        isLoading={isLoading}
        emptyMessage="No organizations found matching your criteria."
        renderRow={(org) => (
          <tr key={org._id} className={tableStyles.tableRow}>
            <td className={tableStyles.tableCell}>{org.organization_name}</td>
            <td className={tableStyles.tableCell}>{org.domain}</td>
            <td className={tableStyles.tableCell}>{org.city}</td>
            <td className={tableStyles.tableCell}>{org.country}</td>
            <td className={tableStyles.tableCell}>
              <StatusBadge status={org.subscription_status} />
            </td>
            <td className={tableStyles.tableCell}>
              {org.subscription_end_date
                ? new Date(org.subscription_end_date).toLocaleDateString()
                : "N/A"}
            </td>
            <td
              className={tableStyles.tableCell}
              style={{ textAlign: "right" }}
            >
              <div className={tableStyles.actionGroup}>
                <button
                  className={tableStyles.primaryActionBtn}
                  style={{
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "var(--blueAccent)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                  }}
                  onClick={() =>
                    navigate(`/super-admin/admins?orgId=${org._id}`)
                  }
                  title="Manage Organization Users & Admins"
                >
                  <Users size={16} />
                </button>
                <button
                  className={tableStyles.primaryActionBtn}
                  onClick={() => handleEditClick(org)}
                  title="Edit Organization"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className={tableStyles.dangerActionBtn}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${org.organization_name}? This action cannot be undone.`,
                      )
                    ) {
                      deleteOrganization(org._id)
                        .unwrap()
                        .then(() => {
                          alert("Organization deleted!");
                          refetch();
                        })
                        .catch((err) =>
                          alert(
                            err.data?.message ||
                              "Failed to delete organization",
                          ),
                        );
                    }
                  }}
                  title="Delete Organization"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Organization Add/Edit Modal */}
      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingOrg={editingOrg}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default ManageOrganizations;
