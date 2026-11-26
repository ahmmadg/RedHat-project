import { createCreateOrder } from "../orders/create-order.js";

export function createCreateOrderForCustomer({
  orderRepository,
  userRepository,
}) {
  const createOrder = createCreateOrder(orderRepository);

  return async function createOrderForCustomer({
    customerId,
    createdById,
    pickupLocation,
    dropoffLocation,
    packageDetails,
    deliveryTime,
  }) {
    const customer = await userRepository.findById(customerId);

    if (!customer || customer.role !== "USER") {
      const error = new Error("Customer not found.");
      error.statusCode = 404;
      throw error;
    }

    return createOrder({
      customerId,
      createdById,
      createdByAdmin: true,
      pickupLocation,
      dropoffLocation,
      packageDetails,
      deliveryTime,
    });
  };
}