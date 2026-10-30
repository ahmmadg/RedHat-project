import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

export const statusColors = {
  PENDING: "#f59e0b",
  PICKED_UP: "#3b82f6",
  IN_TRANSIT: "#8b5cf6",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load orders");
        setOrders(d.orders);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 16 }}>
      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
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
          <small>Created: {new Date(o.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
