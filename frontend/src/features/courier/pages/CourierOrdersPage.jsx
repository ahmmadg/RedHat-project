import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import courierService from "../services/courier-service";

const NEXT_STATUS = {
  PENDING: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const NEXT_STATUS_LABEL = {
  PICKED_UP: "Mark picked up",
  IN_TRANSIT: "Mark in transit",
  DELIVERED: "Mark delivered",
};

export default function CourierOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      const assignedOrders = await courierService.getAssignedOrders();
      setOrders(assignedOrders);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load assigned orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    courierService
      .getAssignedOrders()
      .then((assignedOrders) => {
        if (isMounted) setOrders(assignedOrders);
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Could not load assigned orders."
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function runAction(orderId, action, successMessage) {
    setBusyId(orderId);
    setError("");
    setMessage("");

    try {
      await action();
      setMessage(successMessage);
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

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: 900, margin: "28px auto", padding: "0 16px" }}>
        <h1>Assigned Orders</h1>
        <p>Review your deliveries and update each order as you work.</p>

        {error && (
          <p role="alert" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#15803d" }}>
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading assigned orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders are assigned to you.</p>
        ) : (
          orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];

            return (
              <article
                key={order.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{order.trackingNumber}</strong>
                  <span>{order.status.replaceAll("_", " ")}</span>
                </div>

                <p><strong>Pickup:</strong> {order.pickupLocation}</p>
                <p><strong>Drop-off:</strong> {order.dropoffLocation}</p>
                <p><strong>Package:</strong> {order.packageDetails}</p>
                <p>
                  <strong>Customer:</strong>{" "}
                  {order.customer?.fullName || "—"}
                  {order.customer?.phone
                    ? ` (${order.customer.phone})`
                    : ""}
                </p>
                <p>
                  <strong>Delivery time:</strong>{" "}
                  {order.deliveryTime
                    ? new Date(order.deliveryTime).toLocaleString()
                    : "Not specified"}
                </p>

                {order.status === "PENDING" &&
                  order.courierResponse === "PENDING" && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        disabled={busyId === order.id}
                        onClick={() =>
                          runAction(
                            order.id,
                            () => courierService.acceptOrder(order.id),
                            "Order accepted."
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        disabled={busyId === order.id}
                        onClick={() =>
                          runAction(
                            order.id,
                            () => courierService.declineOrder(order.id),
                            "Order declined."
                          )
                        }
                      >
                        Decline
                      </button>
                    </div>
                  )}

                {order.courierResponse === "ACCEPTED" && nextStatus && (
                  <button
                    disabled={busyId === order.id}
                    onClick={() =>
                      runAction(
                        order.id,
                        () =>
                          courierService.updateOrderStatus(
                            order.id,
                            nextStatus
                          ),
                        `Order marked ${nextStatus
                          .replaceAll("_", " ")
                          .toLowerCase()}.`
                      )
                    }
                  >
                    {NEXT_STATUS_LABEL[nextStatus]}
                  </button>
                )}
              </article>
            );
          })
        )}
      </main>
    </>
  );
}