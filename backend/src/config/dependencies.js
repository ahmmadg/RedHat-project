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

import { passwordHasher } from "../infrastructure/security/bcrypt-password-hasher.js";
import { tokenService } from "../infrastructure/security/jwt-token-service.js";

// Repositories
const userRepository = createPrismaUserRepository(prisma);
const orderRepository = createPrismaOrderRepository(prisma);

// Auth use cases (Member 1)
export const registerUser = createRegisterUser(userRepository);
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