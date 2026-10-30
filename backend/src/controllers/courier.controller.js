const { randomUUID } = require("crypto");
const prisma = require("../config/prisma");

// allowed status transitions for the courier
const NEXT = {
  PENDING: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

const orderSummary = (o) => ({
  id: o.id,
  status: o.status,
  courierResponse: o.courierResponse,
  courierId: o.courierId,
});

async function loadOwnOrder(req, res) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return null;
  }
  if (order.courierId !== req.userId) {
    res.status(403).json({ error: "This order is not assigned to you" });
    return null;
  }
  return order;
}

exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { courierId: req.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        trackingNumber: true,
        pickupLocation: true,
        dropoffLocation: true,
        packageDetails: true,
        status: true,
        courierResponse: true,
        deliveryTime: true,
        User_Order_customerIdToUser: { select: { fullName: true, phone: true } },
      },
    });
    res.json({
      orders: orders.map(({ User_Order_customerIdToUser, ...o }) => ({
        ...o,
        customer: User_Order_customerIdToUser,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const order = await loadOwnOrder(req, res);
    if (!order) return;
    if (order.status !== "PENDING" || order.courierResponse !== "PENDING")
      return res.status(400).json({ error: "Order cannot be accepted" });

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { courierResponse: "ACCEPTED", updatedAt: new Date() },
      });
      await tx.orderStatusHistory.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          status: o.status,
          note: "Accepted by courier",
          changedById: req.userId,
        },
      });
      return o;
    });
    res.json({ message: "Order accepted", order: orderSummary(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.declineOrder = async (req, res) => {
  try {
    const order = await loadOwnOrder(req, res);
    if (!order) return;
    if (order.status !== "PENDING" || order.courierResponse !== "PENDING")
      return res.status(400).json({ error: "Order cannot be declined" });

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { courierResponse: "DECLINED", courierId: null, updatedAt: new Date() },
      });
      await tx.orderStatusHistory.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          status: o.status,
          note: "Declined by courier",
          changedById: req.userId,
        },
      });
      return o;
    });
    res.json({ message: "Order declined", order: orderSummary(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Feature #8 - PICKED_UP -> IN_TRANSIT -> DELIVERED
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const order = await loadOwnOrder(req, res);
    if (!order) return;
    if (order.courierResponse !== "ACCEPTED")
      return res.status(400).json({ error: "Accept the order first" });
    if (NEXT[order.status] !== status)
      return res.status(400).json({ error: "Invalid status transition" });

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: order.id },
        data: { status, updatedAt: new Date() },
      });
      await tx.orderStatusHistory.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          status,
          note: `Status changed from ${order.status} to ${status}`,
          changedById: req.userId,
        },
      });
      return o;
    });
    res.json({ message: "Status updated", order: orderSummary(updated) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
};
