import { z } from "zod";

// Shared patterns
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$/;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(12, "Password cannot exceed 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

export const PurchaseSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  tierId: z.string().uuid("Invalid tier ID"),
});

export const WalletFundSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
});
