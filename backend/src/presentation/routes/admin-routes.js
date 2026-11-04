import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { validateBody } from "../middlewares/validate-body.js";
import {
  updateOrderStatusSchema,
  assignCourierSchema,
  createAdminOrderSchema,
} from "../validators/admin-schemas.js";
import {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getCouriers,
  getCustomers,
  createOrderForCustomer,
  assignCourier,
} from "../controllers/admin-controller.js";

const router = Router();

router.use(requireAuth, authorizeRoles("ADMIN"));

router.get("/orders", getAllOrders);
router.post(
  "/orders",
  validateBody(createAdminOrderSchema),
  createOrderForCustomer
);

router.get("/couriers", getCouriers);
router.get("/customers", getCustomers);

router.patch(
  "/orders/:id",
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);

router.patch(
  "/orders/:id/assign",
  validateBody(assignCourierSchema),
  assignCourier
);

router.delete("/orders/:id", deleteOrder);

export default router;