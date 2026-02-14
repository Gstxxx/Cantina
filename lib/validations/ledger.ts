import { z } from "zod";
import { cuidSchema } from "./common";

export const createPaymentSchema = z.object({
  amountCents: z.number().int().min(1),
  unitId: cuidSchema.optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export const statementQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type StatementQuery = z.infer<typeof statementQuerySchema>;
