import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import {
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} from "../redux/api/superAdminApiSlice";
import {
  Building,
  Globe,
  MapPin,
  Calendar,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import styles from "../styles/components_css/AdminModal.module.css";

const OrganizationModal = ({
  isOpen,
  onClose,
  editingOrg = null,
  onSuccess,
}) => {
  const [createOrganization, { isLoading: isCreating }] =
    useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] =
    useUpdateOrganizationMutation();

  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isOpen) {
      if (editingOrg) {
        let endDate = "";
        if (editingOrg.subscription_end_date) {
          endDate = new Date(editingOrg.subscription_end_date)
            .toISOString()
            .split("T")[0];
        }
        reset({
          organization_name: editingOrg.organization_name || "",
          domain: editingOrg.domain || "",
          subscription_status: editingOrg.subscription_status || "active",
          address: editingOrg.address || "",
          city: editingOrg.city || "",
          postcode: editingOrg.postcode || "",
          country: editingOrg.country || "",
          subscription_end_date: endDate,
        });
      } else {
        reset({
          organization_name: "",
          domain: "",
          subscription_status: "active",
          address: "",
          city: "",
          postcode: "",
          country: "",
          subscription_end_date: "",
        });
      }
    }
  }, [isOpen, editingOrg, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      let createdOrg = null;
      if (editingOrg) {
        await updateOrganization({
          id: editingOrg._id,
          ...data,
          is_subscribed: data.subscription_status === "active",
        }).unwrap();
        alert("Organization updated successfully!");
      } else {
        createdOrg = await createOrganization({
          ...data,
          subscription_status: data.subscription_status || "active",
          is_subscribed: true,
        }).unwrap();
      }

      if (onSuccess) {
        onSuccess(createdOrg?._id || createdOrg?.organization?._id);
      }
      onClose();
    } catch (err) {
      alert(err.data?.message || err.message || "Failed to save organization.");
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <div className={styles.modalIconBox}>
              <Building size={22} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>
                {editingOrg ? "Edit Organization" : "Add New Organization"}
              </h3>
              <p className={styles.modalSubtitle}>
                {editingOrg
                  ? "Update details and subscription status for this organization."
                  : "Register a new school or district onto the platform."}
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
              {/* Organization Name */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Organization Name</label>
                <div className={styles.inputWrapper}>
                  <Building className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("organization_name", {
                      required: "Organization name is required",
                    })}
                    placeholder="e.g. Springfield High School"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                  />
                </div>
                {errors.organization_name && (
                  <span className={styles.errorMessage}>
                    {errors.organization_name.message}
                  </span>
                )}
              </div>

              {/* Domain */}
              <div className={styles.inputGroup}>
                <label>Email Domain</label>
                <div className={styles.inputWrapper}>
                  <Globe className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("domain", {
                      required: "Domain is required",
                      pattern: {
                        value: /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
                        message:
                          "Please enter a valid domain format (e.g. school.edu)",
                      },
                      onChange: (e) => {
                        // Strip leading @ if user types it
                        if (e.target.value.startsWith("@")) {
                          e.target.value = e.target.value.substring(1);
                        }
                      },
                    })}
                    placeholder="e.g. springfield.edu"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                  />
                </div>
                {errors.domain && (
                  <span className={styles.errorMessage}>
                    {errors.domain.message}
                  </span>
                )}
              </div>

              {/* Subscription Status */}
              <div className={styles.inputGroup}>
                <label>Subscription Status</label>
                <select
                  {...register("subscription_status")}
                  className={styles.selectField}
                >
                  <option value="active">Active (Subscribed)</option>
                  <option value="inactive">Inactive (Suspended)</option>
                </select>
              </div>

              {/* Street Address */}
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Street Address</label>
                <div className={styles.inputWrapper}>
                  <MapPin className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    {...register("address", {
                      required: "Address is required",
                    })}
                    placeholder="e.g. 123 Education Lane"
                    className={`${styles.inputField} ${styles.hasIcon}`}
                  />
                </div>
                {errors.address && (
                  <span className={styles.errorMessage}>
                    {errors.address.message}
                  </span>
                )}
              </div>

              {/* City */}
              <div className={styles.inputGroup}>
                <label>City</label>
                <input
                  type="text"
                  {...register("city", { required: "City is required" })}
                  placeholder="Springfield"
                  className={styles.inputField}
                />
                {errors.city && (
                  <span className={styles.errorMessage}>
                    {errors.city.message}
                  </span>
                )}
              </div>

              {/* Postcode */}
              <div className={styles.inputGroup}>
                <label>Postcode / Zip</label>
                <input
                  type="text"
                  {...register("postcode", {
                    required: "Postcode is required",
                  })}
                  placeholder="12345"
                  className={styles.inputField}
                />
                {errors.postcode && (
                  <span className={styles.errorMessage}>
                    {errors.postcode.message}
                  </span>
                )}
              </div>

              {/* Country */}
              <div className={styles.inputGroup}>
                <label>Country</label>
                <input
                  type="text"
                  {...register("country", { required: "Country is required" })}
                  placeholder="United States"
                  className={styles.inputField}
                />
                {errors.country && (
                  <span className={styles.errorMessage}>
                    {errors.country.message}
                  </span>
                )}
              </div>

              {/* Subscription End Date */}
              <div className={styles.inputGroup}>
                <label>Subscription End Date</label>
                <input
                  type="date"
                  {...register("subscription_end_date")}
                  className={styles.inputField}
                />
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
              {editingOrg ? "Update Organization" : "Create Organization"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default OrganizationModal;
