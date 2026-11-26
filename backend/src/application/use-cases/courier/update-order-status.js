const NEXT_STATUS = {
  PENDING: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

export function createUpdateCourierOrderStatus(orderRepository) {
  return async function updateCourierOrderStatus({
    orderId,
    courierId,
    status,
  }) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    if (order.courierId !== courierId) {
      const error = new Error("This order is not assigned to you.");
      error.statusCode = 403;
      throw error;
    }

    if (order.courierResponse !== "ACCEPTED") {
      const error = new Error("Accept the order before updating its status.");
      error.statusCode = 400;
      throw error;
    }

    if (NEXT_STATUS[order.status] !== status) {
      const error = new Error("Invalid order status transition.");
      error.statusCode = 400;
      throw error;
    }

    return orderRepository.updateCourierOrderStatus({
      orderId,
      courierId,
      status,
    });
  };
}