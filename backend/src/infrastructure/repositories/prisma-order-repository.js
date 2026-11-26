export function createPrismaOrderRepository(prisma) {
  return {
    async findAll() {
      return prisma.order.findMany({
        orderBy: { createdAt: "desc" },
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

    async findByCourierId(courierId) {
      return prisma.order.findMany({
        where: { courierId },
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
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

    async updateStatusWithHistory({ orderId, status, changedById }) {
      return prisma.$transaction(async (transaction) => {
        const order = await transaction.order.update({
          where: { id: orderId },
          data: { status },
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

        await transaction.orderStatusHistory.create({
          data: {
            orderId,
            status,
            note: `Status changed to ${status} by admin`,
            changedById,
          },
        });

        return order;
      });
    },

    async assignCourier({ orderId, courierId, changedById }) {
      return prisma.$transaction(async (transaction) => {
        const order = await transaction.order.update({
          where: { id: orderId },
          data: {
            courierId,
            courierResponse: "PENDING",
          },
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

        await transaction.orderStatusHistory.create({
          data: {
            orderId,
            status: order.status,
            note: "Courier assigned or reassigned by admin",
            changedById,
          },
        });

        return order;
      });
    },

    async respondToCourierOrder({
      orderId,
      courierId,
      response,
      changedById,
    }) {
      return prisma.$transaction(async (transaction) => {
        const order = await transaction.order.update({
          where: { id: orderId, courierId },
          data: {
            courierResponse: response,
            ...(response === "DECLINED" ? { courierId: null } : {}),
          },
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
            courier: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        });

        await transaction.orderStatusHistory.create({
          data: {
            orderId,
            status: order.status,
            note:
              response === "ACCEPTED"
                ? "Accepted by courier"
                : "Declined by courier",
            changedById,
          },
        });

        return order;
      });
    },

    async updateCourierOrderStatus({ orderId, courierId, status }) {
      return prisma.$transaction(async (transaction) => {
        const order = await transaction.order.update({
          where: { id: orderId, courierId },
          data: { status },
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
            courier: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        });

        await transaction.orderStatusHistory.create({
          data: {
            orderId,
            status,
            note: `Status updated to ${status} by courier`,
            changedById: courierId,
          },
        });

        return order;
      });
    },

    async delete(id) {
      return prisma.order.delete({
        where: { id },
      });
    },

    async createStatusHistory(historyData) {
      return prisma.orderStatusHistory.create({
        data: historyData,
      });
    },
  };
} 