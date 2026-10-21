import prisma from "../infrastructure/database/prisma-client.js";

import { createPrismaUserRepository } from "../infrastructure/repositories/prisma-user-repository.js";

import { createRegisterUser } from "../application/use-cases/auth/register-user.js";
import { createLoginUser } from "../application/use-cases/auth/login-user.js";

import { passwordHasher } from "../infrastructure/security/bcrypt-password-hasher.js";
import { tokenService } from "../infrastructure/security/jwt-token-service.js";

const userRepository = createPrismaUserRepository(prisma);

export const registerUser = createRegisterUser(userRepository);

export const loginUser = createLoginUser({
  userRepository,
  passwordHasher,
  tokenService,
});