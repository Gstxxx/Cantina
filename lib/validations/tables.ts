import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const updateTableSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
