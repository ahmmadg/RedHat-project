const prisma = require("../config/prisma");

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        pickupLocation: true,
        dropoffLocation: true,
        status: true,
        courierResponse: true,
        deliveryTime: true,
        createdAt: true,
      },
    });
    res.json({ orders });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};
