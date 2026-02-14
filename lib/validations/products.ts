import { z } from "zod";
import { cuidSchema } from "./common";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  priceCents: z.number().int().min(0),
  categoryId: cuidSchema.optional().nullable(),
  costCents: z.number().int().min(0).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  priceCents: z.number().int().min(0).optional(),
  categoryId: cuidSchema.optional().nullable(),
  costCents: z.number().int().min(0).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listProductsQuerySchema = z.object({
  categoryId: cuidSchema.optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
