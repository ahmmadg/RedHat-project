import {
  getAllOrdersUseCase,
  updateOrderStatusUseCase,
  deleteOrderUseCase,
  getCouriersUseCase,
  getCustomersUseCase,
  createAdminOrderUseCase,
  assignCourierUseCase,
} from "../../config/dependencies.js";

export async function getAllOrders(req, res, next) {
  try {
    const orders = await getAllOrdersUseCase();
    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const order = await updateOrderStatusUseCase({
      orderId: req.params.id,
      status: req.validatedBody.status,
      changedById: req.user.id,
    });

    return res.status(200).json({
      message: "Order updated.",
      order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    await deleteOrderUseCase(req.params.id);

    return res.status(200).json({
      message: "Order deleted.",
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCouriers(req, res, next) {
  try {
    const couriers = await getCouriersUseCase();
    return res.status(200).json({ couriers });
  } catch (error) {
    return next(error);
  }
}

export async function getCustomers(req, res, next) {
  try {
    const customers = await getCustomersUseCase();
    return res.status(200).json({ customers });
  } catch (error) {
    return next(error);
  }
}

export async function createOrderForCustomer(req, res, next) {
  try {
    const order = await createAdminOrderUseCase({
      ...req.validatedBody,
      createdById: req.user.id,
    });

    return res.status(201).json({
      message: "Order created successfully for customer.",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
}

export async function assignCourier(req, res, next) {
  try {
    const order = await assignCourierUseCase({
      orderId: req.params.id,
      courierId: req.validatedBody.courierId,
      changedById: req.user.id,
    });

    return res.status(200).json({
      message: "Courier assigned.",
      order,
    });
  } catch (error) {
    return next(error);
  }
}