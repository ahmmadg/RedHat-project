import { OrderStatus } from "../../../domain/enums/order-status.js";

export function createCancelOrder(orderRepository) {
  return async function cancelOrder({ orderId, user }) {
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
    const isAdmin = user.role === "ADMIN";

    if (!isCustomer && !isAdmin) {
      const error = new Error("You do not have permission to cancel this order.");
      error.statusCode = 403;
      throw error;
    }

    if (order.status !== OrderStatus.PENDING) {
      const error = new Error(
        `Cannot cancel order with status '${order.status}'. Only pending orders can be cancelled.`
      );
      error.statusCode = 400;
      throw error;
    }

    const updatedOrder = await orderRepository.update(order.id, {
      status: OrderStatus.CANCELLED,
    });

    try {
      await orderRepository.createStatusHistory({
        orderId: order.id,
        status: OrderStatus.CANCELLED,
        note: `Order cancelled by ${user.role.toLowerCase()} (${user.id}).`,
        changedById: user.id,
      });
    } catch (historyErr) {
      console.warn("Could not log cancel order history:", historyErr.message);
    }

    return updatedOrder;
  };
}
