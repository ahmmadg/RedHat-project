import {
  createOrderUseCase,
  getOrderUseCase,
  cancelOrderUseCase,
  trackOrderUseCase,
  getMyOrdersUseCase,
} from "../../config/dependencies.js";

export async function createOrder(req, res, next) {
  try {
    const order = await createOrderUseCase({
      ...req.validatedBody,
      customerId: req.user.id,
    });

    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await getOrderUseCase({
      orderId: req.params.id,
      user: req.user,
    });

    return res.status(200).json({
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const order = await cancelOrderUseCase({
      orderId: req.params.id,
      user: req.user,
    });

    return res.status(200).json({
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function trackOrderByNumber(req, res, next) {
  try {
    const order = await trackOrderUseCase(req.params.trackingNumber);

    return res.status(200).json({
      message: "Consignment tracking retrieved",
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await getMyOrdersUseCase(req.user.id);

    return res.status(200).json({
      message: "Customer orders retrieved",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

