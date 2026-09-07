import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import {
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useGetOrganizationsQuery,
} from "../redux/api/superAdminApiSlice";
import { Shield, User, Mail, Lock, Building, X, Loader2 } from "lucide-react";
import styles from "../styles/components_css/AdminModal.module.css";

const AdminModal = ({
  isOpen,
  onClose,
  editingAdmin = null,
  defaultOrgId = "",
  onSuccess,
}) => {
  const { data: orgData } = useGetOrganizationsQuery(undefined, {
    skip: !isOpen,
  });
  const organizations = orgData?.organizations || [];

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateAdmin, { isLoading: isUpdating }] = useUpdateAdminMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const selectedOrgId = watch("organization_id");
  const emailPrefix = watch("email_prefix") || "";

  const selectedOrg = organizations.find(
    (o) => String(o._id) === String(selectedOrgId),
  );
  const rawDomain = selectedOrg?.domain || "";
  const orgDomain = rawDomain
    ? rawDomain.startsWith("@")
      ? rawDomain
      : `@${rawDomain}`
    : "@domain.com";

  useEffect(() => {
    if (isOpen) {
      const activeOrgId = editingAdmin
        ? editingAdmin.organization_id?._id ||
          editingAdmin.organization_id ||
          defaultOrgId ||
          ""
        : defaultOrgId || "";

      let prefix = "";
      if (editingAdmin?.email) {
        prefix = editingAdmin.email.split("@")[0] || "";
      }

      reset({
        name: editingAdmin?.name || "",
        email_prefix: prefix,
        organization_id: activeOrgId,
        status: editingAdmin?.status || "active",
        role: editingAdmin?.role || "admin",
        password: "",
      });
    }
  }, [isOpen, editingAdmin, defaultOrgId, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      const cleanPrefix = (data.email_prefix || "").split("@")[0].trim();
      const targetOrg = organizations.find(
        (o) => String(o._id) === String(data.organization_id),
      );
      const targetDomain = targetOrg?.domain
        ? targetOrg.domain.startsWith("@")
          ? targetOrg.domain
          : `@${targetOrg.domain}`
        : "";

      if (!cleanPrefix) {
        alert("Please enter the email address handle before the @.");
        return;
      }

      const fullEmail = `${cleanPrefix}${targetDomain}`;

      const payload = {
        name: data.name,
        email: fullEmail,
        organization_id: data.organization_id,
        status: data.status || "active",
        role: "admin",
      };

      if (editingAdmin) {
        payload.id = editingAdmin._id;
        if (data.password) payload.password = data.password;
        await updateAdmin(payload).unwrap();
        alert("Administrator updated successfully!");
      } else {
        payload.password = data.password;
        await createAdmin(payload).unwrap();
        alert("Administrator created successfully!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.data?.message || err.message || "Failed to save admin user.");
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <Shield size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                {editingAdmin ? "Edit Administrator" : "Add Administrator"}
              </h3>
              <p className={styles.modalSubtitle}>
                {editingAdmin
                  ? "Update admin account details and permissions."
                  : "Create a new organization admin user."}
              </p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              {/* Full Name */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Full Name</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("name", { required: "Full name is required" })}
                    placeholder="e.g. Jane Doe"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                  />
                </div>
                {errors.name && (
                  <span className={styles.errorMessage}>
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Organization Assignment */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Assigned Organization</label>
                <div className={styles.inputWrapper}>
                  <Building className={styles.inputIcon} size={18} />
                  <select
                    {...register("organization_id", {
                      required: "Organization is required",
                    })}
                    className={`${styles.selectField} ${styles.hasIcon}`}
                  >
                    <option value="">Select Organization...</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.organization_name}{" "}
                        {org.domain ? `(${org.domain})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.organization_id && (
                  <span className={styles.errorMessage}>
                    {errors.organization_id.message}
                  </span>
                )}
              </div>

              {/* Email Address Handle (User types ONLY before @) */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Email Handle (Username)</label>
                <div className={styles.emailInputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("email_prefix", {
                      required: "Email username is required",
                      onChange: (e) => {
                        if (e.target.value.includes("@")) {
                          e.target.value = e.target.value.split("@")[0];
                        }
                      },
                    })}
                    placeholder="e.g. john or admin"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                    style={{
                      paddingRight: orgDomain
                        ? `${Math.max(orgDomain.length * 9.5 + 20, 110)}px`
                        : "120px",
                    }}
                  />
                  <span className={styles.domainAddon}>{orgDomain}</span>
                </div>
                {errors.email_prefix && (
                  <span className={styles.errorMessage}>
                    {errors.email_prefix.message}
                  </span>
                )}
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  Registered Email:{" "}
                  <strong style={{ color: "var(--brand-primary, #6366f1)" }}>
                    {emailPrefix.split("@")[0] || "username"}
                    {orgDomain}
                  </strong>
                </span>
              </div>

              {/* Password */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>
                  Password{" "}
                  {editingAdmin && (
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        fontWeight: "normal",
                      }}
                    >
                      (Leave blank to keep unchanged)
                    </span>
                  )}
                </label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} size={18} />
                  <input
                    type="password"
                    {...register("password", {
                      required: editingAdmin ? false : "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    placeholder={
                      editingAdmin ? "••••••••" : "Enter a strong password"
                    }
                    className={`${styles.inputField} ${styles.hasIcon}`}
                  />
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Status */}
              <div className={styles.inputGroup}>
                <label>Account Status</label>
                <select {...register("status")} className={styles.selectField}>
                  <option value="active">Active (Enabled)</option>
                  <option value="inactive">Inactive (Disabled)</option>
                </select>
              </div>

              {/* Role (Fixed as Organization Admin) */}
              <div className={styles.inputGroup}>
                <label>User Role</label>
                <div
                  className={styles.inputField}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                    color: "var(--brand-primary, #6366f1)",
                    fontWeight: 600,
                  }}
                >
                  <Shield size={16} /> Organization Admin
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
              )}
              {editingAdmin ? "Update Admin" : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default AdminModal;
