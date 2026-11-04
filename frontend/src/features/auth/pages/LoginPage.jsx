import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import {
  PackageIcon,
  MailIcon,
  LockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  TruckIcon,
  ArrowRightIcon,
  ShieldIcon
} from "../../../components/ui/Icons";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });

      const destination =
        location.state?.from?.pathname ||
        (user?.role === "ADMIN"
          ? "/admin"
          : user?.role === "COURIER"
            ? "/courier"
            : "/dashboard");

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      {/* Left Logistics Showcase Hero Pane */}
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
            Delivering speed, <span>precision</span>, and certainty.
          </h2>
          <p className="auth-hero-desc">
            Empowering modern businesses, merchants, and couriers with real-time route optimization, automated package updates, and enterprise-grade shipment tracking.
          </p>

          {/* Simulated Live Tracking Preview Widget */}
          <div className="tracking-preview-card">
            <div className="tracking-preview-header">
              <div className="tracking-preview-id">
                <TruckIcon size={18} style={{ color: "var(--color-primary)" }} />
                <span>BST-9842-EG</span>
              </div>
              <Badge variant="in-transit" dot={true}>
                Out For Delivery
              </Badge>
            </div>

            <div className="tracking-preview-steps">
              <div className="preview-step done">
                <div className="preview-step-icon">✓</div>
                <div>
                  <div className="preview-step-title">Cairo Sorting Facility</div>
                  <div className="preview-step-subtitle">Dispatched • 08:30 AM</div>
                </div>
              </div>
              <div className="preview-step active">
                <div className="preview-step-icon">●</div>
                <div>
                  <div className="preview-step-title">Courier On Route</div>
                  <div className="preview-step-subtitle">Estimated Delivery: 2:00 PM - 4:00 PM</div>
                </div>
              </div>
              <div className="preview-step pending">
                <div className="preview-step-icon">○</div>
                <div>
                  <div className="preview-step-title">Customer Destination</div>
                  <div className="preview-step-subtitle">Nasr City, Cairo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-hero-footer">
          <div className="hero-metric">
            <span className="hero-metric-val">99.8%</span>
            <span className="hero-metric-lbl">On-Time Arrival</span>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <div className="hero-metric">
            <span className="hero-metric-val">15M+</span>
            <span className="hero-metric-lbl">Parcels Handled</span>
          </div>
          <div style={{ width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.15)" }} />
          <div className="hero-metric">
            <span className="hero-metric-val">24/7</span>
            <span className="hero-metric-lbl">Live GPS Tracking</span>
          </div>
        </div>
      </div>

      {/* Right Authentication Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-card-box">
          <div className="auth-header">
            <Badge variant="brand" dot={false} style={{ marginBottom: 12 }}>
              Secure Portal
            </Badge>
            <h1>Welcome back</h1>
            <p>Access your dashboard to track and manage parcel deliveries.</p>
          </div>

          {successMessage && (
            <div className="form-alert form-alert-success" role="status">
              <CheckCircleIcon size={20} />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="form-alert form-alert-error" role="alert">
              <AlertCircleIcon size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@company.com"
              icon={<MailIcon size={18} />}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              icon={<LockIcon size={18} />}
              autoComplete="current-password"
              required
            />

            <div style={{ marginBottom: 24, marginTop: -8, textAlign: "right" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)" }}>
                Forgot password? Contact system administrator.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={<ArrowRightIcon size={18} />}
            >
              Sign In to Account
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" style={{ fontWeight: 700 }}>
                Create one now
              </Link>
            </p>
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 20,
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
            <span>256-bit encrypted SSL connection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
