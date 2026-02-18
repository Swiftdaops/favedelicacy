import { z } from "zod";

export const foodSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
  description: z.string().optional(),
});
