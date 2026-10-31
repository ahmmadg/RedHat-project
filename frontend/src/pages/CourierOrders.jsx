import { useEffect, useState } from "react";
import { statusColors } from "./MyOrders";

const API = "http://localhost:5000/api";
const NEXT = { PENDING: "PICKED_UP", PICKED_UP: "IN_TRANSIT", IN_TRANSIT: "DELIVERED" };
const LABEL = { PICKED_UP: "Mark picked up", IN_TRANSIT: "Mark in transit", DELIVERED: "Mark delivered" };

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function CourierOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () =>
    fetch(`${API}/courier/orders`, { headers: headers() })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load orders");
        setOrders(d.orders);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const act = async (id, action, body) => {
    setError("");
    const r = await fetch(`${API}/courier/orders/${id}/${action}`, {
      method: "PATCH",
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json();
    if (!r.ok) return setError(d.error || "Action failed");
    load();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 16 }}>
      <h2>Assigned Orders</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && <p>No assigned orders.</p>}
      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{o.trackingNumber}</strong>
            <span style={{ background: statusColors[o.status], color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: 13 }}>
              {o.status.replace("_", " ")}
            </span>
          </div>
          <div>From: {o.pickupLocation}</div>
          <div>To: {o.dropoffLocation}</div>
          <div>Package: {o.packageDetails}</div>
          <div>Customer: {o.customer?.fullName} {o.customer?.phone && `(${o.customer.phone})`}</div>
          <div>Deliver by: {new Date(o.deliveryTime).toLocaleString()}</div>

          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            {o.status === "PENDING" && o.courierResponse === "PENDING" && (
              <>
                <button onClick={() => act(o.id, "accept")}>Accept</button>
                <button onClick={() => act(o.id, "decline")}>Decline</button>
              </>
            )}
            {o.courierResponse === "ACCEPTED" && NEXT[o.status] && (
              <button onClick={() => act(o.id, "status", { status: NEXT[o.status] })}>
                {LABEL[NEXT[o.status]]}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
