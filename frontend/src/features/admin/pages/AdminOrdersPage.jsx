import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import adminService from "../services/admin-service";

const ORDER_STATUSES = [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [selectedCouriers, setSelectedCouriers] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadPage() {
    try {
      const [orderList, courierList] = await Promise.all([
        adminService.getOrders(),
        adminService.getCouriers(),
      ]);

      setOrders(orderList);
      setCouriers(courierList);
      setSelectedStatuses(
        Object.fromEntries(orderList.map((order) => [order.id, order.status]))
      );
      setSelectedCouriers(
        Object.fromEntries(
          orderList.map((order) => [order.id, order.courierId || ""])
        )
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load admin orders."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([adminService.getOrders(), adminService.getCouriers()])
      .then(([orderList, courierList]) => {
        if (!isMounted) return;

        setOrders(orderList);
        setCouriers(courierList);
        setSelectedStatuses(
          Object.fromEntries(orderList.map((order) => [order.id, order.status]))
        );
        setSelectedCouriers(
          Object.fromEntries(
            orderList.map((order) => [order.id, order.courierId || ""])
          )
        );
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(
            requestError.response?.data?.message ||
              "Could not load admin orders."
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

  async function runAction(orderId, action, successText) {
    setBusyId(orderId);
    setError("");
    setMessage("");

    try {
      await action();
      setMessage(successText);
      await loadPage();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Action failed. Please try again."
      );
    } finally {
      setBusyId("");
    }
  }

  function removeOrder(order) {
    if (!window.confirm(`Delete order ${order.trackingNumber}?`)) return;

    runAction(
      order.id,
      () => adminService.deleteOrder(order.id),
      "Order deleted."
    );
  }

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: "28px auto", padding: "0 16px" }}>
        <h1>Manage Orders</h1>
        <p>Review orders, update their status, and assign couriers.</p>

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
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  {[
                    "Tracking",
                    "Customer",
                    "Pickup",
                    "Drop-off",
                    "Status",
                    "Courier",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{ padding: 10, borderBottom: "1px solid #ccc" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: 10 }}>{order.trackingNumber}</td>
                    <td style={{ padding: 10 }}>
                      {order.customer?.fullName || "—"}
                    </td>
                    <td style={{ padding: 10 }}>{order.pickupLocation}</td>
                    <td style={{ padding: 10 }}>{order.dropoffLocation}</td>

                    <td style={{ padding: 10 }}>
                      <select
                        aria-label={`Status for ${order.trackingNumber}`}
                        value={selectedStatuses[order.id] || order.status}
                        onChange={(event) =>
                          setSelectedStatuses({
                            ...selectedStatuses,
                            [order.id]: event.target.value,
                          })
                        }
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: 10 }}>
                      <select
                        aria-label={`Courier for ${order.trackingNumber}`}
                        value={selectedCouriers[order.id] || ""}
                        onChange={(event) =>
                          setSelectedCouriers({
                            ...selectedCouriers,
                            [order.id]: event.target.value,
                          })
                        }
                      >
                        <option value="">Unassigned</option>
                        {couriers.map((courier) => (
                          <option key={courier.id} value={courier.id}>
                            {courier.fullName}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: 10, whiteSpace: "nowrap" }}>
                      <button
                        disabled={busyId === order.id}
                        onClick={() =>
                          runAction(
                            order.id,
                            () =>
                              adminService.updateOrderStatus(
                                order.id,
                                selectedStatuses[order.id]
                              ),
                            "Order status updated."
                          )
                        }
                      >
                        Update status
                      </button>{" "}

                      <button
                        disabled={
                          busyId === order.id ||
                          !selectedCouriers[order.id]
                        }
                        onClick={() =>
                          runAction(
                            order.id,
                            () =>
                              adminService.assignCourier(
                                order.id,
                                selectedCouriers[order.id]
                              ),
                            "Courier assigned."
                          )
                        }
                      >
                        Assign courier
                      </button>{" "}

                      <button
                        disabled={busyId === order.id}
                        onClick={() => removeOrder(order)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}