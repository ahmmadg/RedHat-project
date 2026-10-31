import { z } from "zod";

export const updateCourierOrderStatusSchema = z.object({
  status: z.enum(["PICKED_UP", "IN_TRANSIT", "DELIVERED"]),
});