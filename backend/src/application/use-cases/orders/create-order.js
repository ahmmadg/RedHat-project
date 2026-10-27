import crypto from "crypto";
import { OrderStatus } from "../../../domain/enums/order-status.js";

function generateTrackingNumber() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `BST-${randomDigits}-${randomSuffix}`;
}

export function createCreateOrder(orderRepository) {
  return async function createOrder({
    customerId,
    pickupLocation,
    dropoffLocation,
    packageDetails,
    deliveryTime,
  }) {
    if (!customerId) {
      const error = new Error("Customer authentication required.");
      error.statusCode = 401;
      throw error;
    }

    const parsedDeliveryTime = new Date(deliveryTime);
    if (isNaN(parsedDeliveryTime.getTime())) {
      const error = new Error("Invalid delivery time format.");
      error.statusCode = 400;
      throw error;
    }

    let trackingNumber = generateTrackingNumber();
    let collisionCheck = await orderRepository.findByTrackingNumber(trackingNumber);
    while (collisionCheck) {
      trackingNumber = generateTrackingNumber();
      collisionCheck = await orderRepository.findByTrackingNumber(trackingNumber);
    }

    const newOrder = await orderRepository.create({
      trackingNumber,
      pickupLocation,
      dropoffLocation,
      packageDetails,
      deliveryTime: parsedDeliveryTime,
      status: OrderStatus.PENDING,
      customerId,
    });

    try {
      await orderRepository.createStatusHistory({
        orderId: newOrder.id,
        status: OrderStatus.PENDING,
        note: "Order placed by customer and pending courier dispatch.",
        changedById: customerId,
      });
    } catch (historyErr) {
      console.warn("Could not log initial order history:", historyErr.message);
    }

    return newOrder;
  };
}
