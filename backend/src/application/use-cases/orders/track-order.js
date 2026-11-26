export function createTrackOrder(orderRepository) {
  return async function trackOrder(query) {
    if (!query || typeof query !== "string") {
      const error = new Error("Tracking number or order ID is required.");
      error.statusCode = 400;
      throw error;
    }

    const trimmed = query.trim();

    // Check if query is a UUID format or tracking number
    let order = await orderRepository.findByTrackingNumber(trimmed);

    if (!order) {
      order = await orderRepository.findById(trimmed);
    }

    if (!order) {
      const error = new Error(`No consignment found with tracking reference '${trimmed}'.`);
      error.statusCode = 404;
      throw error;
    }

    return order;
  };
}
