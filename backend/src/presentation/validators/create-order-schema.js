import { z } from "zod";

export const createOrderSchema = z.object({
  pickupLocation: z
    .string({ required_error: "Pickup location is required" })
    .trim()
    .min(3, "Pickup location must be at least 3 characters")
    .max(300, "Pickup location is too long"),

  dropoffLocation: z
    .string({ required_error: "Drop-off location is required" })
    .trim()
    .min(3, "Drop-off location must be at least 3 characters")
    .max(300, "Drop-off location is too long"),

  packageDetails: z
    .string({ required_error: "Package details are required" })
    .trim()
    .min(3, "Package details must be at least 3 characters")
    .max(1000, "Package details cannot exceed 1000 characters"),

  deliveryTime: z
    .string({ required_error: "Delivery time is required" })
    .trim()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Delivery time must be a valid date and time"
    ),
});
