import prisma from "../infrastructure/database/prisma-client.js";

import { createPrismaUserRepository } from "../infrastructure/repositories/prisma-user-repository.js";
import { createPrismaOrderRepository } from "../infrastructure/repositories/prisma-order-repository.js";

import { createRegisterUser } from "../application/use-cases/auth/register-user.js";
import { createLoginUser } from "../application/use-cases/auth/login-user.js";

import { createCreateOrder } from "../application/use-cases/orders/create-order.js";
import { createGetOrder } from "../application/use-cases/orders/get-order.js";
import { createCancelOrder } from "../application/use-cases/orders/cancel-order.js";
import { createTrackOrder } from "../application/use-cases/orders/track-order.js";
import { createGetMyOrders } from "../application/use-cases/orders/get-my-orders.js";

import { createGetAllOrders } from "../application/use-cases/admin/get-all-orders.js";
import { createUpdateOrderStatus } from "../application/use-cases/admin/update-order-status.js";
import { createDeleteOrder } from "../application/use-cases/admin/delete-order.js";
import { createGetCouriers } from "../application/use-cases/admin/get-couriers.js";
import { createAssignCourier } from "../application/use-cases/admin/assign-courier.js";

import { createGetAssignedOrders } from "../application/use-cases/courier/get-assigned-orders.js";
import { createAcceptCourierOrder } from "../application/use-cases/courier/accept-order.js";
import { createDeclineCourierOrder } from "../application/use-cases/courier/decline-order.js";
import { createUpdateCourierOrderStatus } from "../application/use-cases/courier/update-order-status.js";

import { passwordHasher } from "../infrastructure/security/bcrypt-password-hasher.js";
import { tokenService } from "../infrastructure/security/jwt-token-service.js";
import { createGetCustomers } from "../application/use-cases/admin/get-customers.js";
import { createCreateOrderForCustomer } from "../application/use-cases/admin/create-order-for-customer.js";
const userRepository = createPrismaUserRepository(prisma);
const orderRepository = createPrismaOrderRepository(prisma);

// Auth use cases (Member 1)
export const registerUser = createRegisterUser(userRepository, passwordHasher);

export const loginUser = createLoginUser({
  userRepository,
  passwordHasher,
  tokenService,
});

// Order use cases (Member 2)
export const createOrderUseCase = createCreateOrder(orderRepository);
export const getOrderUseCase = createGetOrder(orderRepository);
export const cancelOrderUseCase = createCancelOrder(orderRepository);
export const trackOrderUseCase = createTrackOrder(orderRepository);
export const getMyOrdersUseCase = createGetMyOrders(orderRepository);

// Admin use cases (Member 4)
export const getAllOrdersUseCase =
  createGetAllOrders(orderRepository);

export const updateOrderStatusUseCase =
  createUpdateOrderStatus(orderRepository);

export const deleteOrderUseCase =
  createDeleteOrder(orderRepository);

export const getCouriersUseCase =
  createGetCouriers(userRepository);

export const assignCourierUseCase = createAssignCourier({
  orderRepository,
  userRepository,
});
export const getCustomersUseCase = createGetCustomers(userRepository);

export const createAdminOrderUseCase = createCreateOrderForCustomer({
  orderRepository,
  userRepository,
});

// Courier use cases (Member 3)
export const getAssignedOrdersUseCase =
  createGetAssignedOrders(orderRepository);

export const acceptCourierOrderUseCase =
  createAcceptCourierOrder(orderRepository);

export const declineCourierOrderUseCase =
  createDeclineCourierOrder(orderRepository);

export const updateCourierOrderStatusUseCase =
  createUpdateCourierOrderStatus(orderRepository);