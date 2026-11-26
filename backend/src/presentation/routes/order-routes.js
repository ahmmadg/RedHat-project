import { Router } from "express";
import {
  createOrder,
  getOrderById,
  cancelOrder,
  trackOrderByNumber,
  getMyOrders,
} from "../controllers/order-controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { validateBody } from "../middlewares/validate-body.js";
import { createOrderSchema } from "../validators/create-order-schema.js";

const router = Router();

// Public Live Tracking Lookup by tracking number or order ID
router.get("/track/:trackingNumber", trackOrderByNumber);

// Customer's list of their created orders
router.get("/my-orders", requireAuth, getMyOrders);

// Feature #4: Create Order API
router.post("/", requireAuth, validateBody(createOrderSchema), createOrder);

// Feature #6: Retrieve details for a specific order
router.get("/:id", requireAuth, getOrderById);

// Feature #6: Cancel pending order
router.patch("/:id/cancel", requireAuth, cancelOrder);

export default router;
