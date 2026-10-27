import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import orderService from "../services/order-service";
import {
  PackageIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
  UserIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ShieldIcon,
} from "../../../components/ui/Icons";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrder() {
      setLoading(true);
      setError("");
      try {
        const response = await orderService.getOrderById(id);
        if (isMounted) {
          setOrder(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load order details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleCancelOrder() {
    setCancelling(true);
    setError("");
    try {
      const response = await orderService.cancelOrder(id);
      setOrder(response.data);
      setShowCancelConfirm(false);
      setSuccessMessage("Order has been successfully cancelled.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel order. Please refresh and try again."
      );
      setShowCancelConfirm(false);
    } finally {
      setCancelling(false);
    }
  }

  function getStatusVariant(status) {
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
  }

  function formatDate(isoString) {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "0.875rem",
              color: "var(--color-slate-500)",
            }}
          >
            <Link to="/dashboard" style={{ color: "var(--color-slate-600)", fontWeight: 500 }}>
              Dashboard
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-slate-600)" }}>Orders</span>
            <span>/</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              {order ? order.trackingNumber : "Order Details"}
            </span>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div
            className="form-alert form-alert-success"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            role="status"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircleIcon size={20} />
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="form-alert form-alert-error" role="alert">
            <AlertCircleIcon size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <div className="btn-spinner" style={{ width: 36, height: 36, margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-slate-500)", fontSize: "1rem" }}>
              Retrieving live consignment data from database...
            </p>
          </div>
        )}

        {/* Order Details Body */}
        {!loading && order && (
          <>
            {/* Header with Tracking ID, Status, and Cancel Action */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "1.75rem",
                      fontWeight: 800,
                      color: "var(--color-slate-900)",
                    }}
                  >
                    {order.trackingNumber}
                  </span>
                  <Badge variant={getStatusVariant(order.status)} dot={true}>
                    {order.status}
                  </Badge>
                </div>
                <p style={{ color: "var(--color-slate-500)", fontSize: "0.875rem" }}>
                  Booked on <strong>{formatDate(order.createdAt)}</strong> • System Reference: <code>{order.id}</code>
                </p>
              </div>

              {/* Cancel Action (Only when status is PENDING) */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {order.status === "PENDING" && !showCancelConfirm && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setShowCancelConfirm(true)}
                    style={{ borderColor: "#ef4444", color: "#dc2626" }}
                  >
                    Cancel Order
                  </Button>
                )}

                <Link to="/orders/new">
                  <Button variant="primary" size="md" icon={<PackageIcon size={18} />}>
                    + Book Another Order
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cancel Confirmation Prompt */}
            {showCancelConfirm && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1.5px solid #fecaca",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 24px",
                  marginBottom: 28,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#991b1b", fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
                  <AlertCircleIcon size={20} />
                  <span>Confirm Order Cancellation</span>
                </div>
                <p style={{ color: "#7f1d1d", fontSize: "0.875rem", marginBottom: 16 }}>
                  Are you sure you want to cancel order <strong>{order.trackingNumber}</strong>? Once cancelled, this consignment cannot be dispatched.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={cancelling}
                    onClick={handleCancelOrder}
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    Yes, Cancel This Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Keep Order Active
                  </Button>
                </div>
              </div>
            )}

            {/* Grid: Order Specifications & Courier Card */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
                gap: 24,
                marginBottom: 28,
              }}
            >
              {/* Left Column: Shipment Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Card title="Shipment Specifications" subtitle="Full pickup, delivery, and package manifests">
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Pickup */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "var(--color-primary-light)",
                          color: "var(--color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MapPinIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase" }}>
                          Pickup Location (Sender)
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-slate-900)", marginTop: 2 }}>
                          {order.pickupLocation}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                          Sender: {order.customer?.fullName || "Account Holder"} {order.customer?.phone && `• Tel: ${order.customer.phone}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "0 0 0 50px" }} />

                    {/* Dropoff */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "#d1fae5",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MapPinIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase" }}>
                          Drop-off Location (Customer Destination)
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-slate-900)", marginTop: 2 }}>
                          {order.dropoffLocation}
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "0 0 0 50px" }} />

                    {/* Package Details */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <PackageIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase" }}>
                          Package Details & Contents
                        </div>
                        <div style={{ fontSize: "0.9375rem", color: "var(--color-slate-800)", marginTop: 4, whiteSpace: "pre-wrap" }}>
                          {order.packageDetails}
                        </div>
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "var(--border-color)", margin: "0 0 0 50px" }} />

                    {/* Delivery Time */}
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: "#fef3c7",
                          color: "#d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ClockIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-slate-400)", textTransform: "uppercase" }}>
                          Requested Delivery Window
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--color-slate-900)", marginTop: 2 }}>
                          {formatDate(order.deliveryTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Courier Information & Status History */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Courier Information Card */}
                <Card
                  title="Courier Information"
                  subtitle="Assigned delivery personnel for this consignment"
                >
                  {order.courier ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          className="user-avatar-initial"
                          style={{ width: 44, height: 44, fontSize: "1.1rem" }}
                        >
                          {order.courier.fullName ? order.courier.fullName[0].toUpperCase() : "C"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-slate-900)" }}>
                            {order.courier.fullName}
                          </div>
                          <Badge variant="in-transit" dot={true}>
                            Assigned Courier
                          </Badge>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.875rem", color: "var(--color-slate-600)", display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        <div>
                          <strong>Phone:</strong> {order.courier.phone || "Not provided"}
                        </div>
                        <div>
                          <strong>Email:</strong> {order.courier.email}
                        </div>
                        <div>
                          <strong>Response:</strong> {order.courierResponse}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "24px 16px",
                        textAlign: "center",
                        backgroundColor: "var(--bg-surface-muted)",
                        borderRadius: "var(--radius-md)",
                        border: "1px dashed var(--border-color)",
                      }}
                    >
                      <TruckIcon size={32} style={{ color: "var(--color-slate-400)", margin: "0 auto 10px" }} />
                      <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-slate-700)" }}>
                        Awaiting Courier Assignment
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 4 }}>
                        Your order is in the dispatch queue. A courier will be assigned shortly.
                      </p>
                    </div>
                  )}
                </Card>

                {/* Status Change History Timeline */}
                <Card
                  title="Consignment Milestones"
                  subtitle="Audit trail of recorded status events"
                >
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {order.statusHistory.map((history, idx) => (
                        <div key={history.id || idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              backgroundColor:
                                history.status === "DELIVERED"
                                  ? "#d1fae5"
                                  : history.status === "CANCELLED"
                                  ? "#fee2e2"
                                  : "var(--color-primary-light)",
                              color:
                                history.status === "DELIVERED"
                                  ? "#059669"
                                  : history.status === "CANCELLED"
                                  ? "#dc2626"
                                  : "var(--color-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                          >
                            ●
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                                {history.status}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "var(--color-slate-400)" }}>
                                {formatDate(history.createdAt)}
                              </span>
                            </div>
                            {history.note && (
                              <p style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                                {history.note}
                              </p>
                            )}
                            {history.changedBy && (
                              <p style={{ fontSize: "0.75rem", color: "var(--color-slate-400)", marginTop: 2 }}>
                                Updated by: {history.changedBy.fullName} ({history.changedBy.role})
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)" }}>
                      Initial order creation recorded.
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
