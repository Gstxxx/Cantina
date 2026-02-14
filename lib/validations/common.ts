import { z } from "zod";

export const cuidSchema = z.string().min(1, "ID is required");

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const monthYearSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
