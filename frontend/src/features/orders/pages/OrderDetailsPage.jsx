import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import orderService from "../services/order-service";
import "../orders.css";

const STATUS_STEPS = ["PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

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
              "Could not load shipment details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    setError("");
    try {
      const response = await orderService.cancelOrder(id);
      setOrder(response.data);
      setShowCancelPrompt(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not cancel order. Please refresh and try again."
      );
      setShowCancelPrompt(false);
    } finally {
      setCancelling(false);
    }
  }

  function handleCopyTracking() {
    if (!order?.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function formatDate(isoString) {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : 0;
  const isCancelled = order?.status === "CANCELLED";

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
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Shipment Details</span>
        </div>

        {error && (
          <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 20 }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {loading && (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#64748b" }}>
            <div className="btn-spinner" style={{ width: 28, height: 28, margin: "0 auto 12px" }} />
            <p>Loading shipment record...</p>
          </div>
        )}

        {!loading && order && (
          <>
            {/* Top Shipment Bar */}
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
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <h1
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    {order.trackingNumber}
                  </h1>

                  <button
                    type="button"
                    className="copy-tracking-btn"
                    onClick={handleCopyTracking}
                    title="Copy tracking number"
                  >
                    {copySuccess ? "✓ Copied" : "Copy #"}
                  </button>

                  <Badge
                    variant={isCancelled ? "brand" : order.status === "DELIVERED" ? "delivered" : "pending"}
                    dot={!isCancelled}
                  >
                    {order.status}
                  </Badge>
                </div>

                <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "6px 0 0 0" }}>
                  Booked on {formatDate(order.createdAt)} • Ref: <code>{order.id.slice(0, 8)}...</code>
                </p>
              </div>

              {/* Actions: Print Waybill & Cancel Order */}
              <div className="order-details-actions" style={{ display: "flex", gap: 10 }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  title="Print Waybill / Shipping Label"
                >
                  Print Label
                </Button>

                {order.status === "PENDING" && !showCancelPrompt && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelPrompt(true)}
                    style={{ color: "#dc2626", borderColor: "#fca5a5" }}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelPrompt && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "16px 20px",
                  marginBottom: 24,
                }}
              >
                <div style={{ fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>
                  Confirm Order Cancellation
                </div>
                <p style={{ fontSize: "0.875rem", color: "#7f1d1d", margin: "0 0 12px 0" }}>
                  Are you sure you want to cancel shipment <strong>{order.trackingNumber}</strong>? Once cancelled, it cannot be dispatched.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={cancelling}
                    onClick={handleCancel}
                    style={{ backgroundColor: "#dc2626" }}
                  >
                    Yes, Cancel Shipment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelling}
                    onClick={() => setShowCancelPrompt(false)}
                  >
                    Keep Order
                  </Button>
                </div>
              </div>
            )}

            {/* Status Stepper (Human UI) */}
            <Card style={{ marginBottom: 24, padding: "20px 24px" }}>
              {isCancelled ? (
                <div
                  style={{
                    backgroundColor: "#fef2f2",
                    color: "#991b1b",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  ✕ This shipment was cancelled and will not be dispatched.
                </div>
              ) : (
                <div className="order-progress-stepper">
                  <div className="stepper-line-bg" />
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    const circleClass = isCompleted ? "completed" : isActive ? "active" : "";
                    const labelClass = isActive ? "active" : "";

                    return (
                      <div key={step} className="stepper-step">
                        <div className={`stepper-circle ${circleClass}`.trim()}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`stepper-label ${labelClass}`.trim()}>
                          {step.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Two-Column Specification Manifest */}
            <div className="order-layout-grid">
              {/* Left Column: Shipment Specs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <Card title="Shipment Specifications">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Pickup Location (Sender)
                      </div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {order.pickupLocation}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: 2 }}>
                        Contact: {order.customer?.fullName || "Account Holder"} {order.customer?.email && `(${order.customer.email})`}
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "#f1f5f9" }} />

                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Drop-off Location (Recipient)
                      </div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {order.dropoffLocation}
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "#f1f5f9" }} />

                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Package Contents & Notes
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#334155", marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {order.packageDetails}
                      </div>
                    </div>

                    <div style={{ height: 1, backgroundColor: "#f1f5f9" }} />

                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Requested Delivery Time
                      </div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#0f172a", marginTop: 2 }}>
                        {formatDate(order.deliveryTime)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column: Courier & Milestone Trail */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Courier Card */}
                <Card title="Courier Assignment">
                  {order.courier ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.875rem" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {order.courier.fullName}
                      </div>
                      <div style={{ color: "#64748b" }}>
                        Phone: {order.courier.phone || "Not available"}
                      </div>
                      <div style={{ color: "#64748b" }}>
                        Email: {order.courier.email}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#475569" }}>
                        Awaiting Courier Assignment
                      </div>
                      <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "4px 0 0 0" }}>
                        Your order is queued for hub pickup.
                      </p>
                    </div>
                  )}
                </Card>

                {/* Tracking Milestones */}
                <Card title="Activity History">
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {order.statusHistory.map((item, idx) => (
                        <div key={item.id || idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: item.status === "CANCELLED" ? "#dc2626" : "#e31826",
                              marginTop: 5,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>
                              {item.status}
                            </div>
                            {item.note && (
                              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                                {item.note}
                              </div>
                            )}
                            <div style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: 2 }}>
                              {formatDate(item.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
                      Initial booking logged.
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
