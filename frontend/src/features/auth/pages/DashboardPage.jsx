import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import Navbar from "../../../components/layout/Navbar";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import orderService from "../../orders/services/order-service";
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

const ADMIN_COURIERS = [
  {
    id: "courier-1",
    name: "Ahmed Tarek",
    phone: "01012345678",
    zone: "Nasr City & New Cairo",
    deliveredCount: 9,
    totalCount: 14,
    status: "active",
    statusLabel: "On Route",
  },
  {
    id: "courier-2",
    name: "Mahmoud Hassan",
    phone: "01198765432",
    zone: "Maadi & Helwan",
    deliveredCount: 12,
    totalCount: 15,
    status: "active",
    statusLabel: "On Route",
  },
  {
    id: "courier-3",
    name: "Karim Mostafa",
    phone: "01234567890",
    zone: "Dokki & Mohandessin",
    deliveredCount: 15,
    totalCount: 15,
    status: "completed",
    statusLabel: "Shift Completed",
  },
  {
    id: "courier-4",
    name: "Hossam Fikry",
    phone: "01055667788",
    zone: "Alexandria City Center",
    deliveredCount: 8,
    totalCount: 16,
    status: "active",
    statusLabel: "On Route",
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
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (role !== "COURIER" && role !== "ADMIN") {
      setLoadingOrders(true);
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

  const activeShipment =
    SAMPLE_SHIPMENTS.find((s) => s.id.toLowerCase() === activeTrackingId.toLowerCase()) ||
    SAMPLE_SHIPMENTS[0];

  function handleMarkDelivered(stopId) {
    setCourierStops((prev) =>
      prev.map((stop) => {
        if (stop.id === stopId) {
          return { ...stop, status: "delivered", statusLabel: "Delivered" };
        }
        return stop;
      })
    );
    setNotification(`Stop ${stopId} marked as successfully delivered! Proof of delivery recorded.`);
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // 1. First check if it matches a real live order in the database
    try {
      const liveRes = await orderService.trackOrder(query);
      if (liveRes?.data?.id) {
        navigate(`/orders/${liveRes.data.id}`);
        return;
      }
    } catch (err) {
      // Not in live DB, check sample shipments
    }

    // 2. Fall back to sample shipments
    const found = SAMPLE_SHIPMENTS.find((s) => s.id.toUpperCase().includes(query.toUpperCase()));
    if (found) {
      setActiveTrackingId(found.id);
      setNotification(`Tracking loaded for sample shipment ${found.id}`);
    } else {
      setNotification(`No consignment found matching '${query}'. Please check the tracking number.`);
    }
  }

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {notification && (
          <div
            className="form-alert form-alert-success"
            style={{ marginBottom: 24, display: "flex", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircleIcon size={18} />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            ROLE: COURIER DASHBOARD (Shown when user.role === "COURIER")
            ========================================================================= */}
        {role === "COURIER" && (
          <section>
            {/* Courier Welcome Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span className="role-badge-pill role-badge-courier">
                  <TruckIcon size={16} />
                  <span>Courier Operations Portal</span>
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--color-slate-500)" }}>
                  Zone 4 • Nasr City & New Cairo
                </span>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-slate-900)" }}>
                Welcome, {displayName}!
              </h1>
              <p style={{ color: "var(--color-slate-500)", fontSize: "0.9375rem" }}>
                Here is your live delivery manifest and run sheet for today's assigned route.
              </p>
            </div>

            {/* Courier KPI Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Assigned Stops</h3>
                  <div className="stat-card-val">{courierStops.length}</div>
                  <div className="stat-card-badge" style={{ color: "var(--color-primary)" }}>
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
                    {courierStops.filter((s) => s.status === "delivered").length}
                  </div>
                  <div className="stat-card-badge" style={{ color: "#059669" }}>
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
                    {courierStops.filter((s) => s.status !== "delivered").length}
                  </div>
                  <div className="stat-card-badge" style={{ color: "#d97706" }}>
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
                  <div className="stat-card-val" style={{ fontSize: "1.6rem" }}>
                    EGP 1,960
                  </div>
                  <div className="stat-card-badge" style={{ color: "#2563eb" }}>
                    <span>Cash on Delivery</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <PackageIcon size={24} />
                </div>
              </div>
            </div>

            {/* Courier Action Bar */}
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
                  onClick={() => setNotification("Optimized route calculated via GPS navigation.")}
                >
                  Optimize Route Sequence
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotification("Camera barcode scanner initiated.")}
                >
                  📷 Scan Package Barcode
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotification("Contacting dispatch hub coordinator...")}
                >
                  📞 Call Hub Dispatch
                </Button>
              </div>

              <Badge variant="in-transit" dot={true}>
                GPS Live Tracking Active
              </Badge>
            </div>

            {/* Courier Daily Run Sheet */}
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
                        isCurrent ? "current-stop" : isDelivered ? "completed-stop" : ""
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
                              isDelivered ? "delivered" : isCurrent ? "in-transit" : "pending"
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

                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                          <span className="stop-cod-pill">{stop.cod}</span>
                          <span style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)" }}>
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
                            setNotification(`Calling recipient ${stop.customer} (${stop.phone})...`)
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

        {/* =========================================================================
            ROLE: ADMIN DASHBOARD (Shown when user.role === "ADMIN")
            ========================================================================= */}
        {role === "ADMIN" && (
          <section>
            {/* Admin Welcome Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span className="role-badge-pill role-badge-admin">
                  <BarChartIcon size={16} />
                  <span>Central Operations Console</span>
                </span>
                <Badge variant="brand" dot={false}>
                  Full Admin Privileges
                </Badge>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-slate-900)" }}>
                Logistics Command Center
              </h1>
              <p style={{ color: "var(--color-slate-500)", fontSize: "0.9375rem" }}>
                Logged in as <strong>{displayName}</strong>. Real-time overview of active couriers, regional hubs, and consignment performance.
              </p>
            </div>

            {/* Admin Network KPI Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Network Shipments</h3>
                  <div className="stat-card-val">1,482</div>
                  <div className="stat-card-badge" style={{ color: "var(--color-primary)" }}>
                    <span>Active today</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-red">
                  <PackageIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Active Couriers</h3>
                  <div className="stat-card-val">48</div>
                  <div className="stat-card-badge" style={{ color: "#059669" }}>
                    <span>Dispatched in field</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <TruckIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Hub Throughput</h3>
                  <div className="stat-card-val">99.4%</div>
                  <div className="stat-card-badge" style={{ color: "#2563eb" }}>
                    <span>On-time SLA</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <BarChartIcon size={24} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>Regional Hubs</h3>
                  <div className="stat-card-val">14 / 14</div>
                  <div className="stat-card-badge" style={{ color: "#059669" }}>
                    <span>All hubs operational</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-green">
                  <MapPinIcon size={24} />
                </div>
              </div>
            </div>

            {/* Admin Management Toolbar */}
            <Card
              title="Fleet & Hub Operations Controls"
              subtitle="Execute high-level consignment assignments, fleet dispatching, and system reports."
              className="mb-6"
            >
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setNotification("New consignment batch modal opened.")}
                >
                  + Create Regional Consignment Batch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotification("Courier fleet metrics refreshed.")}
                >
                  Reassign Courier Routes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotification("Exporting delivery SLA reports to CSV.")}
                >
                  Export Monthly SLA Report
                </Button>
              </div>
            </Card>

            {/* Live Couriers Roster Table */}
            <Card
              title="Active Courier Fleet"
              subtitle="Monitoring assigned couriers, route completion rates, and active delivery zones."
              className="mb-6"
            >
              <div className="table-responsive">
                <table className="tracking-table">
                  <thead>
                    <tr>
                      <th>Courier Name</th>
                      <th>Assigned Zone</th>
                      <th>Contact</th>
                      <th>Today's Progress</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ADMIN_COURIERS.map((courier) => (
                      <tr key={courier.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div className="user-avatar-initial" style={{ width: 28, height: 28, fontSize: "0.75rem" }}>
                              {courier.name[0]}
                            </div>
                            <span style={{ fontWeight: 700 }}>{courier.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--color-slate-600)" }}>{courier.zone}</td>
                        <td style={{ color: "var(--color-slate-600)" }}>{courier.phone}</td>
                        <td>
                          <strong>{courier.deliveredCount}</strong> / {courier.totalCount} stops
                        </td>
                        <td>
                          <span className={`fleet-status-pill ${courier.status === "active" ? "fleet-active" : "fleet-idle"}`}>
                            <span className="fleet-dot" />
                            <span>{courier.statusLabel}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNotification(`Viewing live GPS breadcrumb for ${courier.name}.`)}
                          >
                            Live Route
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Network Shipments Table */}
            <Card
              title="Global Network Shipments"
              subtitle="Latest package consignments across Cairo, Alexandria, and Giza hubs."
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
                    {SAMPLE_SHIPMENTS.map((shipment) => (
                      <tr key={shipment.id}>
                        <td>
                          <div className="tracking-num-cell">
                            <PackageIcon size={16} style={{ color: "var(--color-primary)" }} />
                            <span>{shipment.id}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{shipment.recipient}</td>
                        <td style={{ color: "var(--color-slate-600)" }}>{shipment.city}</td>
                        <td style={{ color: "var(--color-slate-600)" }}>{shipment.courier}</td>
                        <td>
                          <Badge variant={shipment.status} dot={true}>
                            {shipment.statusLabel}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 600 }}>{shipment.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        )}

        {/* =========================================================================
            ROLE: CUSTOMER / USER DASHBOARD (Shown when user.role === "USER")
            ========================================================================= */}
        {role !== "COURIER" && role !== "ADMIN" && (
          <section>
            {/* Customer Welcome Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span className="role-badge-pill role-badge-customer">
                  <UserIcon size={16} />
                  <span>Customer Portal</span>
                </span>
                <span style={{ fontSize: "0.875rem", color: "var(--color-slate-500)" }}>
                  Personal & Merchant Shipments
                </span>
              </div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-slate-900)" }}>
                Welcome back, {displayName}!
              </h1>
              <p style={{ color: "var(--color-slate-500)", fontSize: "0.9375rem" }}>
                Track your orders live and monitor incoming parcel deliveries in real time.
              </p>
            </div>

            {/* Customer Hero Quick-Track Search Bar */}
            <section className="tracking-hero-bar">
              <div className="tracking-hero-header">
                <h2>Track Your Shipments Live</h2>
                <p>
                  Real-time GPS dispatch and parcel milestones powered by TrackFlow's express network.
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

                <Button type="submit" variant="primary" size="lg" icon={<TruckIcon size={18} />}>
                  Track Parcel
                </Button>
              </form>

              <div className="quick-tags">
                <span>Try sample tracking numbers:</span>
                {SAMPLE_SHIPMENTS.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    className="quick-tag-chip"
                    onClick={() => {
                      setActiveTrackingId(s.id);
                      setSearchQuery(s.id);
                      setNotification(`Switched to shipment ${s.id}`);
                    }}
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </section>

            {/* Customer KPI Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-info">
                  <h3>In Transit</h3>
                  <div className="stat-card-val">2</div>
                  <div className="stat-card-badge" style={{ color: "var(--color-primary)" }}>
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
                  <div className="stat-card-badge" style={{ color: "#d97706" }}>
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
                  <div className="stat-card-badge" style={{ color: "#059669" }}>
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
                  <div className="stat-card-badge" style={{ color: "#2563eb" }}>
                    <span>Cairo & Alex</span>
                  </div>
                </div>
                <div className="stat-card-icon-box stat-icon-blue">
                  <MapPinIcon size={24} />
                </div>
              </div>
            </div>

            {/* Live Booked Deliveries Section */}
            <Card
              title="Your Booked Consignments"
              subtitle="Real orders created in your TrackFlow account"
              action={
                <Link to="/orders/new">
                  <Button variant="primary" size="sm" icon={<PackageIcon size={16} />}>
                    + New Booking
                  </Button>
                </Link>
              }
              style={{ marginBottom: 28 }}
            >
              {loadingOrders ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "var(--color-slate-500)" }}>
                  <div className="btn-spinner" style={{ width: 24, height: 24, margin: "0 auto 8px" }} />
                  <span>Loading your booked orders...</span>
                </div>
              ) : myOrders.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span
                              style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 800,
                                fontSize: "1rem",
                                color: "var(--color-slate-900)",
                              }}
                            >
                              {ord.trackingNumber}
                            </span>
                            <Badge
                              variant={
                                ord.status === "DELIVERED"
                                  ? "delivered"
                                  : ord.status === "CANCELLED"
                                  ? "brand"
                                  : "pending"
                              }
                              dot={ord.status !== "CANCELLED"}
                            >
                              {ord.status}
                            </Badge>
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 4 }}>
                            From <strong>{ord.pickupLocation}</strong> ➔ To <strong>{ord.dropoffLocation}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Link to={`/orders/${ord.id}`}>
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
                  <PackageIcon size={36} style={{ color: "var(--color-slate-300)", margin: "0 auto 10px" }} />
                  <div style={{ fontWeight: 700, color: "var(--color-slate-700)" }}>
                    No orders booked yet
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--color-slate-500)", marginTop: 4, marginBottom: 16 }}>
                    Book your first parcel pickup and delivery in under 1 minute.
                  </p>
                  <Link to="/orders/new">
                    <Button variant="primary" size="sm" icon={<PackageIcon size={16} />}>
                      Book Your First Order
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Active Shipment Milestone Stepper */}
            <section className="tracking-timeline-card">
              <div className="timeline-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
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
                  <p style={{ color: "var(--color-slate-500)", fontSize: "0.875rem" }}>
                    Recipient: <strong>{activeShipment.recipient}</strong> • Destination:{" "}
                    <strong>{activeShipment.city}</strong>
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-slate-500)", fontWeight: 600 }}>
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
                    <div key={step.title} className={`timeline-step ${stepStatusClass}`}>
                      <div className="step-node">
                        {isCompleted ? "✓" : isActive ? "●" : index + 1}
                      </div>
                      <div className="step-title">{step.title}</div>
                      <div className="step-subtitle">
                        <div>{step.time}</div>
                        <div style={{ color: "var(--color-slate-400)", marginTop: 2 }}>
                          {step.location}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Customer Shipments Table */}
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
                            <PackageIcon size={16} style={{ color: "var(--color-primary)" }} />
                            <span>{shipment.id}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{shipment.recipient}</td>
                        <td style={{ color: "var(--color-slate-600)" }}>{shipment.city}</td>
                        <td style={{ color: "var(--color-slate-600)" }}>{shipment.courier}</td>
                        <td>
                          <Badge variant={shipment.status} dot={true}>
                            {shipment.statusLabel}
                          </Badge>
                        </td>
                        <td style={{ fontWeight: 600 }}>{shipment.eta}</td>
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant={activeTrackingId === shipment.id ? "primary" : "outline"}
                            size="sm"
                            onClick={() => {
                              setActiveTrackingId(shipment.id);
                              setSearchQuery(shipment.id);
                              setNotification(`Viewing detailed tracking for ${shipment.id}`);
                            }}
                          >
                            {activeTrackingId === shipment.id ? "Viewing" : "Track"}
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
