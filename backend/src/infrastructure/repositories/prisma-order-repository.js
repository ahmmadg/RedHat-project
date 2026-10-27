export function createPrismaOrderRepository(prisma) {
  return {
    async create(orderData) {
      return prisma.order.create({
        data: orderData,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      });
    },

    async findById(id) {
      return prisma.order.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    },

    async findByTrackingNumber(trackingNumber) {
      return prisma.order.findUnique({
        where: { trackingNumber },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              changedBy: {
                select: {
                  id: true,
                  fullName: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    },

    async findByCustomerId(customerId, limit = 10) {
      return prisma.order.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          courier: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
        },
      });
    },

    async update(id, updateData) {
      return prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          courier: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    },

    async createStatusHistory(historyData) {
      return prisma.orderStatusHistory.create({
        data: historyData,
      });
    },
  };
}
