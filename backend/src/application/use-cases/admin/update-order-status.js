import { VALID_ORDER_STATUSES } from "../../../domain/enums/order-status.js";

export function createUpdateOrderStatus(orderRepository) {
  return async function updateOrderStatus({ orderId, status, changedById }) {
    if (!VALID_ORDER_STATUSES.includes(status)) {
      const error = new Error("Invalid order status.");
      error.statusCode = 400;
      throw error;
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
      const error = new Error("Order not found.");
      error.statusCode = 404;
      throw error;
    }

    return orderRepository.updateStatusWithHistory({
      orderId,
      status,
      changedById,
    });
  };
}