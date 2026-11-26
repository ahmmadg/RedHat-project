export function createGetAssignedOrders(orderRepository) {
  return async function getAssignedOrders(courierId) {
    if (!courierId) {
      const error = new Error("Courier authentication required.");
      error.statusCode = 401;
      throw error;
    }

    return orderRepository.findByCourierId(courierId);
  };
}