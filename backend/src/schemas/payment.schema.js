import { z } from "zod";

export const paymentSchema = z.object({
  orderId: z.string(),
  customerName: z.string().min(2),
  amount: z.number().positive(),
});
