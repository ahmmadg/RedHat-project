import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import {
  PackageIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  AlertCircleIcon,
  TruckIcon,
  ArrowRightIcon,
  ShieldIcon
} from "../../../components/ui/Icons";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: name,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Registration successful! Please sign in with your credentials." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      {/* Left Showcase Hero Pane */}
      <div className="auth-hero-pane">
        <div className="auth-brand">
          <div className="brand-icon-box">
            <PackageIcon size={24} />
          </div>
          <div>
            <div className="brand-title">
              Track<span>Flow</span>
            </div>
            <div className="brand-tagline">Express Logistics Platform</div>
          </div>
        </div>

        <div className="auth-hero-content">
          <h2 className="auth-hero-headline">
            Start tracking parcels with <span>complete visibility</span>.
          </h2>
          <p className="auth-hero-desc">
            Whether you are a merchant shipping hundreds of orders daily or a courier managing your daily delivery runs, TrackFlow simplifies every step from warehouse to door.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: "0.9375rem", color: "#f8fafc", fontWeight: 500 }}>
                Instant shipment creation & automated waybills
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(227, 24, 38, 0.2)",
                  color: "#ff4d5a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: "0.9375rem", color: "#f8fafc", fontWeight: 500 }}>
                Real-time milestone tracking & courier dispatch
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  color: "#60a5fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                }}
              >
                ✓
              </div>
              <span style={{ fontSize: "0.9375rem", color: "#f8fafc", fontWeight: 500 }}>
                Dedicated role dashboards for Couriers, Admins & Clients
              </span>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TruckIcon size={20} style={{ color: "var(--color-primary)" }} />
            <span>Serving thousands of active deliveries across Egypt & MENA</span>
          </div>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-card-box">
          <div className="auth-header">
            <Badge variant="brand" dot={false} style={{ marginBottom: 12 }}>
              Fast Setup
            </Badge>
            <h1>Create your account</h1>
            <p>Join TrackFlow today to manage and monitor your parcels.</p>
          </div>

          {error && (
            <div className="form-alert form-alert-error" role="alert">
              <AlertCircleIcon size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Moustafa Ahmed"
              icon={<UserIcon size={18} />}
              autoComplete="name"
              required
            />

            <Input
              id="register-email"
              label="Work or Personal Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              icon={<MailIcon size={18} />}
              autoComplete="email"
              required
            />

            <Input
              id="register-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              icon={<LockIcon size={18} />}
              autoComplete="new-password"
              minLength={8}
              hint="Must contain at least 8 characters"
              required
            />

            <div style={{ marginTop: 24 }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                icon={<ArrowRightIcon size={18} />}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="auth-footer">
            <p>
              Already registered?{" "}
              <Link to="/login" style={{ fontWeight: 700 }}>
                Sign in here
              </Link>
            </p>
          </div>

          <div
            style={{
              marginTop: 36,
              paddingTop: 18,
              borderTop: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.75rem",
              color: "var(--color-slate-400)",
            }}
          >
            <ShieldIcon size={14} />
            <span>By registering, you agree to our Terms of Service & Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
