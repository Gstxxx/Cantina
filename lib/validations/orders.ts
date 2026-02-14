import { z } from "zod";
import { cuidSchema } from "./common";

const saleChannelSchema = z.enum(["COUNTER", "TABLE", "DELIVERY", "TAKEOUT", "OTHER"]);
const paymentTypeSchema = z.enum(["CASH", "PIX", "DEBIT", "CREDIT", "TRANSFER", "OTHER"]);

export const createOrderSchema = z.object({
  tableId: cuidSchema.optional().nullable(),
  customerId: cuidSchema.optional().nullable(),
  channel: saleChannelSchema.optional().default("COUNTER"),
  notes: z.string().max(500).optional().nullable(),
});

export const updateOrderSchema = z.object({
  tableId: cuidSchema.optional().nullable(),
  customerId: cuidSchema.optional().nullable(),
  channel: saleChannelSchema.optional(),
  notes: z.string().max(500).optional().nullable(),
  discountCents: z.number().int().min(0).optional(),
});

export const closeOrderSchema = z.object({
  paidType: paymentTypeSchema.optional().nullable(),
  paidCents: z.number().int().min(0).optional().nullable(),
  isOnCredit: z.boolean(),
});

export const addOrderItemSchema = z.object({
  productId: cuidSchema,
  qty: z.number().int().min(1),
  notes: z.string().max(200).optional().nullable(),
});

export const updateOrderItemSchema = z.object({
  qty: z.number().int().min(1).optional(),
  notes: z.string().max(200).optional().nullable(),
});

export const listOrdersQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["OPEN", "CLOSED", "CANCELED"]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CloseOrderInput = z.infer<typeof closeOrderSchema>;
export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
