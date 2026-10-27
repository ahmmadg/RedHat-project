import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import orderService from "../services/order-service";
import "../orders.css";

function getDefaultDeliveryTime() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();

  // Form State
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [packageDetails, setPackageDetails] = useState("");
  const [deliveryTime, setDeliveryTime] = useState(getDefaultDeliveryTime);

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic order summary calculations (realistic logistics fee model)
  const estimatedWeight = packageDetails ? Math.min(10, Math.max(1, Math.round(packageDetails.length / 25))) : 1;
  const baseShippingFee = 45; // EGP standard intra-city base fee
  const weightFee = (estimatedWeight - 1) * 10;
  const totalEstimatedFee = baseShippingFee + weightFee;

  function validate() {
    const nextErrors = {};

    if (!pickupLocation.trim()) {
      nextErrors.pickupLocation = "Pickup address is required.";
    } else if (pickupLocation.trim().length < 3) {
      nextErrors.pickupLocation = "Please enter a valid address (min 3 characters).";
    }

    if (!dropoffLocation.trim()) {
      nextErrors.dropoffLocation = "Drop-off address is required.";
    } else if (dropoffLocation.trim().length < 3) {
      nextErrors.dropoffLocation = "Please enter a valid address (min 3 characters).";
    }

    if (!packageDetails.trim()) {
      nextErrors.packageDetails = "Please specify package contents.";
    } else if (packageDetails.trim().length < 3) {
      nextErrors.packageDetails = "Package description must be at least 3 characters.";
    }

    if (!deliveryTime) {
      nextErrors.deliveryTime = "Requested delivery time is required.";
    } else {
      const parsed = new Date(deliveryTime);
      if (isNaN(parsed.getTime())) {
        nextErrors.deliveryTime = "Please enter a valid date and time.";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError("Please check the highlighted fields below.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    setFormError("");
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        pickupLocation: pickupLocation.trim(),
        dropoffLocation: dropoffLocation.trim(),
        packageDetails: packageDetails.trim(),
        deliveryTime: new Date(deliveryTime).toISOString(),
      };

      const result = await orderService.createOrder(payload);
      const created = result.data;

      if (!created?.id) {
        throw new Error("Order was created but no order ID was returned.");
      }

      navigate(`/orders/${created.id}`, {
        state: {
          successMessage: `Shipment booked successfully. Tracking: ${created.trackingNumber}`,
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors &&
          err.response.data.errors.map((item) => item.message).join(", ")) ||
        err.message ||
        "Could not submit order. Please verify the backend is running.";
      setFormError(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <span style={{ color: "#0f172a", fontWeight: 600 }}>Create Order</span>
        </div>

        {/* Page Header */}
        <div className="order-page-header">
          <h1 className="order-page-title">New Shipment Booking</h1>
          <p className="order-page-desc">
            Fill in the pickup, destination, and package details to dispatch a courier.
          </p>
        </div>

        {/* Form Error Alert */}
        {formError && (
          <div className="form-alert form-alert-error" role="alert" style={{ marginBottom: 20 }}>
            <span>⚠️ {formError}</span>
          </div>
        )}

        <div className="order-layout-grid">
          {/* Main Form */}
          <Card>
            <form onSubmit={handleSubmit} noValidate>
              {/* Section 1: Pickup Location */}
              <div className="order-form-section">
                <div className="order-section-title">
                  <span>1. Pickup Details (Sender)</span>
                </div>
                <Input
                  id="pickupLocation"
                  label="Pickup Address"
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => {
                    setPickupLocation(e.target.value);
                    if (errors.pickupLocation) setErrors((prev) => ({ ...prev, pickupLocation: "" }));
                  }}
                  placeholder="e.g. 14 Abbas El Akkad, Nasr City, Cairo"
                  required
                  error={errors.pickupLocation}
                  hint="Building number, street, and area for courier pickup."
                />
              </div>

              {/* Section 2: Drop-off Location */}
              <div className="order-form-section">
                <div className="order-section-title">
                  <span>2. Delivery Destination (Recipient)</span>
                </div>
                <Input
                  id="dropoffLocation"
                  label="Drop-off Address"
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => {
                    setDropoffLocation(e.target.value);
                    if (errors.dropoffLocation) setErrors((prev) => ({ ...prev, dropoffLocation: "" }));
                  }}
                  placeholder="e.g. Villa 22, Road 9, Maadi, Cairo"
                  required
                  error={errors.dropoffLocation}
                  hint="Customer's delivery location."
                />
              </div>

              {/* Section 3: Package Details & Delivery Time */}
              <div className="order-form-section">
                <div className="order-section-title">
                  <span>3. Package & Delivery Window</span>
                </div>

                <div className="form-group">
                  <label htmlFor="packageDetails" className="form-label">
                    <span>
                      Package Contents & Notes <span style={{ color: "var(--color-primary)" }}>*</span>
                    </span>
                  </label>
                  <textarea
                    id="packageDetails"
                    rows={3}
                    className="form-input"
                    style={{
                      height: "auto",
                      padding: "10px 14px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      borderColor: errors.packageDetails ? "#dc2626" : undefined,
                    }}
                    value={packageDetails}
                    onChange={(e) => {
                      setPackageDetails(e.target.value);
                      if (errors.packageDetails) setErrors((prev) => ({ ...prev, packageDetails: "" }));
                    }}
                    placeholder="e.g. 2x Shirts, Fragile glass, COD: EGP 450"
                    required
                  />
                  {errors.packageDetails ? (
                    <p className="form-error-text">
                      <span>{errors.packageDetails}</span>
                    </p>
                  ) : (
                    <p className="form-hint">
                      Describe the items and any special delivery or Cash on Delivery instructions.
                    </p>
                  )}
                </div>

                <Input
                  id="deliveryTime"
                  label="Requested Delivery Time"
                  type="datetime-local"
                  value={deliveryTime}
                  onChange={(e) => {
                    setDeliveryTime(e.target.value);
                    if (errors.deliveryTime) setErrors((prev) => ({ ...prev, deliveryTime: "" }));
                  }}
                  required
                  error={errors.deliveryTime}
                  hint="Preferred arrival window."
                />
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Dispatching..." : "Confirm & Book Shipment"}
                </Button>
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <Button type="button" variant="outline" size="md">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>

          {/* Right Column: Real-time Live Shipment Summary */}
          <aside className="order-summary-card">
            <h3 className="order-summary-title">Shipment Summary</h3>

            {/* Live Route Preview */}
            <div className="summary-route-row">
              <div className="summary-route-point">
                <span className="summary-point-dot pickup" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>PICKUP</div>
                  <div style={{ fontWeight: 600, color: pickupLocation ? "#0f172a" : "#94a3b8" }}>
                    {pickupLocation || "Address not entered"}
                  </div>
                </div>
              </div>

              <div style={{ height: 12, borderLeft: "1.5px dashed #cbd5e1", marginLeft: 3 }} />

              <div className="summary-route-point">
                <span className="summary-point-dot dropoff" />
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>DROP-OFF</div>
                  <div style={{ fontWeight: 600, color: dropoffLocation ? "#0f172a" : "#94a3b8" }}>
                    {dropoffLocation || "Address not entered"}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Pricing Breakdown */}
            <div className="summary-fee-table">
              <div className="summary-fee-row">
                <span>Standard Delivery Fee</span>
                <span>EGP {baseShippingFee}.00</span>
              </div>
              <div className="summary-fee-row">
                <span>Estimated Weight</span>
                <span>~{estimatedWeight} kg</span>
              </div>
              {weightFee > 0 && (
                <div className="summary-fee-row">
                  <span>Heavy Weight Surcharge</span>
                  <span>EGP {weightFee}.00</span>
                </div>
              )}
              <div className="summary-fee-row total">
                <span>Total Estimated Cost</span>
                <span>EGP {totalEstimatedFee}.00</span>
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "16px 0 0 0" }}>
              Standard intra-city delivery. Orders can be cancelled for free while status is PENDING.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
