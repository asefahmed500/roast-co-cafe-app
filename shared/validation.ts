import { z } from "zod";

/** Validation is shared: the Worker validates requests, the app validates forms. */

export const emailSchema = z.email("Enter a valid email address").max(254);
export const passwordSchema = z
  .string("Enter your password")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2, "Enter your name").max(60),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
});

export const cartOptionsSchema = z.object({
  size: z.enum(["S", "M", "L"]),
  milk: z.enum(["Whole", "Oat", "Almond"]),
});

export const cartLineSchema = z.object({
  id: z.string().min(1).max(80),
  qty: z.number().int().min(0).max(99),
  note: z.string().max(120),
  options: cartOptionsSchema.optional(),
});

export const cartSchema = z.object({
  lines: z.array(cartLineSchema).max(50),
  promoCode: z.string().trim().max(24).nullable().optional(),
});

export const createOrderSchema = z.object({
  cafeId: z.string().min(1).max(80),
  mode: z.enum(["pickup", "dine"]),
  payment: z.enum(["bkash", "nagad", "card", "cash"]),
  timeSlot: z.enum(["ASAP", "15 min", "30 min"]),
  promoCode: z.string().trim().max(24).optional(),
  idempotencyKey: z.string().trim().max(80).optional(),
  items: z.array(cartLineSchema).min(1, "Your bag is empty").max(50),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateOrderSchemaInput = z.infer<typeof createOrderSchema>;
