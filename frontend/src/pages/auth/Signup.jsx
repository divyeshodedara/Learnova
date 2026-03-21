import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { signupUser } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ModeToggle } from "../../components/mode-toggle";
import styles from "./auth.module.css";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const levels = ["", "weak", "fair", "good", "strong"];
  return { score, label: labels[score], level: levels[score] };
}

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const strength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupUser(formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.themeToggle}>
        <ModeToggle />
      </div>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.logoWrapper}>
              <img src="/logo.svg" alt="Learnova" className="dark:invert" />
            </div>
            <h1 className={styles.authTitle}>Create an account</h1>
            <p className={styles.authSubtitle}>
              Start your learning journey today
            </p>
          </div>
          <div className={styles.authBody}>
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.nameRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>First Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <Input
                      id="signup-firstname"
                      name="firstName"
                      placeholder="John"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Last Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
                    <Input
                      id="signup-lastname"
                      name="lastName"
                      placeholder="Doe"
                      className="pl-10"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formData.password && (
                  <>
                    <div className={styles.strengthBar}>
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={styles.strengthSegment}
                          data-active={i <= strength.score ? "true" : "false"}
                          data-level={strength.level}
                        />
                      ))}
                    </div>
                    <p className={styles.strengthText}>{strength.label}</p>
                  </>
                )}
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <Button
                id="signup-submit"
                className={styles.submitButton + " w-full"}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
          <div className={styles.authFooter}>
            <p className={styles.footerText}>
              Already have an account?
              <Link to="/login" className={styles.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}