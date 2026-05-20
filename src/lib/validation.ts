import { z } from "zod";

export const emailVerificationSchema = z.object({
  email: z.string().email(),
  orgSlug: z.string().min(1),
});

export const otpVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  orgSlug: z.string().min(1),
});

export const reportSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  formData: z.any().optional(),
  orgSlug: z.string().min(1),
  reporterEmail: z.string().email(),
});

export const trackingSchema = z.object({
  trackingCode: z.string().min(1),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const registerSchema = z.object({
  orgName: z.string().min(2).max(100),
  orgSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  domain: z.string().min(3),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
