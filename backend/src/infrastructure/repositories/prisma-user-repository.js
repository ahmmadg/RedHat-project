export function createPrismaUserRepository(prisma) {
  return {
    async findByEmail(email) {
      return prisma.user.findUnique({
        where: { email },
      });
    },

    async findById(id) {
      return prisma.user.findUnique({
        where: { id },
      });
    },

    async findCouriers() {
      return prisma.user.findMany({
        where: { role: "COURIER" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
        orderBy: { fullName: "asc" },
      });
    },

    async findCustomers() {
      return prisma.user.findMany({
        where: { role: "USER" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
        },
        orderBy: { fullName: "asc" },
      });
    },

    async create(userData) {
      return prisma.user.create({
        data: userData,
      });
    },
  };
}