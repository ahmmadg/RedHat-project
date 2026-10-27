export function createGetOrder(orderRepository) {
  return async function getOrder({ orderId, user }) {
    if (!orderId) {
      const error = new Error("Order ID is required.");
      error.statusCode = 400;
      throw error;
    }

    let order = await orderRepository.findById(orderId);

    if (!order) {
      order = await orderRepository.findByTrackingNumber(orderId);
    }

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    const isCustomer = order.customerId === user.id;
    const isAssignedCourier = order.courierId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isCustomer && !isAssignedCourier && !isAdmin) {
      const error = new Error("You do not have permission to view this order.");
      error.statusCode = 403;
      throw error;
    }

    return order;
  };
}
