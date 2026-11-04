export function createAssignCourier({ orderRepository, userRepository }) {
  return async function assignCourier({ orderId, courierId, changedById }) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    const courier = await userRepository.findById(courierId);

    if (!courier || courier.role !== "COURIER") {
      const error = new Error("Courier not found.");
      error.statusCode = 404;
      throw error;
    }

    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      const error = new Error(
        "A completed or cancelled order cannot be assigned."
      );
      error.statusCode = 400;
      throw error;
    }

    return orderRepository.assignCourier({
      orderId,
      courierId,
      changedById,
    });
  };
}