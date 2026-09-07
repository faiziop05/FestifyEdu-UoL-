import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../../redux/slices/authSlice";
import { useLoginMutation } from "../../redux/api/authApiSlice";
import Header from "../../components/Header";
import styles from "../../styles/pages_css/login.module.css"; // Import premium styles

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginApi, { isLoading }] = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      const result = await loginApi({
        email: data.Email,
        password: data.Password,
      }).unwrap();
      dispatch(
        loginSuccess({
          user: result.user,
          token: result.token,
          role: result.user.role,
        }),
      );

      const pathRole = result.user.role.replace("_", "-");
      navigate(`/${pathRole}/dashboard`);
    } catch (err) {
      console.error("Failed to login:", err);
      alert(err.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ height: "100vh" }}>
      <Header variant="auth" />
      <div className={styles["login-container"]}>
        <div className={styles["login-card"]}>
          <div className={styles["login-header"]}>
            <h2>Welcome Back</h2>
            <p>Please enter your details to sign in.</p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className={styles["login-form"]}
          >
            <div className={styles["input-group"]}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register("Email", { required: "Email is required" })}
                className={errors.Email ? styles["input-error"] : ""}
              />
              {errors.Email && (
                <span className={styles["error-text"]}>
                  {errors.Email.message}
                </span>
              )}
            </div>

            <div className={styles["input-group"]}>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register("Password", { required: "Password is required" })}
                className={errors.Password ? styles["input-error"] : ""}
              />
              {errors.Password && (
                <span className={styles["error-text"]}>
                  {errors.Password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={styles["login-button"]}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className={styles["divider"]}>
            <span>OR</span>
          </div>

          <button
            type="button"
            className={styles["student-button"]}
            onClick={() => navigate("/student/join")}
          >
            Join a Classroom as Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
