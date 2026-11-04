export const OrderStatus = Object.freeze({
  PENDING: "PENDING",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
});

export const VALID_ORDER_STATUSES = Object.values(OrderStatus);
