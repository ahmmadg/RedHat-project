import bcrypt from "bcrypt";

export const passwordHasher = {
  async compare(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};