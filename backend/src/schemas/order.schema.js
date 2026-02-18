import { z } from "zod";

export const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  deliveryAddress: z.string().optional(),
  items: z.array(
    z.object({
      food: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
    })
  ),
  totalAmount: z.number().positive(),
});
