import { useCallback, useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import courierService from "../services/courier-service";

const STEPS = ["PENDING", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

const STEP_LABEL = {
  PENDING: "Assigned",
  PICKED_UP: "Picked up",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
};

const NEXT_STATUS = {
  PENDING: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const NEXT_STATUS_LABEL = {
  PICKED_UP: "Mark as picked up",
  IN_TRANSIT: "Start delivery",
  DELIVERED: "Confirm delivered",
};

const isCompleted = (o) =>
  o.status === "DELIVERED" || o.courierResponse === "DECLINED";

export default function CourierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [confirmDeclineId, setConfirmDeclineId] = useState("");
  const [tab, setTab] = useState("active");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await courierService.getAssignedOrders());
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load assigned orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function runAction(orderId, action, successMessage) {
    setBusyId(orderId);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      setConfirmDeclineId("");
      await loadOrders();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "The action failed. Please try again."
      );
    } finally {
      setBusyId("");
    }
  }

  const activeOrders = orders.filter((o) => !isCompleted(o));
  const completedOrders = orders.filter(isCompleted);
  const visibleOrders = tab === "active" ? activeOrders : completedOrders;

  return (
    <>
      <style>{css}</style>
      <Navbar />

      <main className="co-page">
        <header className="co-header">
          <div>
            <h1>Assigned orders</h1>
            <p>Accept deliveries and update each one as you go.</p>
          </div>
          <button
            className="co-btn co-btn-ghost"
            onClick={() => {
              setLoading(true);
              setError("");
              loadOrders();
            }}
            disabled={loading}
          >
            Refresh
          </button>
        </header>

        <div className="co-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === "active"}
            className={tab === "active" ? "co-tab co-tab-on" : "co-tab"}
            onClick={() => setTab("active")}
          >
            Active <span>{activeOrders.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === "completed"}
            className={tab === "completed" ? "co-tab co-tab-on" : "co-tab"}
            onClick={() => setTab("completed")}
          >
            Completed <span>{completedOrders.length}</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="co-toast co-toast-error">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="co-toast co-toast-ok">
            {message}
          </p>
        )}

        {loading ? (
          <p className="co-muted">Loading assigned orders...</p>
        ) : visibleOrders.length === 0 ? (
          <EmptyState tab={tab} onRefresh={loadOrders} />
        ) : (
          visibleOrders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            const busy = busyId === order.id;
            const awaitingResponse =
              order.status === "PENDING" && order.courierResponse === "PENDING";
            const declined = order.courierResponse === "DECLINED";
            const stepIndex = STEPS.indexOf(order.status);

            return (
              <article key={order.id} className="co-card">
                <div className="co-card-top">
                  <strong className="co-track">{order.trackingNumber}</strong>
                  <span
                    className={`co-badge co-badge-${
                      declined ? "DECLINED" : order.status
                    }`}
                  >
                    {declined
                      ? "Declined"
                      : STEP_LABEL[order.status] ||
                        order.status.replaceAll("_", " ")}
                  </span>
                </div>

                {!declined && order.courierResponse === "ACCEPTED" && (
                  <ol className="co-steps" aria-label="Delivery progress">
                    {STEPS.map((s, i) => (
                      <li
                        key={s}
                        className={
                          i < stepIndex
                            ? "co-step co-step-done"
                            : i === stepIndex
                            ? "co-step co-step-now"
                            : "co-step"
                        }
                      >
                        <i />
                        {STEP_LABEL[s]}
                      </li>
                    ))}
                  </ol>
                )}

                <dl className="co-details">
                  <div>
                    <dt>Pickup</dt>
                    <dd>{order.pickupLocation}</dd>
                  </div>
                  <div>
                    <dt>Drop-off</dt>
                    <dd>{order.dropoffLocation}</dd>
                  </div>
                  <div>
                    <dt>Package</dt>
                    <dd>{order.packageDetails}</dd>
                  </div>
                  <div>
                    <dt>Customer</dt>
                    <dd>
                      {order.customer?.fullName || "—"}
                      {order.customer?.phone && (
                        <>
                          {" "}
                          <a
                            className="co-call"
                            href={`tel:${order.customer.phone}`}
                          >
                            Call {order.customer.phone}
                          </a>
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Delivery time</dt>
                    <dd>
                      {order.deliveryTime
                        ? new Date(order.deliveryTime).toLocaleString()
                        : "Not specified"}
                    </dd>
                  </div>
                </dl>

                {awaitingResponse && (
                  <div className="co-actions">
                    {confirmDeclineId === order.id ? (
                      <>
                        <span className="co-confirm-text">
                          Decline this order?
                        </span>
                        <button
                          className="co-btn co-btn-danger"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              order.id,
                              () => courierService.declineOrder(order.id),
                              "Order declined."
                            )
                          }
                        >
                          {busy ? "Declining..." : "Yes, decline"}
                        </button>
                        <button
                          className="co-btn co-btn-ghost"
                          disabled={busy}
                          onClick={() => setConfirmDeclineId("")}
                        >
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="co-btn co-btn-primary"
                          disabled={busy}
                          onClick={() =>
                            runAction(
                              order.id,
                              () => courierService.acceptOrder(order.id),
                              "Order accepted."
                            )
                          }
                        >
                          {busy ? "Accepting..." : "Accept order"}
                        </button>
                        <button
                          className="co-btn co-btn-outline-danger"
                          disabled={busy}
                          onClick={() => setConfirmDeclineId(order.id)}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                )}

                {order.courierResponse === "ACCEPTED" && nextStatus && (
                  <div className="co-actions">
                    <button
                      className="co-btn co-btn-primary co-btn-wide"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          order.id,
                          () =>
                            courierService.updateOrderStatus(
                              order.id,
                              nextStatus
                            ),
                          `Order marked ${STEP_LABEL[nextStatus].toLowerCase()}.`
                        )
                      }
                    >
                      {busy ? "Updating..." : NEXT_STATUS_LABEL[nextStatus]}
                    </button>
                  </div>
                )}
              </article>
            );
          })
        )}
      </main>
    </>
  );
}

function EmptyState({ tab, onRefresh }) {
  const active = tab === "active";
  return (
    <div className="co-empty">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
        <rect x="14" y="26" width="46" height="36" rx="6" stroke="#9ca3af" strokeWidth="2.5" />
        <path d="M60 38h10l8 9v15H60V38Z" stroke="#9ca3af" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="30" cy="66" r="6" fill="#fff" stroke="#9ca3af" strokeWidth="2.5" />
        <circle cx="68" cy="66" r="6" fill="#fff" stroke="#9ca3af" strokeWidth="2.5" />
        <path d="M22 36h22M22 44h14" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <h2>{active ? "No active deliveries" : "Nothing completed yet"}</h2>
      <p>
        {active
          ? "New orders assigned to you will show up here. Check back in a moment."
          : "Delivered and declined orders will be listed here."}
      </p>
    </div>
  );
}

const css = `
.co-page{max-width:820px;margin:28px auto;padding:0 16px;color:#111827}
.co-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:18px}
.co-header h1{margin:0 0 4px;font-size:26px}
.co-header p{margin:0;color:#6b7280}
.co-muted{color:#6b7280}

.co-tabs{display:flex;gap:6px;border-bottom:1px solid #e5e7eb;margin-bottom:18px}
.co-tab{background:none;border:0;border-bottom:2px solid transparent;padding:10px 14px;font:inherit;font-weight:600;color:#6b7280;cursor:pointer;margin-bottom:-1px}
.co-tab span{background:#f3f4f6;border-radius:999px;padding:1px 8px;font-size:12px;margin-left:4px}
.co-tab-on{color:#111827;border-bottom-color:#111827}

.co-toast{padding:10px 14px;border-radius:8px;margin:0 0 14px;font-size:14px}
.co-toast-error{background:#fef2f2;color:#b91c1c}
.co-toast-ok{background:#f0fdf4;color:#15803d}

.co-card{border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin-bottom:16px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.co-card-top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.co-track{font-size:16px}

.co-badge{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;background:#f3f4f6;color:#374151}
.co-badge-PENDING{background:#fef3c7;color:#92400e}
.co-badge-PICKED_UP{background:#dbeafe;color:#1e40af}
.co-badge-IN_TRANSIT{background:#ede9fe;color:#5b21b6}
.co-badge-DELIVERED{background:#dcfce7;color:#166534}
.co-badge-DECLINED{background:#fee2e2;color:#991b1b}

.co-steps{list-style:none;display:flex;margin:16px 0 4px;padding:0}
.co-step{flex:1;position:relative;text-align:center;font-size:12px;color:#9ca3af;padding-top:18px}
.co-step i{position:absolute;top:0;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#e5e7eb;z-index:1}
.co-step::before{content:"";position:absolute;top:5px;left:-50%;width:100%;height:2px;background:#e5e7eb}
.co-step:first-child::before{display:none}
.co-step-done,.co-step-now{color:#111827}
.co-step-done i,.co-step-now i{background:#16a34a}
.co-step-done::before,.co-step-now::before{background:#16a34a}
.co-step-now i{box-shadow:0 0 0 4px #dcfce7}

.co-details{margin:16px 0 0;display:grid;gap:10px}
.co-details div{display:grid;grid-template-columns:110px 1fr;gap:8px;font-size:14px}
.co-details dt{color:#6b7280}
.co-details dd{margin:0;word-break:break-word}
.co-call{color:#2563eb;font-weight:600;text-decoration:none;margin-left:6px}

.co-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid #f3f4f6}
.co-confirm-text{font-size:14px;color:#991b1b;font-weight:600}

.co-btn{font:inherit;font-weight:600;font-size:14px;padding:10px 18px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:background .15s,opacity .15s}
.co-btn:disabled{opacity:.55;cursor:not-allowed}
.co-btn:focus-visible,.co-tab:focus-visible{outline:2px solid #2563eb;outline-offset:2px}
.co-btn-wide{width:100%;padding:13px}
.co-btn-primary{background:#16a34a;color:#fff}
.co-btn-primary:hover:not(:disabled){background:#15803d}
.co-btn-danger{background:#dc2626;color:#fff}
.co-btn-danger:hover:not(:disabled){background:#b91c1c}
.co-btn-outline-danger{background:#fff;color:#dc2626;border-color:#fca5a5}
.co-btn-outline-danger:hover:not(:disabled){background:#fef2f2}
.co-btn-outline{background:#fff;color:#111827;border-color:#d1d5db}
.co-btn-outline:hover:not(:disabled){background:#f9fafb}
.co-btn-ghost{background:transparent;color:#374151;border-color:#e5e7eb}
.co-btn-ghost:hover:not(:disabled){background:#f9fafb}

.co-empty{text-align:center;padding:56px 20px;border:1.5px dashed #d1d5db;border-radius:16px;background:#fafafa}
.co-empty h2{margin:14px 0 6px;font-size:20px}
.co-empty p{margin:0 auto 18px;color:#6b7280;max-width:340px}

@media (max-width:520px){
  .co-details div{grid-template-columns:1fr;gap:2px}
  .co-actions .co-btn{flex:1}
}
`;