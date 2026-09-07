import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateProfileMutation } from "../../redux/api/authApiSlice";
import { updateUser } from "../../redux/slices/authSlice";
import { User, Lock, Mail, Save, AlertCircle, Shield } from "lucide-react";
import styles from "../../styles/pages_css/Profile.module.css";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const result = await updateProfile(formData).unwrap();

      // Update Redux state with new user info
      dispatch(updateUser(result.user));

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Clear password field after successful update
      setFormData((prev) => ({ ...prev, password: "" }));

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.data?.message || "Failed to update profile. Please try again.",
      });
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileContent}>
        <div className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <div className={styles.avatarCircle}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className={styles.headerInfo}>
              <h2>{user?.name}</h2>
              <span className={styles.roleTag}>
                <Shield size={14} />
                {user?.role === "super_admin"
                  ? "Super Admin"
                  : user?.role === "admin"
                    ? "Organization Admin"
                    : "Teacher"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.profileForm}>
            {message.text && (
              <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                <AlertCircle size={18} />
                <span>{message.text}</span>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Full Name</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>
                Email Address{" "}
                <span className={styles.lockedText}>(Locked)</span>
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  title="Contact your administrator to change your email."
                />
              </div>
            </div>

            <div className={styles.divider}>
              <span>Security</span>
            </div>

            <div className={styles.formGroup}>
              <label>
                New Password{" "}
                <span className={styles.optionalText}>(Optional)</span>
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  minLength="6"
                />
              </div>
              <p className={styles.helpText}>
                Must be at least 6 characters long.
              </p>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
