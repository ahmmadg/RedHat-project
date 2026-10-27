import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import orderService from "../services/order-service";
import {
  PackageIcon,
  MapPinIcon,
  ClockIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TruckIcon,
  ShieldIcon,
} from "../../../components/ui/Icons";

function getTomorrowNoon() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(getTomorrowNoon);

  const [errors, setErrors] = useState({});
  const [alertError, setAlertError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!pickupLocation.trim()) {
      errs.pickupLocation = "Pickup location is required.";
    } else if (pickupLocation.trim().length < 3) {
      errs.pickupLocation = "Pickup location must be at least 3 characters.";
    }

    if (!dropoffLocation.trim()) {
      errs.dropoffLocation = "Drop-off location is required.";
    } else if (dropoffLocation.trim().length < 3) {
      errs.dropoffLocation = "Drop-off location must be at least 3 characters.";
    }

    if (!packageDetails.trim()) {
      errs.packageDetails = "Package details are required.";
    } else if (packageDetails.trim().length < 3) {
      errs.packageDetails = "Package details must be at least 3 characters.";
    }

    if (!deliveryTime) {
      errs.deliveryTime = "Requested delivery date and time is required.";
    } else {
      const selected = new Date(deliveryTime);
      if (isNaN(selected.getTime())) {
        errs.deliveryTime = "Please select a valid date and time.";
      }
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setAlertError("Please complete all required fields highlighted below before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    setAlertError("");
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlertError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        packageDetails: packageDetails.trim(),
        deliveryTime: new Date(deliveryTime).toISOString(),
      };

      const result = await orderService.createOrder(payload);
      const createdOrder = result.data;

      if (!createdOrder?.id) {
        throw new Error("Order creation succeeded but response was missing order ID.");
      }

      navigate(`/orders/${createdOrder.id}`, {
        state: {
          successMessage: `Order created successfully! Tracking Number: ${createdOrder.trackingNumber}`,
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((e) => e.message).join(", ")) ||
        err.message ||
        "Failed to create order. Please check that the backend server is running.";
      setAlertError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "var(--color-slate-500)" }}>
            <Link to="/dashboard" style={{ color: "var(--color-slate-600)", fontWeight: 500 }}>
              Dashboard
            </Link>
            <span>/</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>Create New Order</span>
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Badge variant="brand" dot={false}>
              Express Booking
            </Badge>
            <span style={{ fontSize: "0.875rem", color: "var(--color-slate-500)" }}>
              Door-to-Door Delivery
            </span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-slate-900)" }}>
            Book a Package Delivery
          </h1>
          <p style={{ color: "var(--color-slate-500)", fontSize: "0.9375rem" }}>
            Enter your pickup, drop-off, and parcel details. A courier will be assigned to collect and deliver your package.
          </p>
        </div>

        {/* Prominent Error Alert */}
        {alertError && (
          <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 24 }}>
            <AlertCircleIcon size={20} />
            <span>{alertError}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 28, alignItems: "start" }}>
          {/* Main Booking Form */}
          <Card
            title="Consignment Details"
            subtitle="Please complete all required fields below."
          >
            <form onSubmit={handleSubmit} noValidate>
              {/* Pickup Location */}
              <Input
                id="pickupLocation"
                label="Pickup Location (Merchant / Sender Address)"
                type="text"
                value={pickupLocation}
                onChange={(e) => {
                  setPickupLocation(e.target.value);
                  if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: "" }));
                }}
                placeholder="e.g. 14 Abbas El Akkad, Nasr City, Cairo"
                icon={<MapPinIcon size={18} />}
                required
                error={errors.pickupLocation}
                hint="Specify street name, building number, and landmark."
              />

              {/* Drop-off Location */}
              <Input
                id="dropoffLocation"
                label="Drop-off Location (Customer Destination)"
                type="text"
                value={dropoffLocation}
                onChange={(e) => {
                  setDropoffLocation(e.target.value);
                  if (errors.dropoffLocation) setErrors((prev) => ({ ...prev, dropoffLocation: "" }));
                }}
                placeholder="e.g. Villa 22, Road 9, Maadi, Cairo"
                icon={<MapPinIcon size={18} />}
                required
                error={errors.dropoffLocation}
                hint="Ensure customer recipient address is complete."
              />

              {/* Package Details */}
              <div className="form-group">
                <label htmlFor="packageDetails" className="form-label">
                  <span>
                    Package Details & Contents{" "}
                    <span style={{ color: "var(--color-primary)" }}>*</span>
                  </span>
                </label>
                <div className="form-input-wrapper">
                  <textarea
                    id="packageDetails"
                    rows={4}
                    className="form-input has-icon"
                    style={{
                      height: "auto",
                      paddingTop: 12,
                      paddingBottom: 12,
                      resize: "vertical",
                      fontFamily: "inherit",
                      borderColor: errors.packageDetails ? "#ef4444" : undefined,
                    }}
                    value={packageDetails}
                    onChange={(e) => {
                      setPackageDetails(e.target.value);
                      if (errors.packageDetails) setErrors((prev) => ({ ...prev, packageDetails: "" }));
                    }}
                    placeholder="e.g. 2x Cotton T-shirts, Fragile glass container, Cash on Delivery: EGP 450"
                    required
                  />
                  <span
                    className="form-input-icon"
                    style={{ top: 14, alignItems: "flex-start" }}
                  >
                    <PackageIcon size={18} />
                  </span>
                </div>
                {errors.packageDetails ? (
                  <p className="form-error-text">
                    <AlertCircleIcon size={14} />
                    <span>{errors.packageDetails}</span>
                  </p>
                ) : (
                  <p className="form-hint">
                    Describe items, approximate weight, and any fragile or cash-on-delivery instructions.
                  </p>
                )}
              </div>

              {/* Delivery Time */}
              <Input
                id="deliveryTime"
                label="Requested Delivery Date & Time"
                type="datetime-local"
                value={deliveryTime}
                onChange={(e) => {
                  setDeliveryTime(e.target.value);
                  if (errors.deliveryTime) setErrors((prev) => ({ ...prev, deliveryTime: "" }));
                }}
                icon={<ClockIcon size={18} />}
                required
                error={errors.deliveryTime}
                hint="Expected arrival window for customer recipient."
              />

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 32, alignItems: "center" }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={<ArrowRightIcon size={18} />}
                >
                  {loading ? "Creating & Dispatching..." : "Create & Dispatch Order"}
                </Button>

                <Link to="/dashboard">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>

          {/* Right Information & Policy Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="How Order Booking Works">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    1
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Order Submitted</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                      A unique TrackFlow tracking number (`BST-XXXX-EG`) is instantly generated.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "#fef3c7",
                      color: "#b45309",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    2
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Courier Assignment</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                      Our hub dispatcher or courier accepts the shipment for pickup.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "#d1fae5",
                      color: "#047857",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    3
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Live GPS Delivery</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-slate-500)", marginTop: 2 }}>
                      Track status updates through Picked Up, In Transit, and Delivered.
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Order Policies">
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.8125rem", color: "var(--color-slate-600)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleIcon size={16} style={{ color: "#10b981" }} />
                  <span>Free cancellation while status is <strong>PENDING</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldIcon size={16} style={{ color: "var(--color-primary)" }} />
                  <span>Full parcel insurance up to EGP 5,000</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TruckIcon size={16} style={{ color: "#2563eb" }} />
                  <span>Doorstep pickup within 2 hours of dispatch</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
