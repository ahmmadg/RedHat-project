export function createGetMyOrders(orderRepository) {
  return async function getMyOrders(userId) {
    if (!userId) {
      const error = new Error("User authentication required.");
      error.statusCode = 401;
      throw error;
    }

    return orderRepository.findByCustomerId(userId, 20);
  };
}
