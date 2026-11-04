import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { PackageIcon, SearchIcon, ClockIcon } from "../../../components/ui/Icons";
import orderService from "../services/order-service";
import "../orders.css";

export default function MyOrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      setError("");
      try {
        const response = await orderService.getMyOrders();
        if (isMounted) {
          setOrders(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not load your orders. Please check backend connection."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case "DELIVERED":
        return "delivered";
      case "IN_TRANSIT":
      case "PICKED_UP":
        return "in-transit";
      case "PENDING":
        return "pending";
      case "CANCELLED":
        return "brand";
      default:
        return "role";
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const query = searchFilter.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.trackingNumber?.toLowerCase().includes(query) ||
      order.dropoffLocation?.toLowerCase().includes(query) ||
      order.pickupLocation?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // Metrics
  const totalCount = orders.length;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inTransitCount = orders.filter(
    (o) => o.status === "IN_TRANSIT" || o.status === "PICKED_UP"
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 16, fontSize: "0.875rem", color: "#64748b" }}>
          <Link to="/dashboard" style={{ color: "#475569", fontWeight: 500, textDecoration: "none" }}>
            Dashboard
          </Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>My Orders</span>
        </div>

        {/* Page Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 className="order-page-title">My Orders</h1>
            <p className="order-page-desc">
              Review and manage all your booked consignments, courier statuses, and tracking details.
            </p>
          </div>

          <Link to="/orders/new" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="md" icon={<PackageIcon size={18} />}>
              + Create New Order
            </Button>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 20 }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* KPI Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Card>
            <div style={{ fontSize: "0.8125rem", color: "#64748b", fontWeight: 600 }}>TOTAL BOOKINGS</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
              {totalCount}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: "0.8125rem", color: "#f59e0b", fontWeight: 600 }}>PENDING DISPATCH</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#f59e0b", marginTop: 4 }}>
              {pendingCount}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: "0.8125rem", color: "#3b82f6", fontWeight: 600 }}>ON THE WAY</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#3b82f6", marginTop: 4 }}>
              {inTransitCount}
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: "0.8125rem", color: "#10b981", fontWeight: 600 }}>DELIVERED</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#10b981", marginTop: 4 }}>
              {deliveredCount}
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card style={{ marginBottom: 24, padding: "16px 20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {/* Status Filter Buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["ALL", "PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"].map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      border: "1px solid",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      backgroundColor:
                        statusFilter === status ? "#0f172a" : "#ffffff",
                      color: statusFilter === status ? "#ffffff" : "#475569",
                      borderColor:
                        statusFilter === status ? "#0f172a" : "#cbd5e1",
                    }}
                  >
                    {status === "ALL" ? "All Orders" : status.replace("_", " ")}
                  </button>
                )
              )}
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <input
                type="text"
                placeholder="Search by tracking # or city..."
                className="form-input"
                style={{ paddingLeft: 34, height: 38, fontSize: "0.875rem" }}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
              <span
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  pointerEvents: "none",
                }}
              >
                <SearchIcon size={16} />
              </span>
            </div>
          </div>
        </Card>

        {/* Orders Table Container */}
        <Card>
          {loading && (
            <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
              <div className="btn-spinner" style={{ width: 28, height: 28, margin: "0 auto 12px" }} />
              <p>Loading your consignments...</p>
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  backgroundColor: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#64748b",
                }}
              >
                <PackageIcon size={28} />
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
                {orders.length === 0
                  ? "No Shipments Booked Yet"
                  : "No Orders Match Your Filter"}
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 20px 0" }}>
                {orders.length === 0
                  ? "Book your first intra-city shipment now and track it live."
                  : "Try selecting another status tab or clear your search input."}
              </p>
              {orders.length === 0 ? (
                <Link to="/orders/new" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="md">
                    + Book Shipment Now
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchFilter("");
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}

          {!loading && filteredOrders.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 16px" }}>Tracking Number</th>
                    <th style={{ padding: "12px 16px" }}>Route (Pickup ➔ Drop-off)</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Courier</th>
                    <th style={{ padding: "12px 16px" }}>Date Booked</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "0.875rem",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "#0f172a" }}>
                        {order.trackingNumber}
                      </td>
                      <td style={{ padding: "14px 16px", maxWidth: 280 }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>
                          {order.dropoffLocation}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                          From: {order.pickupLocation}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Badge variant={getStatusVariant(order.status)} dot={order.status !== "CANCELLED"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "#475569" }}>
                        {order.courier ? (
                          <span style={{ fontWeight: 600 }}>{order.courier.fullName}</span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Awaiting Assignment</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "#64748b" }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          View Details ➔
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
