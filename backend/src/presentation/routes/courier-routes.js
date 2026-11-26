import { Router } from "express";
import { requireAuth } from "../middlewares/require-auth.js";
import { authorizeRoles } from "../middlewares/authorize-roles.js";
import { validateBody } from "../middlewares/validate-body.js";
import { updateCourierOrderStatusSchema } from "../validators/courier-schemas.js";
import {
  getAssignedOrders,
  acceptOrder,
  declineOrder,
  updateOrderStatus,
} from "../controllers/courier-controller.js";

const router = Router();

router.use(requireAuth, authorizeRoles("COURIER"));

router.get("/orders", getAssignedOrders);
router.patch("/orders/:id/accept", acceptOrder);
router.patch("/orders/:id/decline", declineOrder);
router.patch(
  "/orders/:id/status",
  validateBody(updateCourierOrderStatusSchema),
  updateOrderStatus
);

export default router;