export function createDeleteOrder(orderRepository) {
  return async function deleteOrder(orderId) {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    await orderRepository.delete(orderId);
  };
}