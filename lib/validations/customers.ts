import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listCustomersQuerySchema = z.object({
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  search: z.string().max(100).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
