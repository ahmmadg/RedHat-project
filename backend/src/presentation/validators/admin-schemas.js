import { z } from "zod";
import { VALID_ORDER_STATUSES } from "../../domain/enums/order-status.js";
import { createOrderSchema } from "./create-order-schema.js";

export const updateOrderStatusSchema = z.object({
  status: z.enum(VALID_ORDER_STATUSES),
});

export const assignCourierSchema = z.object({
  courierId: z.string().uuid("Courier ID must be a valid ID."),
});

export const createAdminOrderSchema = createOrderSchema.extend({
  customerId: z.string().uuid("Select a valid customer."),
});