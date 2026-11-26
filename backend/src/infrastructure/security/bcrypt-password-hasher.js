import bcrypt from "bcrypt";

export const passwordHasher = {
  async hash(plainPassword, saltRounds = 12) {
    return bcrypt.hash(plainPassword, saltRounds);
  },

  async compare(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};
