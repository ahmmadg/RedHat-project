import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Navbar from "../../../components/layout/Navbar";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import orderService from "../../orders/services/order-service";
import adminService from "../../admin/services/admin-service";
import {
  PackageIcon,
  TruckIcon,
  SearchIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  BarChartIcon,
  UserIcon
} from "../../../components/ui/Icons";

const INITIAL_COURIER_STOPS = [
  {
    id: "BST-9842-EG",
    seq: 1,
    customer: "Omar Farouk",
    phone: "01098765432",
    address: "Bldg 14, Abbas El Akkad, Nasr City, Cairo",
    cod: "Prepaid (Credit Card)",
    status: "delivered",
    statusLabel: "Delivered",
  },
  {
    id: "BST-7731-EG",
    seq: 2,
    customer: "Sherif Nour",
    phone: "01122334455",
    address: "Bldg 42, Tayaran St, Nasr City, Cairo",
    cod: "EGP 450 (Cash on Delivery)",
    status: "current",
    statusLabel: "Current Stop",
  },
  {
    id: "BST-3319-EG",
    seq: 3,
    customer: "Dina Mansour",
    phone: "01233445566",
    address: "Bldg 8, Makram Ebeid, Nasr City, Cairo",
    cod: "EGP 890 (Cash on Delivery)",
    status: "pending",
    statusLabel: "Scheduled",
  },
  {
    id: "BST-6102-EG",
    seq: 4,
    customer: "Tarek Mostafa",
    phone: "01011223344",
    address: "Villa 12, First Settlement, New Cairo",
    cod: "Prepaid (Credit Card)",
    status: "pending",
    statusLabel: "Scheduled",
  },
  {
    id: "BST-4491-EG",
    seq: 5,
    customer: "Nouran Adel",
    phone: "01555667788",
    address: "Bldg 20, South Police Academy, New Cairo",
    cod: "EGP 620 (Cash on Delivery)",
    status: "pending",
    statusLabel: "Scheduled",
  },
];

const SAMPLE_SHIPMENTS = [
  {
    id: "BST-9842-EG",
    recipient: "Omar Farouk",
    city: "Nasr City, Cairo",
    status: "in-transit",
    statusLabel: "Out For Delivery",
    eta: "Today, 2:30 PM",
    courier: "Ahmed Tarek",
    currentStep: 3,
    steps: [
      { title: "Order Created", time: "Oct 21, 10:15 AM", location: "Merchant Store" },
      { title: "Picked Up by Courier", time: "Oct 21, 02:40 PM", location: "Cairo Hub" },
      { title: "Sorting Center Dispatch", time: "Oct 22, 06:15 AM", location: "Nasr City Facility" },
      { title: "Out for Delivery", time: "Oct 22, 09:30 AM", location: "With Courier Ahmed" },
      { title: "Delivered", time: "Estimated ~ 2:30 PM", location: "Customer Address" },
    ],
  },
  {
    id: "ARX-5519-EG",
    recipient: "Laila Youssef",
    city: "Sidi Gaber, Alexandria",
    status: "delivered",
    statusLabel: "Delivered",
    eta: "Oct 21, 4:10 PM",
    courier: "Mahmoud Hassan",
    currentStep: 4,
    steps: [
      { title: "Order Created", time: "Oct 20, 09:00 AM", location: "Merchant Store" },
      { title: "Picked Up by Courier", time: "Oct 20, 11:30 AM", location: "Cairo Central" },
      { title: "Inter-city Transit", time: "Oct 20, 09:00 PM", location: "Alexandria Distribution" },
      { title: "Out for Delivery", time: "Oct 21, 09:00 AM", location: "With Courier Mahmoud" },
      { title: "Delivered to Customer", time: "Oct 21, 04:10 PM", location: "Customer Reception" },
    ],
  },
  {
    id: "BST-4102-EG",
    recipient: "Mohamed El-Sayed",
    city: "6th of October City, Giza",
    status: "pending",
    statusLabel: "Package Picked Up",
    eta: "Tomorrow, 11:00 AM",
    courier: "Karim Mostafa",
    currentStep: 1,
    steps: [
      { title: "Order Created", time: "Oct 22, 08:00 AM", location: "Merchant Store" },
      { title: "Picked Up by Courier", time: "Oct 22, 11:15 AM", location: "Giza West Hub" },
      { title: "Sorting Center Dispatch", time: "Pending", location: "Giza Main Terminal" },
      { title: "Out for Delivery", time: "Pending", location: "With Courier" },
      { title: "Delivered", time: "Pending", location: "Customer Address" },
    ],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role directly taken from the login response (user.role)
  const role = user?.role || "USER";
  const displayName = user?.fullName || user?.name || user?.email || "User";

  const [notification, setNotification] = useState("");
  const [courierStops, setCourierStops] = useState(INITIAL_COURIER_STOPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTrackingId, setActiveTrackingId] = useState("BST-9842-EG");
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(
    role !== "COURIER" && role !== "ADMIN"
  );
  const [couriers, setCouriers] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [courierError, setCourierError] = useState("");
  const [adminOrders, setAdminOrders] = useState([]);
  const [loadingAdminOrders, setLoadingAdminOrders] = useState(true);
  const [adminOrdersError, setAdminOrdersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    if (role !== "COURIER" && role !== "ADMIN") {
      orderService
        .getMyOrders()
        .then((res) => {
          if (isMounted && res?.data) {
            setMyOrders(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not load real customer orders:", err.message);
        })
        .finally(() => {
          if (isMounted) setLoadingOrders(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    if (role === "ADMIN") {
      adminService
        .getCouriers()
        .then((courierList) => {
          if (isMounted) setCouriers(courierList);
        })
        .catch((error) => {
          if (isMounted) {
            setCourierError(
              error.response?.data?.message || "Could not load couriers."
            );
          }
        })
        .finally(() => {
          if (isMounted) setLoadingCouriers(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    if (role === "ADMIN") {
      adminService
        .getOrders()
        .then((orderList) => {
          if (isMounted) setAdminOrders(orderList);
        })
        .catch((error) => {
          if (isMounted) {
            setAdminOrdersError(
              error.response?.data?.message || "Could not load orders."
            );
          }
        })
        .finally(() => {
          if (isMounted) setLoadingAdminOrders(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [role]);

  const activeCourierCount = new Set(
    adminOrders
      .filter(
        (order) =>
          order.courierId &&
          !["DELIVERED", "CANCELLED"].includes(order.status)
      )
      .map((order) => order.courierId)
  ).size;

  const awaitingAssignmentCount = adminOrders.filter(
    (order) => order.status === "PENDING" && !order.courierId
  ).length;

  const deliveredOrderCount = adminOrders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  async function refreshAdminDashboard() {
    setLoadingAdminOrders(true);
    setLoadingCouriers(true);
    setAdminOrdersError("");
    setCourierError("");

    try {
      const [orderList, courierList] = await Promise.all([
        adminService.getOrders(),
        adminService.getCouriers(),
      ]);
      setAdminOrders(orderList);
      setCouriers(courierList);
    } catch (error) {
      const message =
        error.response?.data?.message || "Could not refresh admin dashboard data.";
      setAdminOrdersError(message);
      setCourierError(message);
    } finally {
      setLoadingAdminOrders(false);
      setLoadingCouriers(false);
    }
  }

  function exportOrdersCsv() {
    const columns = [
      "Tracking Number",
      "Customer",
      "Pickup Location",
      "Drop-off Location",
      "Status",
      "Courier",
      "Delivery Time",
    ];

    const escapeCell = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = adminOrders.map((order) => [
      order.trackingNumber,
      order.customer?.fullName || "",
      order.pickupLocation,
      order.dropoffLocation,
      order.status,
      order.courier?.fullName || "Unassigned",
      order.deliveryTime ? new Date(order.deliveryTime).toLocaleString() : "",
    ]);
    const csv = [columns, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");
    const file = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `trackflow-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const activeShipment =
    SAMPLE_SHIPMENTS.find(
      (s) => s.id.toLowerCase() === activeTrackingId.toLowerCase()
    ) || SAMPLE_SHIPMENTS[0];

  function handleMarkDelivered(stopId) {
    setCourierStops((prev) =>
      prev.map((stop) => {
        if (stop.id === stopId) {
          return { ...stop, status: "delivered", statusLabel: "Delivered" };
        }
        return stop;
      })
    );
    setNotification(
      `Stop ${stopId} marked as successfully delivered! Proof of delivery recorded.`
    );
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // First check if it matches a real live order in the database.
    try {
      const liveRes = await orderService.trackOrder(query);
      if (liveRes?.data?.id) {
        navigate(`/orders/${liveRes.data.id}`);
        return;
      }
    } catch {
      // If the tracking number is not in the database, check sample shipments.
    }

    // Fall back to sample shipments.
    const found = SAMPLE_SHIPMENTS.find((s) =>
      s.id.toUpperCase().includes(query.toUpperCase())
    );

    if (found) {
      setActiveTrackingId(found.id);
      setNotification(`Tracking loaded for sample shipment ${found.id}`);
    } else {
      setNotification(
        `No consignment found matching '${query}'. Please check the tracking number.`
      );
    }
  }

  if (role === "COURIER") {
    return <Navigate to="/courier" replace />;
  }

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {notification && (
          <div
            className="form-alert form-alert-success"
            style={{
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircleIcon size={18} />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* COURIER DASHBOARD */}
        {role === "COURIER" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span className="role-badge-pill role-badge-courier">
                  <TruckIcon size={16} />
                  <span>Courier Operations Portal</span>
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-slate-500)",
                  }}
                >
                  Zone 4 • Nasr City & New Cairo
                </span>
              </div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-slate-900)",
                }}
              >
                Welcome, {displayName}!
              </h1>
              <p
                style={{
                  color: "var(--color-slate-500)",
                  fontSize: "0.9375rem",
                }}
              >
                Here is your live delivery manifest and run sheet for today's
                assigned route.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Assigned Stops</h3>
                  <div className="stat-card-val">{courierStops.length}</div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span>⚡ Today's manifest</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-red">
                  <TruckIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Delivered Stops</h3>
                  <div className="stat-card-val">
                    {
                      courierStops.filter((s) => s.status === "delivered")
                        .length
                    }
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#059669" }}
                  >
                    <span>✓ Completed</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <CheckCircleIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Remaining Stops</h3>
                  <div className="stat-card-val">
                    {
                      courierStops.filter((s) => s.status !== "delivered")
                        .length
                    }
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#d97706" }}
                  >
                    <span>● En route</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-amber">
                  <ClockIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>COD to Remit</h3>
                  <div
                    className="stat-card-val"
                    style={{ fontSize: "1.6rem" }}
                  >
                    EGP 1,960
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#2563eb" }}
                  >
                    <span>Cash on Delivery</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <PackageIcon size={24} />
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 28,
                padding: "16px 20px",
                backgroundColor: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<MapPinIcon size={16} />}
                  onClick={() =>
                    setNotification(
                      "Optimized route calculated via GPS navigation."
                    )
                  }
                >
                  Optimize Route Sequence
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNotification("Camera barcode scanner initiated.")
                  }
                >
                  📷 Scan Package Barcode
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNotification("Contacting dispatch hub coordinator...")
                  }
                >
                  📞 Call Hub Dispatch
                </Button>
              </div>

              <Badge variant="in-transit" dot={true}>
                GPS Live Tracking Active
              </Badge>
            </div>

            <Card
              title="Today's Delivery Stops Sequence"
              subtitle="Follow the sequence below for optimal delivery timing and route efficiency."
            >
              <div className="stops-list">
                {courierStops.map((stop) => {
                  const isDelivered = stop.status === "delivered";
                  const isCurrent = stop.status === "current";

                  return (
                    <div
                      key={stop.id}
                      className={`stop-item-card ${
                        isCurrent
                          ? "current-stop"
                          : isDelivered
                            ? "completed-stop"
                            : ""
                      }`}
                    >
                      <div className="stop-seq-badge">
                        {isDelivered ? "✓" : stop.seq}
                      </div>

                      <div className="stop-details">
                        <div className="stop-customer-name">
                          <span>{stop.customer}</span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.8125rem",
                              color: "var(--color-slate-500)",
                            }}
                          >
                            ({stop.id})
                          </span>
                          <Badge
                            variant={
                              isDelivered
                                ? "delivered"
                                : isCurrent
                                  ? "in-transit"
                                  : "pending"
                            }
                            dot={isCurrent}
                          >
                            {stop.statusLabel}
                          </Badge>
                        </div>

                        <div className="stop-address">
                          <MapPinIcon size={14} />
                          <span>{stop.address}</span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            marginTop: 6,
                          }}
                        >
                          <span className="stop-cod-pill">{stop.cod}</span>
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-slate-500)",
                            }}
                          >
                            Tel: <strong>{stop.phone}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="stop-actions">
                        {!isDelivered && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircleIcon size={16} />}
                            onClick={() => handleMarkDelivered(stop.id)}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setNotification(
                              `Calling recipient ${stop.customer} (${stop.phone})...`
                            )
                          }
                        >
                          📞 Call
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

        {/* ADMIN DASHBOARD */}
        {role === "ADMIN" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span className="role-badge-pill role-badge-admin">
                  <BarChartIcon size={16} />
                  <span>Central Operations Console</span>
                </span>
                <Badge variant="brand" dot={false}>
                  Full Admin Privileges
                </Badge>
              </div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-slate-900)",
                }}
              >
                Logistics Command Center
              </h1>
              <p
                style={{
                  color: "var(--color-slate-500)",
                  fontSize: "0.9375rem",
                }}
              >
                Logged in as <strong>{displayName}</strong>. Real-time overview
                using current orders and registered courier accounts.
              </p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Total Orders</h3>
                  <div className="stat-card-val">
                    {loadingAdminOrders ? "..." : adminOrders.length}
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span>Orders in the database</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-red">
                  <PackageIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Active Couriers</h3>
                  <div className="stat-card-val">
                    {loadingAdminOrders ? "..." : activeCourierCount}
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#059669" }}
                  >
                    <span>With unfinished assigned orders</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <TruckIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Awaiting Assignment</h3>
                  <div className="stat-card-val">
                    {loadingAdminOrders ? "..." : awaitingAssignmentCount}
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#2563eb" }}
                  >
                    <span>Pending orders without a courier</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <ClockIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Delivered Orders</h3>
                  <div className="stat-card-val">
                    {loadingAdminOrders ? "..." : deliveredOrderCount}
                  </div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#059669" }}
                  >
                    <span>Orders marked delivered</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <CheckCircleIcon size={24} />
                </div>
              </div>
            </div>

            <Card
              title="Order Management Controls"
              subtitle="Create orders, manage assignments, refresh data, or export the order list."
              className="mb-6"
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/orders/new" style={{ textDecoration: "none" }}>
                  <Button variant="primary" size="sm">
                    + Create Order
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin/orders")}
                >
                  Manage Orders & Assign Couriers
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshAdminDashboard}
                >
                  Refresh Dashboard Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportOrdersCsv}
                  disabled={loadingAdminOrders || adminOrders.length === 0}
                >
                  Export Orders CSV
                </Button>
              </div>
            </Card>

            <Card
              title="Registered Couriers"
              subtitle="Courier accounts registered in TrackFlow."
              className="mb-6"
            >
              <div className="table-responsive">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>Courier Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCouriers ? (
                      <tr>
                        <td colSpan="4">Loading couriers...</td>
                      </tr>
                    ) : courierError ? (
                      <tr>
                        <td colSpan="4">{courierError}</td>
                      </tr>
                    ) : couriers.length === 0 ? (
                      <tr>
                        <td colSpan="4">No couriers found.</td>
                      </tr>
                    ) : (
                      couriers.map((courier) => (
                        <tr key={courier.id}>
                          <td>{courier.fullName}</td>
                          <td>{courier.email}</td>
                          <td>{courier.phone || "—"}</td>
                          <td>{courier.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card
              title="Global Network Shipments"
              subtitle="Latest orders recorded in TrackFlow."
            >
              <div className="table-responsive">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Recipient</th>
                      <th>Destination</th>
                      <th>Assigned Courier</th>
                      <th>Status</th>
                      <th>ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAdminOrders ? (
                      <tr>
                        <td colSpan="6">Loading orders...</td>
                      </tr>
                    ) : adminOrdersError ? (
                      <tr>
                        <td colSpan="6">{adminOrdersError}</td>
                      </tr>
                    ) : adminOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6">No orders found.</td>
                      </tr>
                    ) : (
                      adminOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <div className="tracking-num-cell">
                              <PackageIcon
                                size={16}
                                style={{ color: "var(--color-primary)" }}
                              />
                              <span>{order.trackingNumber}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {order.customer?.fullName || "—"}
                          </td>
                          <td style={{ color: "var(--color-slate-600)" }}>
                            {order.dropoffLocation}
                          </td>
                          <td style={{ color: "var(--color-slate-600)" }}>
                            {order.courier?.fullName || "Unassigned"}
                          </td>
                          <td>{(order.status || "UNKNOWN").replaceAll("_", " ")}</td>
                          <td style={{ fontWeight: 600 }}>
                            {order.deliveryTime
                              ? new Date(order.deliveryTime).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}

        {/* CUSTOMER / USER DASHBOARD */}
        {role !== "COURIER" && role !== "ADMIN" && (
          <section>
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span className="role-badge-pill role-badge-customer">
                  <UserIcon size={16} />
                  <span>Customer Portal</span>
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-slate-500)",
                  }}
                >
                  Personal & Merchant Shipments
                </span>
              </div>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-slate-900)",
                }}
              >
                Welcome back, {displayName}!
              </h1>
              <p
                style={{
                  color: "var(--color-slate-500)",
                  fontSize: "0.9375rem",
                }}
              >
                Track your orders live and monitor incoming parcel deliveries
                in real time.
              </p>
            </div>

            <section className="tracking-hero-bar">
              <div className="tracking-hero-header">
                <h2>Track Your Shipments Live</h2>
                <p>
                  Real-time GPS dispatch and parcel milestones powered by
                  TrackFlow's express network.
                </p>
              </div>

              <form onSubmit={handleSearch} className="tracking-search-form">
                <div className="tracking-input-box">
                  <input
                    type="text"
                    className="tracking-input"
                    placeholder="Enter Tracking Number (e.g. BST-9842-EG)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="tracking-input-icon">
                    <SearchIcon size={20} />
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={<TruckIcon size={18} />}
                >
                  Track Parcel
                </Button>
              </form>

              <div className="quick-tags">
                <span>Try sample tracking numbers:</span>
                {SAMPLE_SHIPMENTS.map((shipment) => (
                  <button
                    type="button"
                    key={shipment.id}
                    className="quick-tag-chip"
                    onClick={() => {
                      setActiveTrackingId(shipment.id);
                      setSearchQuery(shipment.id);
                      setNotification(`Switched to shipment ${shipment.id}`);
                    }}
                  >
                    {shipment.id}
                  </button>
                ))}
              </div>
            </section>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>In Transit</h3>
                  <div className="stat-card-val">2</div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "var(--color-primary)" }}
                  >
                    <span>⚡ On route</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-red">
                  <TruckIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Arriving Today</h3>
                  <div className="stat-card-val">1</div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#d97706" }}
                  >
                    <span>● Out for delivery</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-amber">
                  <ClockIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Delivered</h3>
                  <div className="stat-card-val">18</div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#059669" }}
                  >
                    <span>✓ Completed</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <CheckCircleIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Saved Addresses</h3>
                  <div className="stat-card-val">3</div>
                  <div
                    className="stat-card-badge"
                    style={{ color: "#2563eb" }}
                  >
                    <span>Cairo & Alex</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <MapPinIcon size={24} />
                </div>
              </div>
            </div>

            <Card
              title="Your Booked Consignments"
              subtitle="Real orders created in your TrackFlow account"
              action={
                <Link to="/orders/new">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<PackageIcon size={16} />}
                  >
                    + New Booking
                  </Button>
                </Link>
              }
              style={{ marginBottom: 28 }}
            >
              {loadingOrders ? (
                <div
                  style={{
                    padding: "24px 0",
                    textAlign: "center",
                    color: "var(--color-slate-500)",
                  }}
                >
                  <div
                    className="btn-spinner"
                    style={{
                      width: 24,
                      height: 24,
                      margin: "0 auto 8px",
                    }}
                  />
                  <span>Loading your booked orders...</span>
                </div>
              ) : myOrders.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {myOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
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
                          <PackageIcon size={18} />
                        </div>

                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 800,
                                fontSize: "1rem",
                                color: "var(--color-slate-900)",
                              }}
                            >
                              {order.trackingNumber}
                            </span>
                            <Badge
                              variant={
                                order.status === "DELIVERED"
                                  ? "delivered"
                                  : order.status === "CANCELLED"
                                    ? "brand"
                                    : "pending"
                              }
                              dot={order.status !== "CANCELLED"}
                            >
                              {order.status}
                            </Badge>
                          </div>

                          <div
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-slate-500)",
                              marginTop: 4,
                            }}
                          >
                            From <strong>{order.pickupLocation}</strong> ➔ To{" "}
                            <strong>{order.dropoffLocation}</strong>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details ➔
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <PackageIcon
                    size={36}
                    style={{
                      color: "var(--color-slate-300)",
                      margin: "0 auto 10px",
                    }}
                  />
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--color-slate-700)",
                    }}
                  >
                    No orders booked yet
                  </div>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-slate-500)",
                      marginTop: 4,
                      marginBottom: 16,
                    }}
                  >
                    Book your first parcel pickup and delivery in under 1
                    minute.
                  </p>
                  <Link to="/orders/new">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<PackageIcon size={16} />}
                    >
                      Book Your First Order
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            <section className="tracking-timeline-card">
              <div className="timeline-header">
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--color-slate-900)",
                      }}
                    >
                      {activeShipment.id}
                    </span>
                    <Badge variant={activeShipment.status} dot={true}>
                      {activeShipment.statusLabel}
                    </Badge>
                  </div>
                  <p
                    style={{
                      color: "var(--color-slate-500)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Recipient: <strong>{activeShipment.recipient}</strong> •
                    Destination: <strong>{activeShipment.city}</strong>
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-slate-500)",
                      fontWeight: 600,
                    }}
                  >
                    ESTIMATED ARRIVAL
                  </div>
                  <div
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "var(--color-slate-900)",
                    }}
                  >
                    {activeShipment.eta}
                  </div>
                </div>
              </div>

              <div className="timeline-stepper">
                {activeShipment.steps.map((step, index) => {
                  const isCompleted = index < activeShipment.currentStep;
                  const isActive = index === activeShipment.currentStep;
                  const stepStatusClass = isCompleted
                    ? "completed"
                    : isActive
                      ? "active"
                      : "upcoming";

                  return (
                    <div
                      key={step.title}
                      className={`timeline-step ${stepStatusClass}`}
                    >
                      <div className="step-node">
                        {isCompleted ? "✓" : isActive ? "●" : index + 1}
                      </div>
                      <div className="step-title">{step.title}</div>
                      <div className="step-subtitle">
                        <div>{step.time}</div>
                        <div
                          style={{
                            color: "var(--color-slate-400)",
                            marginTop: 2,
                          }}
                        >
                          {step.location}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <Card
              title="My Orders & Shipments"
              subtitle="Latest orders shipped to or from your account."
            >
              <div className="table-responsive">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>Tracking ID</th>
                      <th>Recipient</th>
                      <th>Destination</th>
                      <th>Assigned Courier</th>
                      <th>Status</th>
                      <th>ETA</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_SHIPMENTS.map((shipment) => (
                      <tr key={shipment.id}>
                        <td>
                          <div className="tracking-num-cell">
                            <PackageIcon
                              size={16}
                              style={{ color: "var(--color-primary)" }}
                            />
                            <span>{shipment.id}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {shipment.recipient}
                        </td>
                        <td style={{ color: "var(--color-slate-600)" }}>
                          {shipment.city}
                        </td>
                        <td style={{ color: "var(--color-slate-600)" }}>
                          {shipment.courier}
                        </td>
                        <td>
                          <Badge variant={shipment.status} dot={true}>
                            {shipment.statusLabel}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 600 }}>{shipment.eta}</td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant={
                              activeTrackingId === shipment.id
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              setActiveTrackingId(shipment.id);
                              setSearchQuery(shipment.id);
                              setNotification(
                                `Viewing detailed tracking for ${shipment.id}`
                              );
                            }}
                          >
                            {activeTrackingId === shipment.id
                              ? "Viewing"
                              : "Track"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
} 
