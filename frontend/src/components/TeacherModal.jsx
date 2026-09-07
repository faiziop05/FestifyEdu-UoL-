import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
} from "../redux/api/adminApiSlice";
import {
  Users,
  User,
  Mail,
  Lock,
  X,
  Loader2,
  GraduationCap,
} from "lucide-react";
import styles from "../styles/components_css/AdminModal.module.css";

const TeacherModal = ({
  isOpen,
  onClose,
  editingTeacher = null,
  userDomain = "",
  selectedOrgId = "",
  onSuccess,
}) => {
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const isLoading = isCreating || isUpdating;

  const domainAddon = userDomain
    ? userDomain.startsWith("@")
      ? userDomain
      : `@${userDomain}`
    : "@school.edu";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const usernameVal = watch("username") || "";

  useEffect(() => {
    if (isOpen) {
      let prefix = "";
      if (editingTeacher?.email) {
        prefix = editingTeacher.email.split("@")[0] || "";
      }

      reset({
        name: editingTeacher?.name || "",
        username: prefix,
        status: editingTeacher?.status || "active",
        password: "",
      });
    }
  }, [isOpen, editingTeacher, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    if (!selectedOrgId) {
      alert("Missing organization ID for your account.");
      return;
    }

    try {
      const cleanUsername = (data.username || "").split("@")[0].trim();
      if (!cleanUsername) {
        alert("Please enter the email username before the @.");
        return;
      }

      const fullEmail = `${cleanUsername}${domainAddon}`;

      const payload = {
        name: data.name,
        email: fullEmail,
        organization_id: selectedOrgId,
        status: data.status || "active",
        role: "teacher",
      };

      if (editingTeacher) {
        payload.id = editingTeacher._id;
        if (data.password) payload.password = data.password;
        await updateTeacher(payload).unwrap();
        alert("Teacher updated successfully!");
      } else {
        payload.password = data.password;
        await createTeacher(payload).unwrap();
        alert("Teacher created successfully!");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert(err.data?.message || err.message || "Failed to save teacher.");
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </h3>
              <p className={styles.modalSubtitle}>
                {editingTeacher
                  ? "Update teacher staff details and access."
                  : "Create a new teacher account for your organization."}
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

              {/* Email Username Handle (User types ONLY before @) */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Email Username Handle</label>
                <div className={styles.emailInputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("username", {
                      required: "Username handle is required",
                      onChange: (e) => {
                        if (e.target.value.includes("@")) {
                          e.target.value = e.target.value.split("@")[0];
                        }
                      },
                    })}
                    placeholder="e.g. jane.doe"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                    style={{
                      paddingRight: domainAddon
                        ? `${Math.max(domainAddon.length * 9.5 + 20, 110)}px`
                        : "120px",
                    }}
                  />
                  <span className={styles.domainAddon}>{domainAddon}</span>
                </div>
                {errors.username && (
                  <span className={styles.errorMessage}>
                    {errors.username.message}
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
                    {usernameVal.split("@")[0] || "username"}
                    {domainAddon}
                  </strong>
                </span>
              </div>

              {/* Password */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>
                  Password{" "}
                  {editingTeacher && (
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
                      required: editingTeacher ? false : "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    placeholder={
                      editingTeacher ? "••••••••" : "Create a strong password"
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
                  <option value="active">Active (Can log in)</option>
                  <option value="inactive">Inactive (Access suspended)</option>
                </select>
              </div>

              {/* Role (Fixed as Teacher) */}
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
                  <GraduationCap size={16} /> Teacher
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
              {editingTeacher ? "Update Teacher" : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default TeacherModal;
