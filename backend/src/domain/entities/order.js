import { OrderStatus } from "../enums/order-status.js";

export default class Order {
  constructor({
    id,
    trackingNumber,
    pickupLocation,
    dropoffLocation,
    packageDetails,
    deliveryTime,
    status = OrderStatus.PENDING,
    courierResponse = "PENDING",
    customerId,
    courierId = null,
    createdAt,
    updatedAt,
    customer = null,
    courier = null,
    statusHistory = [],
  }) {
    this.id = id;
    this.trackingNumber = trackingNumber;
    this.pickupLocation = pickupLocation;
    this.dropoffLocation = dropoffLocation;
    this.packageDetails = packageDetails;
    this.deliveryTime = deliveryTime;
    this.status = status;
    this.courierResponse = courierResponse;
    this.customerId = customerId;
    this.courierId = courierId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.customer = customer;
    this.courier = courier;
    this.statusHistory = statusHistory;
  }
}
