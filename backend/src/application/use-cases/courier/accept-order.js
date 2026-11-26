export function createAcceptCourierOrder(orderRepository) {
  return async function acceptCourierOrder({ orderId, courierId }) {
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

    if (order.status !== "PENDING" || order.courierResponse !== "PENDING") {
      const error = new Error("This order cannot be accepted.");
      error.statusCode = 400;
      throw error;
    }

    return orderRepository.respondToCourierOrder({
      orderId,
      courierId,
      response: "ACCEPTED",
      changedById: courierId,
    });
  };
}