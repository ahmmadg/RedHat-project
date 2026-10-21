import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(100),

  email: z.string().trim().email().transform((email) =>
    email.toLowerCase()
  ),

  phone: z.string().trim().optional(),

  password: z.string().min(8).max(72),
});