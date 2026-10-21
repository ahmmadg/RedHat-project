export function createPrismaUserRepository(prisma) {
  return {
    async findByEmail(email) {
      return prisma.user.findUnique({
        where: { email },
      });
    },

    async create(userData) {
      return prisma.user.create({
        data: userData,
      });
    },
  };
}