import { z } from "zod";
import { dateOnlySchema } from "./common";

export const cashDayQuerySchema = z.object({
  date: dateOnlySchema,
});

export const upsertCashDaySchema = z.object({
  date: dateOnlySchema,
  incomeCents: z.number().int().min(0).optional(),
  expenseCents: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export const closeCashDaySchema = z.object({
  date: dateOnlySchema,
});

export type CashDayQuery = z.infer<typeof cashDayQuerySchema>;
export type UpsertCashDayInput = z.infer<typeof upsertCashDaySchema>;
export type CloseCashDayInput = z.infer<typeof closeCashDaySchema>;
