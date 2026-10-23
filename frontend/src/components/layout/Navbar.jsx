import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PackageIcon, LogoutIcon, UserIcon } from "../ui/Icons";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  const getRoleVariant = (role) => {
    switch (role) {
      case "ADMIN":
        return "brand";
      case "COURIER":
        return "in-transit";
      default:
        return "role";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="app-navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="nav-brand">
          <div className="brand-icon-box" style={{ width: 38, height: 38 }}>
            <PackageIcon size={20} />
          </div>
          <div>
            <div className="nav-brand-text">
              Track<span>Flow</span>
            </div>
            <div className="brand-tagline">Logistics Express</div>
          </div>
        </Link>

        <div className="nav-user-controls">
          {isAuthenticated && (
            <>
              <div className="user-profile-chip">
                <div className="user-avatar-initial">
                  {getInitials(user?.name || user?.fullName || user?.email)}
                </div>
                <div>
                  <div className="user-meta-name">
                    {user?.name || user?.fullName || user?.email || "User"}
                  </div>
                  <div style={{ marginTop: 2 }}>
                    <Badge variant={getRoleVariant(user?.role)} dot={false}>
                      {user?.role || "CUSTOMER"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                icon={<LogoutIcon size={16} />}
                onClick={logout}
                title="Log out from your account"
              >
                Log out
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <Link to="/login">
              <Button variant="primary" size="sm" icon={<UserIcon size={16} />}>
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
