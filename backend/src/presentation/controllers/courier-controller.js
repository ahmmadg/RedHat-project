import {
  getAssignedOrdersUseCase,
  acceptCourierOrderUseCase,
  declineCourierOrderUseCase,
  updateCourierOrderStatusUseCase,
} from "../../config/dependencies.js";

export async function getAssignedOrders(req, res, next) {
  try {
    const orders = await getAssignedOrdersUseCase(req.user.id);
    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
}

export async function acceptOrder(req, res, next) {
  try {
    const order = await acceptCourierOrderUseCase({
      orderId: req.params.id,
      courierId: req.user.id,
    });

    return res.status(200).json({
      message: "Order accepted.",
      order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function declineOrder(req, res, next) {
  try {
    const order = await declineCourierOrderUseCase({
      orderId: req.params.id,
      courierId: req.user.id,
    });

    return res.status(200).json({
      message: "Order declined.",
      order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const order = await updateCourierOrderStatusUseCase({
      orderId: req.params.id,
      courierId: req.user.id,
      status: req.validatedBody.status,
    });

    return res.status(200).json({
      message: "Order status updated.",
      order,
    });
  } catch (error) {
    return next(error);
  }
}